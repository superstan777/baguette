import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Flashcard } from "@/utils/database";

import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashcardCard } from "./FlashcardCard";
import { PracticeHeader } from "./PracticeHeader";
import { PracticeMicButton } from "./PracticeMicButton";

interface PracticeModeProps {
  currentCard?: Flashcard;
  lifetimeCount: number;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onPronunciationCorrect: () => void;
}

export function PracticeMode({
  currentCard,
  lifetimeCount,
  showTranslation,
  onToggleTranslation,
  onPronunciationCorrect,
}: PracticeModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <PracticeHeader lifetimeCount={lifetimeCount} />

          {currentCard ? (
            <View style={styles.center}>
              <FlashcardCard
                card={currentCard}
                showTranslation={showTranslation}
                onToggleTranslation={onToggleTranslation}
              />

              {/*
                Mic button jest teraz odpowiedzialny WYŁĄCZNIE
                za nagrywanie + waveform (Skia).
                Rozpoznawanie / walidacja możesz podpiąć później.
              */}
              <PracticeMicButton />

              {/*
                Jeśli chcesz w przyszłości:
                - tu możesz dodać feedback "Correct / Incorrect"
                - albo reakcję na zakończenie nagrywania
              */}
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
  },
  center: {
    alignItems: "center",
    gap: 24,
  },
  empty: {
    textAlign: "center",
    opacity: 0.7,
  },
});
