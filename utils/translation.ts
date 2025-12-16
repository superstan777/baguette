/**
 * Helper function to decode URL-encoded text
 */
function decodeUrlEncodedText(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  // First, try to decode all URL-encoded characters
  try {
    // Replace all %XX patterns with decoded characters
    let decoded = text;

    // Try full decodeURIComponent first
    try {
      decoded = decodeURIComponent(text);
    } catch (e) {
      // If that fails, manually replace common encodings
      decoded = text
        .replace(/%20/g, " ")
        .replace(/%2C/g, ",")
        .replace(/%21/g, "!")
        .replace(/%3F/g, "?")
        .replace(/%2E/g, ".")
        .replace(/%27/g, "'")
        .replace(/%22/g, '"')
        .replace(/%3A/g, ":")
        .replace(/%3B/g, ";")
        .replace(/%2F/g, "/")
        .replace(/%3D/g, "=")
        .replace(/%26/g, "&")
        .replace(/%25/g, "%")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%5B/g, "[")
        .replace(/%5D/g, "]")
        .replace(/%7B/g, "{")
        .replace(/%7D/g, "}");

      // Try to decode any remaining %XX patterns
      const percentPattern = /%([0-9A-F]{2})/gi;
      decoded = decoded.replace(percentPattern, (match, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return match;
        }
      });
    }

    return decoded;
  } catch (error) {
    console.warn("Failed to decode URL-encoded text:", error);
    return text;
  }
}

/**
 * Translation function using multiple APIs as fallback
 * Tries multiple free translation APIs to ensure reliable translation of phrases
 */
export async function translateToFrench(text: string): Promise<string> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Empty text provided");
  }

  // Try Google Translate first (most reliable for phrases)
  try {
    const encodedText = encodeURIComponent(trimmedText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodedText}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && Array.isArray(data[0])) {
        let translated = data[0]
          .map((item: any[]) => (item && item[0] ? item[0] : ""))
          .join("")
          .trim();

        // Decode any URL-encoded characters
        translated = decodeUrlEncodedText(translated);

        // Verify it's actually translated
        if (translated && translated !== trimmedText && translated.length > 0) {
          return translated;
        }
      }
    }
  } catch (error) {
    console.log("Google Translate failed, trying fallback...", error);
  }

  // Try multiple LibreTranslate endpoints
  const libreTranslateEndpoints = [
    "https://libretranslate.com/translate",
    "https://libretranslate.de/translate",
    "https://translate.argosopentech.com/translate",
  ];

  for (const endpoint of libreTranslateEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: trimmedText,
          source: "en",
          target: "fr",
          format: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText && data.translatedText.trim()) {
          let translated = data.translatedText.trim();
          // Decode any URL-encoded characters
          translated = decodeUrlEncodedText(translated);
          // Verify it's actually translated (not just the original text)
          if (translated !== trimmedText && translated.length > 0) {
            return translated;
          }
        }
      }
    } catch (error) {
      console.log(
        `LibreTranslate endpoint ${endpoint} failed, trying next...`,
        error
      );
      continue;
    }
  }

  // Fallback to MyMemory API with better handling
  try {
    const encodedText = encodeURIComponent(trimmedText);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|fr`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        let translatedText = data.responseData.translatedText;

        // Decode URL-encoded text
        translatedText = decodeUrlEncodedText(translatedText);

        const result = translatedText.trim();
        // Verify it's actually translated
        if (result && result !== trimmedText && result.length > 0) {
          return result;
        }
      }
    }
  } catch (error) {
    console.error("MyMemory API error:", error);
  }

  throw new Error(
    "Failed to translate. Please check your internet connection and try again."
  );
}
