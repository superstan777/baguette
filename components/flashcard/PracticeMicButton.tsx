import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SoundLevel from "react-native-sound-level";
import { VolumeWaveform } from "../VolumeWaveform";

const BAR_COUNT = 7;
const THRESHOLD_DB = -50; // minimalny poziom dźwięku, poniżej traktowany jako cisza

export function PracticeMicButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [recording, setRecording] = useState(false);
  const [levels, setLevels] = useState<Uint8Array>(
    new Uint8Array(BAR_COUNT).fill(0)
  );

  // Stop monitoring przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      SoundLevel.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (recording) {
      SoundLevel.stop();
      setRecording(false);
      setLevels(new Uint8Array(BAR_COUNT).fill(0));
    } else {
      SoundLevel.start();

      SoundLevel.onNewFrame = (data: { value: number; rawValue: number }) => {
        let value = data.value;

        // filtr szumu tła
        if (value < THRESHOLD_DB) value = THRESHOLD_DB;

        // normalizacja: THRESHOLD_DB..0 -> 0..255
        const normalized = Math.min(
          255,
          Math.max(
            0,
            Math.floor(((value - THRESHOLD_DB) / -THRESHOLD_DB) * 255)
          )
        );

        const newBars = new Uint8Array(BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          newBars[i] = normalized * (1 - i / BAR_COUNT);
        }

        setLevels(newBars);
      };

      setRecording(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      style={[
        styles.btn,
        {
          backgroundColor: recording ? colors.tint + "40" : colors.tint + "20",
        },
      ]}
    >
      {recording ? (
        <View style={{ width: 80, height: 80 }}>
          <VolumeWaveform data={levels} dataSize={BAR_COUNT} />
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
});
