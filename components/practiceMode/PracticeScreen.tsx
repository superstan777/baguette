import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFlashcards } from "@/hooks/useFlashcards";
import React, { useRef, useState } from "react";
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

  // Ref do bezpośredniego sterowania animacjami na wątku UI
  const stackRef = useRef<any>(null);

  const {
    flashcards,
    currentIndex,
    lifetimeCount,
    showTranslation,
    setShowTranslation,
    handleCorrect,
    handleIncorrect,
  } = useFlashcards();

  const [errorCount, setErrorCount] = useState(0);

  const currentCard = flashcards[currentIndex];
  const nextCard = flashcards[currentIndex + 1];

  /**
   * Wywoływane po zakończeniu animacji wylotu (swipe) na ekranie.
   * Dzięki temu dane w React zmieniają się, gdy stara karta jest już niewidoczna.
   */
  const handleAnimationComplete = (success: boolean) => {
    if (success) {
      handleCorrect();
      setErrorCount(0);
    } else {
      handleIncorrect();
      setErrorCount(0);
    }
    // Po zmianie danych, CardsStack zresetuje pozycję nowej karty (useEffect wewnątrz)
  };

  const onMicResult = (isCorrect: boolean) => {
    if (isCorrect) {
      // Wydajemy rozkaz: "Leć w prawo" (UI Thread)
      stackRef.current?.swipeRight();
    } else {
      const newErrors = errorCount + 1;
      if (newErrors >= 3) {
        // Wydajemy rozkaz: "Leć w lewo" (UI Thread)
        stackRef.current?.swipeLeft();
      } else {
        setErrorCount(newErrors);
        // Wydajemy rozkaz: "Potrząśnij" (UI Thread)
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
