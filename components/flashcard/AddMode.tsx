import { Button } from "@/components/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { RefObject } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddModeProps {
  newFlashcardText: string;
  isSaving: boolean;
  isTranslating: boolean;
  inputRef: RefObject<TextInput | null>;
  onTextChange: (text: string) => void;
  onSave: () => void;
}

export function AddMode({
  newFlashcardText,
  isSaving,
  isTranslating,
  inputRef,
  onTextChange,
  onSave,
}: AddModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[styles.modeContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.addContainer}>
              <View style={styles.addHeader}>
                <Text style={[styles.addTitle, { color: colors.text }]}>
                  Add New Flashcard
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  English Text
                </Text>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + "40",
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="Enter English word or phrase"
                  placeholderTextColor={colors.icon + "80"}
                  value={newFlashcardText}
                  onChangeText={onTextChange}
                  multiline
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {isTranslating && (
                <View style={styles.translatingContainer}>
                  <Text
                    style={[styles.translatingText, { color: colors.icon }]}
                  >
                    Translating...
                  </Text>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title={
                    isSaving
                      ? isTranslating
                        ? "Translating..."
                        : "Saving..."
                      : "Save"
                  }
                  onPress={onSave}
                  disabled={isSaving || !newFlashcardText.trim()}
                  loading={isSaving}
                  variant="primary"
                  fullWidth
                  style={styles.saveButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modeContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  addContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  addHeader: {
    marginBottom: 32,
    alignItems: "center",
  },
  addTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: "top",
  },
  translatingContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  translatingText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingTop: 20,
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    marginBottom: 16,
  },
  swipeHint: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
  },
});
