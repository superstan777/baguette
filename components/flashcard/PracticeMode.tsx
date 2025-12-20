import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Flashcard } from "@/utils/database";
import React from "react";
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
  isActive: boolean;
}

export function PracticeMode({
  currentCard,
  lifetimeCount,
  showTranslation,
  onToggleTranslation,
  isActive,
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
              <PracticeMicButton isActive={isActive} />
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
  center: { alignItems: "center", gap: 24 },
  empty: { textAlign: "center", opacity: 0.7 },
});
