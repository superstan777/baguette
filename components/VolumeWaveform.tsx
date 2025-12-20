import { RoundedRect, Canvas as SKCanvas } from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
  height: number;
}

interface ChartProps {
  data: Uint8Array;
  dataSize: number;
}

export const VolumeWaveform: React.FC<ChartProps> = ({ data }) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const BAR_COUNT = 7;
  const BAR_COLOR = "black";
  const MIN_BAR_HEIGHT = 5;
  const RADIUS = 25;
  const GAP_RATIO = 0.2;

  const onCanvasLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const slotWidth = size.width / BAR_COUNT;
  const barWidth = slotWidth * (1 - GAP_RATIO);
  const offsetX = (size.width - BAR_COUNT * slotWidth) / 2;
  const centerY = size.height / 2;
  const maxBarHalfHeight = size.height / 2 - MIN_BAR_HEIGHT;

  const points = useMemo(() => {
    if (!data.length || size.width === 0) return [];

    const p: Point[] = [];

    for (let i = 0; i < BAR_COUNT; i++) {
      const value = data[i] ?? 0; // 0–255
      const normalized = value / 255;

      const halfHeight = MIN_BAR_HEIGHT + normalized * maxBarHalfHeight;

      const x = offsetX + i * slotWidth + (slotWidth - barWidth) / 2;

      p.push({
        x,
        y: centerY - halfHeight,
        height: halfHeight * 2,
      });
    }

    return p;
  }, [data, size]);

  return (
    <View style={{ flex: 1 }} onLayout={onCanvasLayout}>
      <SKCanvas style={{ flex: 1 }}>
        {points.map((point, index) => (
          <RoundedRect
            key={index}
            x={point.x}
            y={point.y}
            width={barWidth}
            height={point.height}
            r={RADIUS}
            color={BAR_COLOR}
          />
        ))}
      </SKCanvas>
    </View>
  );
};
