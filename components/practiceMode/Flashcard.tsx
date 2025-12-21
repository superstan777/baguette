import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { FlashcardInterface } from "@/utils/database";
import * as Speech from "expo-speech";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FlashcardCardProps {
  card: FlashcardInterface;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export function Flashcard({
  card,
  showTranslation,
  onToggleTranslation,
}: FlashcardCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const flip = useSharedValue(showTranslation ? 1 : 0);

  useEffect(() => {
    flip.value = withTiming(showTranslation ? 1 : 0, { duration: 220 });
  }, [showTranslation, flip]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 800 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [-180, 0]);
    return {
      transform: [{ perspective: 800 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggleTranslation}
        activeOpacity={1} // USUNIĘTO PÓŁPRZEZROCZYSTOŚĆ: Karta jest stabilna przy kliknięciu
        style={styles.cardPressArea}
      >
        {/* STRONA A (TEKST) */}
        <Animated.View
          style={[
            styles.flashcard,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon + "40",
            },
            frontStyle,
          ]}
          pointerEvents={showTranslation ? "none" : "auto"}
        >
          <Text style={[styles.flashcardText, { color: colors.text }]}>
            {card.text}
          </Text>
        </Animated.View>

        {/* STRONA B (TŁUMACZENIE) */}
        <Animated.View
          style={[
            styles.flashcard,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon + "40",
            },
            backStyle,
          ]}
          pointerEvents={showTranslation ? "auto" : "none"}
        >
          <View style={styles.translationBackContent}>
            <Text style={[styles.translationText, { color: colors.icon }]}>
              {card.translation}
            </Text>

            <TouchableOpacity
              activeOpacity={0.6} // Subtelny feedback tylko dla przycisku głośnika
              style={styles.speakerButton}
              onPress={() => {
                const textToSpeak = card.translation || card.text;
                if (textToSpeak) {
                  Speech.stop();
                  Speech.speak(textToSpeak, {
                    language: "fr-FR",
                  });
                }
              }}
            >
              <IconSymbol
                name="speaker.wave.2.fill"
                size={28}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  cardPressArea: {
    width: "100%",
    maxWidth: 420,
    minHeight: 360,
  },
  flashcard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: 28,
    paddingVertical: 32,
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
  },
  translationText: {
    fontSize: 24,
    fontStyle: "italic",
    textAlign: "center",
  },
  translationBackContent: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  speakerButton: {
    padding: 12,
    borderRadius: 999,
  },
});
