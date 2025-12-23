import { Button } from "@/components/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAddFlashcard } from "@/hooks/useAddFlashcard";
import React, { RefObject, useState } from "react";
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
  inputRef: RefObject<TextInput | null>;
}

export function AddMode({ inputRef }: AddModeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [text, setText] = useState("");

  const { handleSave, isSaving, statusText } = useAddFlashcard();

  const onSavePress = async () => {
    const success = await handleSave(text);
    if (success) {
      setText("");
      inputRef.current?.focus();
    }
  };

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
                  Quick Add
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
                  onChangeText={setText}
                  onSubmitEditing={onSavePress}
                  blurOnSubmit={false}
                />
              </View>

              <Button
                title={statusText}
                onPress={onSavePress}
                disabled={isSaving || !text.trim()}
                loading={isSaving}
                variant="primary"
                fullWidth
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modeContainer: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  addContainer: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  addHeader: { marginBottom: 40, alignItems: "center" },
  addTitle: { fontSize: 32, fontWeight: "800", marginBottom: 8 },
  addSubtitle: { fontSize: 16, opacity: 0.7 },
  inputContainer: { marginBottom: 32 },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    textAlign: "center",
  },
});
