import {
  addFlashcard,
  Flashcard,
  getAllFlashcards,
  getLifetimeCount,
  incrementLifetimeCount,
  initDatabase,
  updateFlashcardFail,
  updateFlashcardSuccess,
} from "@/utils/database";
import { translateToFrench } from "@/utils/translation";
import { useEffect, useState } from "react";

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const loadData = async () => {
    try {
      await initDatabase();
      const cards = await getAllFlashcards();
      const count = await getLifetimeCount();
      setFlashcards(cards);
      setLifetimeCount(count);
      if (cards.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCorrect = async () => {
    if (flashcards.length === 0 || !flashcards[currentIndex]) return;

    const currentCard = flashcards[currentIndex];
    await updateFlashcardSuccess(currentCard.id);
    await incrementLifetimeCount();
    const newCount = await getLifetimeCount();
    setLifetimeCount(newCount);
    setShowTranslation(false);

    // Move to next card
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
  };

  const handleIncorrect = async () => {
    if (flashcards.length === 0 || !flashcards[currentIndex]) return;

    const currentCard = flashcards[currentIndex];
    await updateFlashcardFail(currentCard.id);
    setShowTranslation(true);
  };

  const handleSave = async (
    text: string,
    autoTranslate: boolean
  ): Promise<void> => {
    if (!text.trim()) return;

    let translation = text.trim();

    if (autoTranslate) {
      try {
        translation = await translateToFrench(text.trim());
      } catch (error) {
        console.error("Translation error:", error);
        // Continue with original text if translation fails
      }
    }

    await addFlashcard(text.trim(), translation);
    await loadData();
    setShowTranslation(false);
    // Reset to first card or newly added card
    const cards = await getAllFlashcards();
    if (cards.length > 0) {
      setCurrentIndex(0);
    }
  };

  return {
    flashcards,
    currentIndex,
    lifetimeCount,
    showTranslation,
    setShowTranslation,
    handleCorrect,
    handleIncorrect,
    handleSave,
    loadData,
  };
}

