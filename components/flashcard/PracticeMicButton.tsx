import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

// Optional integration with `react-native-voice`.
// In Expo Go the native module is not available, so we guard the require
// and gracefully disable voice recognition instead of crashing.
// Use `any` here so TypeScript doesn't require type declarations
// for `react-native-voice`.
let Voice: any | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore - optional dependency, may not be installed in all environments
  Voice =
    require("react-native-voice").default || require("react-native-voice");
} catch (e) {
  Voice = null;
}

interface PracticeMicButtonProps {
  language?: string;
  /** Text the user is expected to say (e.g. French side of the card). */
  expectedText?: string;
  /** Callback with spoken text and simple correctness flag. */
  onResult?: (spoken: string, isCorrect: boolean) => void;
}

export function PracticeMicButton({
  language = "fr-FR",
  expectedText,
  onResult,
}: PracticeMicButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const isVoiceAvailable = !!Voice;

  useEffect(() => {
    if (!Voice) {
      return;
    }

    Voice.onSpeechStart = () => {
      setIsBusy(false);
      setIsRecording(true);
    };

    Voice.onSpeechEnd = () => {
      setIsRecording(false);
    };

    Voice.onSpeechResults = (e: any) => {
      const spoken: string | undefined = e.value?.[0];
      if (!spoken) return;

      console.log("Speech result (raw):", spoken);

      let isCorrect = false;
      if (expectedText) {
        const normalize = (value: string) =>
          value
            .toLowerCase()
            .normalize("NFD")
            // remove diacritics
            .replace(/\p{Diacritic}/gu, "")
            // keep only letters, basic punctuation and spaces
            .replace(/[^a-zà-ÿœç'\s-]/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        isCorrect = normalize(spoken) === normalize(expectedText);
      }

      // Simple audio feedback for MVP
      try {
        Speech.stop();
        if (isCorrect) {
          Speech.speak("Correct", { language: "en-US" });
        } else {
          Speech.speak("Try again", { language: "en-US" });
        }
      } catch (e) {
        console.warn("Speech feedback error:", e);
      }

      if (onResult) {
        onResult(spoken, isCorrect);
      } else {
        console.log("Recognized speech:", spoken, "correct:", isCorrect);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.warn("Voice recognition error:", e);
      setIsRecording(false);
      setIsBusy(false);
    };

    return () => {
      Voice?.destroy()
        .then(Voice.removeAllListeners)
        .catch(() => {});
    };
  }, [onResult]);

  const startRecording = async () => {
    if (!Voice) {
      console.warn("react-native-voice is not available in this environment.");
      return;
    }
    if (isRecording) return;

    try {
      setIsBusy(true);
      await Voice.start(language);
    } catch (error) {
      console.warn("Voice start error:", error);
      setIsRecording(false);
    } finally {
      setIsBusy(false);
    }
  };

  const stopRecording = async () => {
    if (!Voice) {
      return;
    }
    if (!isRecording) return;

    try {
      setIsBusy(true);
      await Voice.stop();
    } catch (error) {
      console.warn("Voice stop error:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const backgroundColor = isRecording ? colors.tint + "40" : colors.tint + "20";

  return (
    <TouchableOpacity
      style={[styles.micButton, { backgroundColor }]}
      onPressIn={startRecording}
      onPressOut={stopRecording}
      disabled={isBusy || !isVoiceAvailable}
    >
      {isBusy ? (
        <ActivityIndicator color={colors.tint} />
      ) : (
        <IconSymbol
          name={isVoiceAvailable ? "mic.fill" : "mic.slash"}
          size={32}
          color={colors.tint}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
