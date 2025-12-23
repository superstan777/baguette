import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StatusType } from "./useAddFlashcard";

const ANIM_CONFIG = { duration: 150, easing: Easing.out(Easing.quad) };

/**
 * Hook dostarczający wizualny (kolor, skala) oraz haptyczny feedback
 * dla przycisku w zależności od statusu operacji.
 */
export function useButtonFeedback(statusType: StatusType, baseColor: string) {
  const successVal = useSharedValue(0);
  const errorVal = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (statusType === "success") {
      // Feedback haptyczny dla sukcesu
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      errorVal.value = withTiming(0, ANIM_CONFIG);
      successVal.value = withTiming(1, ANIM_CONFIG);
      scale.value = withSequence(
        withTiming(1.05, ANIM_CONFIG),
        withTiming(1, ANIM_CONFIG)
      );
    } else if (statusType === "error") {
      // Feedback haptyczny dla błędu
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      successVal.value = withTiming(0, ANIM_CONFIG);
      errorVal.value = withTiming(1, ANIM_CONFIG);
      scale.value = withSequence(
        withTiming(0.95, ANIM_CONFIG),
        withTiming(1, ANIM_CONFIG)
      );
    } else {
      successVal.value = withTiming(0, ANIM_CONFIG);
      errorVal.value = withTiming(0, ANIM_CONFIG);
      scale.value = withTiming(1, ANIM_CONFIG);
    }
  }, [statusType]);

  const animatedStyle = useAnimatedStyle(() => {
    // Łączenie kolorów: bazowy -> sukces -> błąd
    const baseToSuccess = interpolateColor(
      successVal.value,
      [0, 1],
      [baseColor, "#4ADE80"]
    );

    const finalColor = interpolateColor(
      errorVal.value,
      [0, 1],
      [baseToSuccess, "#FF4444"]
    );

    return {
      backgroundColor: finalColor,
      transform: [{ scale: scale.value }],
    };
  });

  return animatedStyle;
}
