import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import SoundLevel from "react-native-sound-level";
import { VolumeWaveform } from "../VolumeWaveform";

const NOISE_FLOOR = -50;
const MAX_LEVEL = -10;

export function PracticeMicButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [recording, setRecording] = useState(false);
  const volume = useSharedValue(0);
  const lastUpdateRef = useRef(0);

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
        const now = Date.now();

        if (now - lastUpdateRef.current < 25) return;
        lastUpdateRef.current = now;

        let val = data.value;
        if (val < NOISE_FLOOR) val = NOISE_FLOOR;
        if (val > MAX_LEVEL) val = MAX_LEVEL;

        let normalized = (val - NOISE_FLOOR) / (MAX_LEVEL - NOISE_FLOOR);

        volume.value = Math.pow(normalized, 1.5);
      };

      setRecording(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      activeOpacity={0.8}
      style={styles.btn}
    >
      {recording ? (
        <View style={styles.waveformContainer}>
          {/* Przekazujemy kolor zgodny z theme */}
          <VolumeWaveform volume={volume} color={colors.tint} />
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
    width: 100,
    height: 40,
  },
});
