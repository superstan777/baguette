import {
  FlashcardInterface,
  incrementLifetimeCount,
  updateFlashcardFail,
  updateFlashcardSuccess,
} from "@/utils/database";
import { useCallback } from "react";

interface PracticeActionsProps {
  currentCard: FlashcardInterface | undefined;
  onSuccess: () => void;
  onFail: () => void;
  refreshData: () => Promise<void>;
}

export function usePracticeActions({
  currentCard,
  onSuccess,
  onFail,
  refreshData,
}: PracticeActionsProps) {
  const handleCorrect = useCallback(async () => {
    if (!currentCard) return;

    try {
      await updateFlashcardSuccess(currentCard.id);
      await incrementLifetimeCount();
      await refreshData(); // Odświeżamy statystyki w bazie
      onSuccess(); // Przesuwamy index lub czyścimy UI
    } catch (error) {
      console.error("Failed to update success:", error);
    }
  }, [currentCard, refreshData, onSuccess]);

  const handleIncorrect = useCallback(async () => {
    if (!currentCard) return;

    try {
      await updateFlashcardFail(currentCard.id);
      onFail(); // Pokazujemy tłumaczenie
    } catch (error) {
      console.error("Failed to update failure:", error);
    }
  }, [currentCard, onFail]);

  return {
    handleCorrect,
    handleIncorrect,
  };
}
