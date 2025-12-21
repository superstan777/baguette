import type { FlashcardInterface } from "@/utils/database";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Flashcard } from "./Flashcard";

interface CardsStackProps {
  currentCard: FlashcardInterface;
  nextCard?: FlashcardInterface;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export const CardsStack = React.memo(
  ({
    currentCard,
    nextCard,
    showTranslation,
    onToggleTranslation,
  }: CardsStackProps) => {
    return (
      <View style={styles.cardStack}>
        {/* KARTA BUFOROWA (POD SPODEM) */}
        {nextCard && (
          <View style={[styles.cardWrapper, styles.cardBuffer]}>
            <Flashcard
              card={nextCard}
              showTranslation={false}
              onToggleTranslation={() => {}}
            />
          </View>
        )}

        {/* KARTA AKTYWNA (NA WIERZCHU) */}
        <Animated.View
          key={currentCard.id}
          entering={FadeIn.duration(200)}
          style={[styles.cardWrapper, { zIndex: 2 }]}
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
  cardStack: {
    width: "100%",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  cardBuffer: {
    zIndex: 1,
    opacity: 0.4,
    transform: [{ scale: 0.92 }, { translateY: 15 }],
  },
});
