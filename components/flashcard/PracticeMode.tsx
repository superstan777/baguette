import { Button } from "@/components/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Flashcard } from "@/utils/database";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PracticeModeProps {
  currentCard: Flashcard | undefined;
  lifetimeCount: number;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function PracticeMode({
  currentCard,
  lifetimeCount,
  showTranslation,
  onToggleTranslation,
  onCorrect,
  onIncorrect,
}: PracticeModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[styles.modeContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.practiceContainer}>
          {/* Lifetime Counter */}
          <View style={styles.counterContainer}>
            <Text style={[styles.counterLabel, { color: colors.text }]}>
              Lifetime: {lifetimeCount}
            </Text>
          </View>

          {/* Flashcard */}
          {currentCard ? (
            <View style={styles.flashcardContainer}>
              <TouchableOpacity
                onPress={onToggleTranslation}
                activeOpacity={0.8}
                style={[
                  styles.flashcard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.icon + "40",
                  },
                ]}
              >
                <Text style={[styles.flashcardText, { color: colors.text }]}>
                  {currentCard.text}
                </Text>
                {showTranslation && (
                  <View style={styles.translationContainer}>
                    <Text
                      style={[styles.translationText, { color: colors.icon }]}
                    >
                      {currentCard.translation}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Microphone Button Placeholder */}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: colors.tint + "20" },
                ]}
                onPress={() => {
                  // Placeholder for speech recognition
                  console.log("Microphone pressed");
                }}
              >
                <IconSymbol name="mic.fill" size={32} color={colors.tint} />
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Incorrect"
                  onPress={onIncorrect}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <Button
                  title="Correct"
                  onPress={onCorrect}
                  variant="primary"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No flashcards yet. Swipe up to add one!
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
  counterContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  flashcardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  flashcard: {
    width: "100%",
    minHeight: 200,
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flashcardText: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  translationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    width: "100%",
  },
  translationText: {
    fontSize: 24,
    fontStyle: "italic",
    textAlign: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  actionButton: {
    flex: 1,
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

