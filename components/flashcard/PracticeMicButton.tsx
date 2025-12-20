import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import SoundLevel from "react-native-sound-level";
import { VolumeWaveform } from "../VolumeWaveform";

const NOISE_FLOOR = -50; // dół skali (cisza)
const MAX_LEVEL = -10; // góra skali (głośna mowa)

export function PracticeMicButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [recording, setRecording] = useState(false);
  const volume = useSharedValue(0);

  useEffect(() => {
    return () => {
      SoundLevel.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (recording) {
      SoundLevel.stop();
      setRecording(false);
      volume.value = withTiming(0, { duration: 300 });
    } else {
      SoundLevel.start();

      SoundLevel.onNewFrame = (data: { value: number }) => {
        let val = data.value;

        // 1. Clampowanie wartości
        if (val < NOISE_FLOOR) val = NOISE_FLOOR;
        if (val > MAX_LEVEL) val = MAX_LEVEL;

        // 2. Normalizacja do zakresu 0..1
        let normalized = (val - NOISE_FLOOR) / (MAX_LEVEL - NOISE_FLOOR);

        // 3. Skalowanie potęgowe (Kwadratowe)
        // Sprawia, że małe dźwięki nie wypełniają całego wykresu
        normalized = Math.pow(normalized, 2);

        // 4. Płynna aktualizacja SharedValue (120 FPS safe)
        volume.value = withSpring(normalized, {
          damping: 20,
          stiffness: 250,
          mass: 0.5,
        });
      };

      setRecording(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: recording ? colors.tint + "40" : colors.tint + "20",
        },
      ]}
    >
      {recording ? (
        <View style={styles.waveformContainer}>
          <VolumeWaveform volume={volume} />
        </View>
      ) : (
        <IconSymbol name="mic.fill" size={32} color={colors.tint} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformContainer: {
    width: 60, // mniejszy kontener wewnątrz przycisku
    height: 40,
  },
});
