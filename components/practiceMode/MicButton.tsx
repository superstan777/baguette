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

interface PracticeMicButtonProps {
  isActive: boolean;
  onResult: (isCorrect: boolean) => void; // DODANE: Definicja propa
}

export function MicButton({ isActive, onResult }: PracticeMicButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [recording, setRecording] = useState(false);
  const volume = useSharedValue(0);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!isActive && recording) {
      stopRecording(false); // Zatrzymujemy bez wysyłania wyniku przy zmianie trybu
    }
  }, [isActive, recording]);

  useEffect(() => {
    return () => {
      SoundLevel.stop();
    };
  }, []);

  const stopRecording = (shouldTriggerResult = true) => {
    SoundLevel.stop();
    setRecording(false);
    volume.value = withTiming(0, { duration: 300 });

    // Wywołujemy wynik tylko jeśli nagrywanie zostało zatrzymane przez użytkownika
    if (shouldTriggerResult) {
      // Symulacja: na ten moment zawsze zwracamy sukces (true)
      // Docelowo tu będzie logika porównywania tekstu
      onResult(true);
    }
  };

  const startRecording = () => {
    SoundLevel.start();
    SoundLevel.onNewFrame = (data: { value: number }) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // Optymalizacja pod 120fps (ok 8ms-16ms)
      lastUpdateRef.current = now;

      let val = data.value;
      if (val < NOISE_FLOOR) val = NOISE_FLOOR;
      if (val > MAX_LEVEL) val = MAX_LEVEL;

      let normalized = (val - NOISE_FLOOR) / (MAX_LEVEL - NOISE_FLOOR);
      volume.value = Math.pow(normalized, 1.5);
    };
    setRecording(true);
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording(true);
    } else {
      if (isActive) startRecording();
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
    width: 60,
    height: 32,
  },
});
