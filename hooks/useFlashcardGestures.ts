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

export function useFlashcardGestures({ mode, setMode }: UseFlashcardGesturesProps) {
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  // Initialize translateY on mount only
  useEffect(() => {
    translateY.value = mode === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
  }, []);

  // Animated style for mode transition
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store the starting position when gesture begins
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Start from stored position and add gesture translation
      // When user swipes up (negative translationY), content moves up (translateY more negative) -> ADD mode
      // When user swipes down (positive translationY), content moves down (translateY less negative/positive) -> PRACTICE mode
      const newTranslation = startY.value + event.translationY;

      // Clamp to prevent over-scrolling
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

      // Determine if we should switch modes
      const shouldSwitch =
        Math.abs(translation) > threshold || Math.abs(velocity) > 800;

      if (shouldSwitch) {
        // Swipe up (negative translation) -> ADD mode (translateY = -SCREEN_HEIGHT)
        // Swipe down (positive translation) -> PRACTICE mode (translateY = 0)
        const newMode: Mode = translation < 0 ? "ADD" : "PRACTICE";

        // Get current mode from starting position
        const currentModeFromPosition: Mode =
          startY.value < -SCREEN_HEIGHT / 2 ? "ADD" : "PRACTICE";

        if (newMode !== currentModeFromPosition) {
          // Update mode immediately before animation
          scheduleOnRN(setMode, newMode);

          // Animate to new mode
          const targetOffset = newMode === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(targetOffset, {
            duration: ANIMATION_DURATION,
          });
        } else {
          // Snap back to current mode
          const currentOffset =
            currentModeFromPosition === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(currentOffset, {
            duration: ANIMATION_DURATION,
          });
        }
      } else {
        // Snap back if threshold not met
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

