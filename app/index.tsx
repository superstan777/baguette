import { AddMode } from "@/components/flashcard/AddMode";

import { PracticeScreen } from "@/components/practiceMode/PracticeScreen";
import { Mode, useFlashcardGestures } from "@/hooks/useFlashcardGestures";
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

  // Ta funkcja zostanie przekazana do AddMode, by po zapisie wrócić do nauki
  const handleSaveComplete = () => {
    setNewFlashcardText("");
    setMode("PRACTICE");
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* TRYB PRAKTYKI - teraz sam zarządza swoimi danymi */}
          <View style={[styles.modeContainer, { top: 0 }]}>
            <PracticeScreen isActive={mode === "PRACTICE"} />
          </View>

          {/* TRYB DODAWANIA */}
          <View style={[styles.modeContainer, { top: SCREEN_HEIGHT }]}>
            <AddMode
              newFlashcardText={newFlashcardText}
              isSaving={isSaving}
              isTranslating={isTranslating}
              inputRef={inputRef}
              onTextChange={setNewFlashcardText}
              onSave={handleSaveComplete}
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
