import { Button } from "@/components/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAddFlashcard } from "@/hooks/useAddFlashcard";
import React, { RefObject, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddModeProps {
  inputRef: RefObject<TextInput | null>;
}

export function AddModeScreen({ inputRef }: AddModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [text, setText] = useState("");

  const { handleSave, resetStatus, isSaving, statusText, statusType } =
    useAddFlashcard();

  const onSavePress = async () => {
    const success = await handleSave(text);
    if (success) {
      setText("");
      inputRef.current?.focus();
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    resetStatus(); // Usuwa wizualizację błędu, gdy user zaczyna pisać
  };

  const getButtonBackgroundColor = () => {
    if (statusType === "error") return "#FF4444";
    if (statusType === "success") return "#4ADE80";
    return undefined;
  };

  const dynamicButtonStyle = StyleSheet.flatten([
    styles.saveButton,
    getButtonBackgroundColor()
      ? { backgroundColor: getButtonBackgroundColor() }
      : {},
  ]);

  return (
    <View
      style={[styles.modeContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.addContainer}>
            <View style={styles.addHeader}>
              <Text style={[styles.addTitle, { color: colors.text }]}>
                Add flashcard
              </Text>
              <Text style={[styles.addSubtitle, { color: colors.icon }]}>
                Type a word to translate and save
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.icon + "40" },
                ]}
                placeholder="e.g. apple"
                placeholderTextColor={colors.icon + "80"}
                value={text}
                onChangeText={handleTextChange}
                onSubmitEditing={onSavePress}
                submitBehavior="submit"
              />

              <Button
                title={statusText}
                onPress={onSavePress}
                loading={isSaving}
                variant="primary"
                style={dynamicButtonStyle}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modeContainer: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  addContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
  },
  addHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  addTitle: { fontSize: 32, fontWeight: "800", marginBottom: 8 },
  addSubtitle: { fontSize: 16, opacity: 0.7 },
  inputContainer: {
    gap: 16,
    marginVertical: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 20,
    fontSize: 20,
  },
  saveButton: {
    height: 60,
    borderRadius: 30,
  },
});
