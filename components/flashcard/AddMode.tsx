import { Button } from "@/components/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { RefObject } from "react";
import {
  Keyboard,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddModeProps {
  newFlashcardText: string;
  autoTranslate: boolean;
  isSaving: boolean;
  isTranslating: boolean;
  inputRef: RefObject<TextInput | null>;
  onTextChange: (text: string) => void;
  onAutoTranslateChange: (value: boolean) => void;
  onSave: () => void;
}

export function AddMode({
  newFlashcardText,
  autoTranslate,
  isSaving,
  isTranslating,
  inputRef,
  onTextChange,
  onAutoTranslateChange,
  onSave,
}: AddModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[styles.modeContainer, { backgroundColor: colors.background }]}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                blurOnSubmit={false}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Auto-translate to French
              </Text>
              <Switch
                value={autoTranslate}
                onValueChange={onAutoTranslateChange}
                trackColor={{
                  false: colors.icon + "40",
                  true: colors.tint + "80",
                }}
                thumbColor={autoTranslate ? colors.tint : colors.icon}
              />
            </View>

            {!autoTranslate && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  French Translation
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + "40",
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="Enter French translation"
                  placeholderTextColor={colors.icon + "80"}
                  editable={false}
                  value={isTranslating ? "Translating..." : ""}
                />
              </View>
            )}

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

            <Text style={[styles.swipeHint, { color: colors.icon }]}>
              Swipe down to return to practice
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modeContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  addContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
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

