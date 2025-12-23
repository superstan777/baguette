import FastTranslator from "fast-mlkit-translate-text";

/**
 * Tłumaczy tekst na hiszpański używając wyłącznie silnika offline.
 * Zakłada, że model został już pobrany przy starcie aplikacji.
 */
export async function translateToSpanish(text: string): Promise<string> {
  const trimmedText = text.trim();
  if (!trimmedText) throw new Error("Text is empty");

  try {
    // translate() wywołujemy po prepare(), które zrobimy w App.tsx
    const result = await FastTranslator.translate(trimmedText);

    if (result) {
      return result;
    }
    return trimmedText;
  } catch (error) {
    console.error("Offline translation error:", error);
    // Jeśli model nie jest gotowy, zwracamy oryginał, aby nie blokować zapisu
    return trimmedText;
  }
}

/**
 * Funkcja inicjalizująca modele przy starcie aplikacji
 */
export async function initializeTranslationModels() {
  try {
    console.log("Inicjalizacja modeli tłumaczeń...");
    await FastTranslator.prepare({
      source: "English",
      target: "Spanish",
      downloadIfNeeded: true, // Pobierze model tylko przy pierwszym uruchomieniu
    });
    console.log("Modele tłumaczeń gotowe do użycia.");
  } catch (error) {
    console.error("Błąd podczas pobierania modeli:", error);
  }
}
