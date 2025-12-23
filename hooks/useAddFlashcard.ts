import { addFlashcard } from "@/utils/database";
import { translateToSpanish } from "@/utils/translation";
import { useState } from "react";

export type StatusType = "idle" | "loading" | "success" | "error";

export function useAddFlashcard() {
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [statusText, setStatusText] = useState("Add");

  const isValidInput = (input: string): boolean => {
    const letterRegex = /\p{L}/u;
    return letterRegex.test(input);
  };

  const resetStatus = () => {
    if (statusType === "error" || statusType === "success") {
      setStatusType("idle");
      setStatusText("Add");
    }
  };

  const handleSave = async (text: string): Promise<boolean> => {
    const trimmedText = text.trim();
    if (!trimmedText) return false;

    if (!isValidInput(trimmedText)) {
      setStatusType("error");
      setStatusText("Invalid characters!");
      return false;
    }

    setStatusType("loading");
    setStatusText("Translating...");

    try {
      const translation = await translateToSpanish(trimmedText);

      if (translation.toLowerCase() === trimmedText.toLowerCase()) {
        setStatusType("error");
        setStatusText("Please enter a valid text");
        return false;
      }

      await addFlashcard(trimmedText, translation);

      setStatusType("success");
      setStatusText("Added!");

      setTimeout(() => {
        setStatusType("idle");
        setStatusText("Add");
      }, 1500);

      return true;
    } catch (error) {
      setStatusType("error");
      setStatusText("Error!");
      return false;
    }
  };

  return {
    handleSave,
    resetStatus,
    isSaving: statusType === "loading",
    statusText,
    statusType,
  };
}
