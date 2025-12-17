import { AddMode } from "@/components/flashcard/AddMode";
import { PracticeMode } from "@/components/flashcard/PracticeMode";
import { Mode, useFlashcardGestures } from "@/hooks/useFlashcardGestures";
import { useFlashcards } from "@/hooks/useFlashcards";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FlashcardScreen() {
  const [mode, setMode] = useState<Mode>("PRACTICE");
  const [newFlashcardText, setNewFlashcardText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const {
    flashcards,
    currentIndex,
    lifetimeCount,
    showTranslation,
    setShowTranslation,
    handleCorrect,
    handleIncorrect,
    handleSave: saveFlashcard,
  } = useFlashcards();

  const { animatedStyle, panGesture } = useFlashcardGestures({
    mode,
    setMode,
  });

  useEffect(() => {
    if (mode === "ADD") {
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
    }
  }, [mode]);

  const handleSave = async () => {
    if (!newFlashcardText.trim()) return;

    setIsSaving(true);
    setIsTranslating(true);
    try {
      await saveFlashcard(newFlashcardText.trim(), true);
      setNewFlashcardText("");
      setMode("PRACTICE");
    } catch (error) {
      console.error("Error saving flashcard:", error);
    } finally {
      setIsSaving(false);
      setIsTranslating(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={[styles.modeContainer, { top: 0 }]}>
            <PracticeMode
              currentCard={currentCard}
              lifetimeCount={lifetimeCount}
              showTranslation={showTranslation}
              onToggleTranslation={() => setShowTranslation(!showTranslation)}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
          </View>
          <View style={[styles.modeContainer, { top: SCREEN_HEIGHT }]}>
            <AddMode
              newFlashcardText={newFlashcardText}
              isSaving={isSaving}
              isTranslating={isTranslating}
              inputRef={inputRef}
              onTextChange={setNewFlashcardText}
              onSave={handleSave}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  modeContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
  },
});
