import { addFlashcard } from "@/utils/database";
import { translateToFrench } from "@/utils/translation";
import { useState } from "react";

export function useAddFlashcard() {
  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState("Save");

  const handleSave = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;

    setIsSaving(true);
    setStatusText("Translating...");

    try {
      const translation = await translateToFrench(text.trim());

      await addFlashcard(text.trim(), translation);

      setStatusText("Saved!");
      setTimeout(() => setStatusText("Save"), 1500);
      return true; // Zwracamy sukces, aby komponent mógł wyczyścić input
    } catch (error) {
      console.error("Save error:", error);
      setStatusText("Error!");
      setTimeout(() => setStatusText("Save"), 2000);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSave,
    isSaving,
    statusText,
  };
}
