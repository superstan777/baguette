import { Canvas, Group, RoundedRect } from "@shopify/react-native-skia";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

interface VolumeWaveformProps {
  volume: SharedValue<number>;
  color: string; // Dodany kolor z motywu
}

const BAR_COUNT = 7;
const GAP_RATIO = 0.35;

export const VolumeWaveform: React.FC<VolumeWaveformProps> = ({
  volume,
  color,
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ width, height });
    }
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.width > 0 && (
        <Canvas style={styles.canvas}>
          <Group>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <AnimatedBar
                key={i}
                index={i}
                volume={volume}
                canvasSize={size}
                barColor={color}
              />
            ))}
          </Group>
        </Canvas>
      )}
    </View>
  );
};

const AnimatedBar = ({ index, volume, canvasSize, barColor }: any) => {
  // Płynne opadanie (maślany efekt)
  const animatedVolume = useDerivedValue(() => {
    return withSpring(volume.value, {
      damping: 25,
      stiffness: 80, // Niższy stiffness dla płynniejszego opadania
      mass: 0.8,
    });
  });

  const barProps = useDerivedValue(() => {
    const { width, height } = canvasSize;
    const slotWidth = width / BAR_COUNT;
    const barWidth = slotWidth * (1 - GAP_RATIO);

    const centerIndex = (BAR_COUNT - 1) / 2;
    const distFromCenter = Math.abs(index - centerIndex) / centerIndex;
    const sensitivity = 0.4 + 0.6 * Math.cos(distFromCenter * (Math.PI / 2.5));

    const v = animatedVolume.value * sensitivity;

    const minH = 6;
    const maxH = height * 0.9;
    const currentH = minH + v * (maxH - minH);

    return {
      x: index * slotWidth + (slotWidth - barWidth) / 2,
      y: (height - currentH) / 2,
      w: barWidth,
      h: currentH,
    };
  });

  return (
    <RoundedRect
      x={useDerivedValue(() => barProps.value.x)}
      y={useDerivedValue(() => barProps.value.y)}
      width={useDerivedValue(() => barProps.value.w)}
      height={useDerivedValue(() => barProps.value.h)}
      r={useDerivedValue(() => barProps.value.w / 2)}
      color={barColor}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  canvas: {
    flex: 1,
  },
});
