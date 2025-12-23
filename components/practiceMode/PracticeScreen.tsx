import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFlashcards } from "@/hooks/useFlashcards";
import { usePracticeActions } from "@/hooks/usePracticeActions";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardsStack } from "../practiceMode/CardsStack";

import { MicButton } from "./MicButton";
import { PracticeHeader } from "./PracticeHeader";

interface PracticeModeProps {
  isActive: boolean;
}

export function PracticeScreen({ isActive }: PracticeModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // 1. Pobieranie danych (tylko DB)
  const { flashcards, lifetimeCount, refresh } = useFlashcards();

  // 2. Lokalny stan UI sesji nauki
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [processingResult, setProcessingResult] = useState(false);

  // Ref do sterowania animacjami na wątku UI
  const stackRef = useRef<any>(null);

  const currentCard = flashcards[currentIndex];
  const nextCard = flashcards[currentIndex + 1] || flashcards[0]; // Zapętlenie lub następna

  // 3. Akcje praktyki (logika sukcesu/porażki)
  const { handleCorrect, handleIncorrect } = usePracticeActions({
    currentCard,
    refreshData: refresh,
    onSuccess: useCallback(() => {
      setShowTranslation(false);
      setErrorCount(0);
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
      setProcessingResult(false);
    }, [flashcards.length]),
    onFail: useCallback(() => {
      setShowTranslation(true);
      setProcessingResult(false);
    }, []),
  });

  /**
   * Wywoływane po zakończeniu animacji wylotu (swipe).
   * Teraz wywołuje akcje z hooka usePracticeActions.
   */
  const handleAnimationComplete = (success: boolean) => {
    if (success) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const onMicResult = (isCorrect: boolean) => {
    if (processingResult || !currentCard) return;

    if (isCorrect) {
      setProcessingResult(true);
      stackRef.current?.swipeRight();
    } else {
      const newErrors = errorCount + 1;
      if (newErrors >= 3) {
        setProcessingResult(true);
        stackRef.current?.swipeLeft();
      } else {
        setErrorCount(newErrors);
        stackRef.current?.shake();
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <PracticeHeader lifetimeCount={lifetimeCount} />

          {currentCard ? (
            <View style={styles.center}>
              <View style={styles.stackContainer}>
                <CardsStack
                  ref={stackRef}
                  currentCard={currentCard}
                  nextCard={nextCard}
                  showTranslation={showTranslation}
                  onToggleTranslation={() =>
                    setShowTranslation(!showTranslation)
                  }
                  onAnimationComplete={handleAnimationComplete}
                />
              </View>
              <MicButton isActive={isActive} onResult={onMicResult} />
            </View>
          ) : (
            <Text style={[styles.empty, { color: colors.text }]}>
              No flashcards yet
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    overflow: "visible",
  },
  stackContainer: {
    width: "100%",
    height: 400,
    overflow: "visible",
    zIndex: 10,
  },
  center: {
    alignItems: "center",
    gap: 40,
    overflow: "visible",
  },
  empty: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 18,
  },
});
