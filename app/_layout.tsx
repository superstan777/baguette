import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Optional integration with `react-native-keyboard-controller` so that
// components like `KeyboardStickyView` receive real keyboard context.
// Falls back to a no-op provider when the native module isn't available
// (e.g. in Expo Go), avoiding runtime crashes.
let KeyboardProvider: React.ComponentType<{ children: React.ReactNode }>;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore - optional dependency, may not be installed in all environments
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
