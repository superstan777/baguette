import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

let KeyboardProvider: React.ComponentType<{ children: React.ReactNode }>;

try {
  const KeyboardControllerModule = require("react-native-keyboard-controller");
  KeyboardProvider =
    KeyboardControllerModule.KeyboardProvider ||
    (({ children }: { children: React.ReactNode }) => <>{children}</>);
} catch (e) {
  KeyboardProvider = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
