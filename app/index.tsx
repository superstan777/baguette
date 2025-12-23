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
  const inputRef = useRef<TextInput>(null);

  const { animatedStyle, panGesture } = useFlashcardGestures({
    mode,
    setMode,
  });

  // Obsługa autofokusa po przejściu do trybu dodawania
  useEffect(() => {
    if (mode === "ADD") {
      // Mały timeout zapewnia, że animacja się skończyła przed otwarciem klawiatury
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    } else {
      Keyboard.dismiss();
    }
  }, [mode]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* TRYB PRAKTYKI */}
          <View style={[styles.modeContainer, { top: 0 }]}>
            <PracticeScreen isActive={mode === "PRACTICE"} />
          </View>

          {/* TRYB DODAWANIA - komponent teraz sam zarządza swoim stanem zapisu */}
          <View style={[styles.modeContainer, { top: SCREEN_HEIGHT }]}>
            <AddMode inputRef={inputRef} />
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
