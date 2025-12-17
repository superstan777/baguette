import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PracticeHeaderProps {
  lifetimeCount: number;
}

export function PracticeHeader({ lifetimeCount }: PracticeHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.icon}>
          {/* Left card */}
          <View
            style={[
              styles.cardBase,
              styles.leftCard,
              { borderColor: colors.text },
            ]}
          />
          {/* Middle card */}
          <View
            style={[
              styles.cardBase,
              styles.middleCard,
              { borderColor: colors.text, backgroundColor: colors.background },
            ]}
          />
          {/* Right card */}
          <View
            style={[
              styles.cardBase,
              styles.rightCard,
              { borderColor: colors.text, backgroundColor: colors.background },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.countText, { color: colors.text }]}>
        {lifetimeCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    position: "relative",
  },
  cardBase: {
    position: "absolute",
    width: 14,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  leftCard: {
    left: 0,
    top: 6,
    transform: [{ rotate: "-8deg" }],
  },
  middleCard: {
    left: 6,
    top: 2,
  },
  rightCard: {
    right: 0,
    top: 6,
    transform: [{ rotate: "8deg" }],
  },
  countText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
