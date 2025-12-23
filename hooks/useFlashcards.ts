import {
  FlashcardInterface,
  getAllFlashcards,
  getLifetimeCount,
  initDatabase,
} from "@/utils/database";
import { useCallback, useEffect, useState } from "react";

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardInterface[]>([]);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await initDatabase();
      const cards = await getAllFlashcards();
      const count = await getLifetimeCount();
      setFlashcards(cards);
      setLifetimeCount(count);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    flashcards,
    lifetimeCount,
    isLoading,
    refresh: loadData,
  };
}
