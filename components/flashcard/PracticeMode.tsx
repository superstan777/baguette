import { FlashcardCard } from "@/components/flashcard/FlashcardCard";
import { PracticeHeader } from "@/components/flashcard/PracticeHeader";
import { PracticeMicButton } from "@/components/flashcard/PracticeMicButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Flashcard } from "@/utils/database";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PracticeModeProps {
  currentCard: Flashcard | undefined;
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
    <View
      style={[styles.modeContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.practiceContainer}>
          <PracticeHeader lifetimeCount={lifetimeCount} />

          {/* Flashcard */}
          {currentCard ? (
            <View style={styles.flashcardContainer}>
              <FlashcardCard
                card={currentCard}
                showTranslation={showTranslation}
                onToggleTranslation={onToggleTranslation}
              />

              <PracticeMicButton
                language="fr-FR"
                expectedText={currentCard.translation}
                onResult={(spoken, isCorrect) => {
                  console.log(
                    "Recognized speech:",
                    spoken,
                    "correct:",
                    isCorrect
                  );
                  if (isCorrect) {
                    onPronunciationCorrect();
                  }
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No flashcards yet. Swipe up with two fingers to add one!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modeContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  practiceContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  flashcardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
});
