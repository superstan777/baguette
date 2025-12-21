import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFlashcards } from "@/hooks/useFlashcards";
import React, { useState } from "react";
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

  const onMicResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setErrorCount(0);
      handleCorrect();
    } else {
      const newErrors = errorCount + 1;
      if (newErrors >= 3) {
        setErrorCount(0);
        handleIncorrect();
      } else {
        setErrorCount(newErrors);
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
              <CardsStack
                currentCard={currentCard}
                nextCard={nextCard}
                showTranslation={showTranslation}
                onToggleTranslation={() => setShowTranslation(!showTranslation)}
              />
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
  root: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  center: { alignItems: "center", gap: 40 },
  empty: { textAlign: "center", opacity: 0.7 },
});
