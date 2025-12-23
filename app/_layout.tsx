import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/utils/database";
import { initializeTranslationModels } from "@/utils/translation";

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

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. Inicjalizacja bazy danych (SQLite)
        await initDatabase();

        // 2. Przygotowanie tłumacza.
        // Dzięki flagom wewnątrz funkcji, pobierze model 30MB
        // tylko jeśli nie znajdzie go w pamięci telefonu.
        await initializeTranslationModels();

        console.log("App resources initialized.");
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    }

    prepareApp();
  }, []);

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
