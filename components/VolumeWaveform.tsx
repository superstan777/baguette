import { Canvas, Group, RoundedRect } from "@shopify/react-native-skia";
import React, { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

interface VolumeWaveformProps {
  volume: SharedValue<number>;
}

const BAR_COUNT = 7;
const GAP_RATIO = 0.35;

export const VolumeWaveform: React.FC<VolumeWaveformProps> = ({ volume }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    setSize(event.nativeEvent.layout);
  };

  if (size.width === 0) return <View style={{ flex: 1 }} onLayout={onLayout} />;

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <AnimatedBar key={i} index={i} volume={volume} canvasSize={size} />
          ))}
        </Group>
      </Canvas>
    </View>
  );
};

const AnimatedBar = ({ index, volume, canvasSize }: any) => {
  // To jest "magiczny" krok: tworzymy animowaną wartość, która
  // goni surową wartość z mikrofonu z dużą płynnością.
  const animatedVolume = useDerivedValue(() => {
    return withSpring(volume.value, {
      damping: 15, // Mniejszy damping = bardziej sprężysty ruch
      stiffness: 120, // Kontroluje szybkość reakcji
      mass: 0.3,
    });
  });

  const barProps = useDerivedValue(() => {
    const { width, height } = canvasSize;
    const slotWidth = width / BAR_COUNT;
    const barWidth = slotWidth * (1 - GAP_RATIO);

    const centerIndex = (BAR_COUNT - 1) / 2;
    const distFromCenter = Math.abs(index - centerIndex) / centerIndex;
    const sensitivity = 0.3 + 0.7 * Math.cos(distFromCenter * (Math.PI / 2.5));

    // Używamy animowanej wartości zamiast surowej
    const v = animatedVolume.value * sensitivity;

    const minH = 8;
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
      color="white"
    />
  );
};
