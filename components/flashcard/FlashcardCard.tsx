import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Flashcard } from "@/utils/database";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FlashcardCardProps {
  card: Flashcard;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export function FlashcardCard({
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
      justifyContent: "center",
      alignItems: "center",
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggleTranslation}
        activeOpacity={0.9}
        style={styles.cardPressArea}
      >
        <Animated.View
          style={[
            styles.flashcard,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon + "40",
            },
            frontStyle,
          ]}
        >
          <Text style={[styles.flashcardText, { color: colors.text }]}>
            {card.text}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.flashcard,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon + "40",
            },
            backStyle,
          ]}
        >
          <Text style={[styles.translationText, { color: colors.icon }]}>
            {card.translation}
          </Text>
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
    position: "relative",
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
});
