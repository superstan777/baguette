import type { FlashcardInterface } from "@/utils/database";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Flashcard } from "./Flashcard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CardsStackProps {
  currentCard: FlashcardInterface;
  nextCard?: FlashcardInterface;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onAnimationComplete: (isCorrect: boolean) => void;
}

// Używamy forwardRef, aby PracticeScreen mógł "rozkazać" animację bezpośrednio na UI Thread
export const CardsStack = forwardRef(
  (
    {
      currentCard,
      nextCard,
      showTranslation,
      onToggleTranslation,
      onAnimationComplete,
    }: CardsStackProps,
    ref
  ) => {
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    // Funkcje wywoływane bezpośrednio przez ref
    useImperativeHandle(ref, () => ({
      swipeRight: () => {
        "worklet";
        rotate.value = withSpring(15);
        translateX.value = withSpring(
          SCREEN_WIDTH * 1.5,
          { stiffness: 150 },
          () => {
            runOnJS(onAnimationComplete)(true);
          }
        );
      },
      swipeLeft: () => {
        "worklet";
        rotate.value = withSpring(-15);
        translateX.value = withSpring(
          -SCREEN_WIDTH * 1.5,
          { stiffness: 150 },
          () => {
            runOnJS(onAnimationComplete)(false);
          }
        );
      },
      shake: () => {
        "worklet";
        translateX.value = withSequence(
          withTiming(-15, { duration: 50 }),
          withTiming(15, { duration: 50 }),
          withTiming(-15, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      },
    }));

    // Reset pozycji przy zmianie danych (gdy React w końcu podmieni karty)
    useEffect(() => {
      translateX.value = 0;
      rotate.value = 0;
      opacity.value = 1;
    }, [currentCard.id]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    }));

    return (
      <View style={styles.cardStack}>
        {/* KARTA POD SPODEM - renderowana statycznie, zero opóźnień */}
        {nextCard && (
          <View style={styles.cardWrapper}>
            <Flashcard
              card={nextCard}
              showTranslation={false}
              onToggleTranslation={() => {}}
            />
          </View>
        )}

        {/* KARTA NA WIERZCHU - animowana */}
        <Animated.View
          key={currentCard.id}
          style={[styles.cardWrapper, { zIndex: 2 }, animatedStyle]}
        >
          <Flashcard
            card={currentCard}
            showTranslation={showTranslation}
            onToggleTranslation={onToggleTranslation}
          />
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardStack: { width: "100%", height: 400, overflow: "visible" },
  cardWrapper: { position: "absolute", width: "100%", height: "100%" },
});
