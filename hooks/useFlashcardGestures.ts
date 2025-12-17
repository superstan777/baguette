import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_DURATION = 200;

export type Mode = "PRACTICE" | "ADD";

interface UseFlashcardGesturesProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function useFlashcardGestures({
  mode,
  setMode,
}: UseFlashcardGesturesProps) {
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateY.value = mode === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newTranslation = startY.value + event.translationY;

      const clampedTranslation = Math.max(
        -SCREEN_HEIGHT,
        Math.min(0, newTranslation)
      );
      translateY.value = clampedTranslation;
    })
    .onEnd((event) => {
      const threshold = SCREEN_HEIGHT * 0.2;
      const velocity = event.velocityY;
      const translation = event.translationY;

      const shouldSwitch =
        Math.abs(translation) > threshold || Math.abs(velocity) > 800;

      if (shouldSwitch) {
        const newMode: Mode = translation < 0 ? "ADD" : "PRACTICE";

        const currentModeFromPosition: Mode =
          startY.value < -SCREEN_HEIGHT / 2 ? "ADD" : "PRACTICE";

        if (newMode !== currentModeFromPosition) {
          scheduleOnRN(setMode, newMode);

          const targetOffset = newMode === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(targetOffset, {
            duration: ANIMATION_DURATION,
          });
        } else {
          const currentOffset =
            currentModeFromPosition === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(currentOffset, {
            duration: ANIMATION_DURATION,
          });
        }
      } else {
        const currentOffset =
          startY.value < -SCREEN_HEIGHT / 2 ? -SCREEN_HEIGHT : 0;
        translateY.value = withTiming(currentOffset, {
          duration: ANIMATION_DURATION,
        });
      }
    });

  return {
    animatedStyle,
    panGesture,
    translateY,
  };
}
