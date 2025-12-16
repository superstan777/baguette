import { Button } from "@/components/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  addFlashcard,
  Flashcard,
  getAllFlashcards,
  getLifetimeCount,
  incrementLifetimeCount,
  initDatabase,
  updateFlashcardFail,
  updateFlashcardSuccess,
} from "@/utils/database";
import { translateToFrench } from "@/utils/translation";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_DURATION = 200;

type Mode = "PRACTICE" | "ADD";

export default function FlashcardScreen() {
  const [mode, setMode] = useState<Mode>("PRACTICE");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [newFlashcardText, setNewFlashcardText] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Initialize translateY on mount only
  useEffect(() => {
    translateY.value = 0; // Start in PRACTICE mode
  }, []);

  // Initialize database and load data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-focus input when switching to ADD mode
  useEffect(() => {
    if (mode === "ADD") {
      // Delay focus to allow animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      // Dismiss keyboard when switching away from ADD mode
      Keyboard.dismiss();
    }
  }, [mode]);

  const loadData = async () => {
    try {
      await initDatabase();
      const cards = await getAllFlashcards();
      const count = await getLifetimeCount();
      setFlashcards(cards);
      setLifetimeCount(count);
      if (cards.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Animated style for mode transition
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store the starting position when gesture begins
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Start from stored position and add gesture translation
      // When user swipes up (negative translationY), content moves up (translateY more negative) -> ADD mode
      // When user swipes down (positive translationY), content moves down (translateY less negative/positive) -> PRACTICE mode
      const newTranslation = startY.value + event.translationY;

      // Clamp to prevent over-scrolling
      const clampedTranslation = Math.max(
        -SCREEN_HEIGHT,
        Math.min(0, newTranslation)
      );
      translateY.value = clampedTranslation;
    })
    .onEnd((event) => {
      const threshold = SCREEN_HEIGHT * 0.2;
      const velocity = event.velocityY;
      const translation = event.translationY;

      // Determine if we should switch modes
      const shouldSwitch =
        Math.abs(translation) > threshold || Math.abs(velocity) > 800;

      if (shouldSwitch) {
        // Swipe up (negative translation) -> ADD mode (translateY = -SCREEN_HEIGHT)
        // Swipe down (positive translation) -> PRACTICE mode (translateY = 0)
        const newMode: Mode = translation < 0 ? "ADD" : "PRACTICE";

        // Get current mode from starting position
        const currentModeFromPosition: Mode =
          startY.value < -SCREEN_HEIGHT / 2 ? "ADD" : "PRACTICE";

        if (newMode !== currentModeFromPosition) {
          // Update mode immediately before animation
          scheduleOnRN(setMode, newMode);

          // Animate to new mode
          const targetOffset = newMode === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(targetOffset, {
            duration: ANIMATION_DURATION,
          });
        } else {
          // Snap back to current mode
          const currentOffset =
            currentModeFromPosition === "PRACTICE" ? 0 : -SCREEN_HEIGHT;
          translateY.value = withTiming(currentOffset, {
            duration: ANIMATION_DURATION,
          });
        }
      } else {
        // Snap back if threshold not met
        const currentOffset =
          startY.value < -SCREEN_HEIGHT / 2 ? -SCREEN_HEIGHT : 0;
        translateY.value = withTiming(currentOffset, {
          duration: ANIMATION_DURATION,
        });
      }
    });

  const currentCard = flashcards[currentIndex];

  const handleCorrect = async () => {
    if (!currentCard) return;

    await updateFlashcardSuccess(currentCard.id);
    await incrementLifetimeCount();
    const newCount = await getLifetimeCount();
    setLifetimeCount(newCount);
    setShowTranslation(false);

    // Move to next card
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
  };

  const handleIncorrect = async () => {
    if (!currentCard) return;

    await updateFlashcardFail(currentCard.id);
    setShowTranslation(true);
  };

  const handleSave = async () => {
    if (!newFlashcardText.trim()) return;

    setIsSaving(true);
    try {
      let translation = newFlashcardText.trim();

      if (autoTranslate) {
        setIsTranslating(true);
        try {
          translation = await translateToFrench(newFlashcardText.trim());
        } catch (error) {
          console.error("Translation error:", error);
          // Continue with original text if translation fails
        } finally {
          setIsTranslating(false);
        }
      }

      await addFlashcard(newFlashcardText.trim(), translation);
      await loadData();

      // Reset and switch to PRACTICE mode
      setNewFlashcardText("");
      setMode("PRACTICE");
      setShowTranslation(false);
    } catch (error) {
      console.error("Error saving flashcard:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPracticeMode = () => (
    <View
      style={[styles.modeContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.practiceContainer}>
          {/* Lifetime Counter */}
          <View style={styles.counterContainer}>
            <Text style={[styles.counterLabel, { color: colors.text }]}>
              Lifetime: {lifetimeCount}
            </Text>
          </View>

          {/* Flashcard */}
          {currentCard ? (
            <View style={styles.flashcardContainer}>
              <View
                style={[
                  styles.flashcard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.icon + "40",
                  },
                ]}
              >
                <Text style={[styles.flashcardText, { color: colors.text }]}>
                  {currentCard.text}
                </Text>
                {showTranslation && (
                  <View style={styles.translationContainer}>
                    <Text
                      style={[styles.translationText, { color: colors.icon }]}
                    >
                      {currentCard.translation}
                    </Text>
                  </View>
                )}
              </View>

              {/* Microphone Button Placeholder */}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: colors.tint + "20" },
                ]}
                onPress={() => {
                  // Placeholder for speech recognition
                  console.log("Microphone pressed");
                }}
              >
                <IconSymbol name="mic.fill" size={32} color={colors.tint} />
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Incorrect"
                  onPress={handleIncorrect}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <Button
                  title="Correct"
                  onPress={handleCorrect}
                  variant="primary"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No flashcards yet. Swipe up to add one!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );

  const renderAddMode = () => (
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
                onChangeText={setNewFlashcardText}
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
                onValueChange={setAutoTranslate}
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
              onPress={handleSave}
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Always render both modes for infinite loop */}
          <View style={[styles.modeContainer, { top: 0 }]}>
            {renderPracticeMode()}
          </View>
          <View style={[styles.modeContainer, { top: SCREEN_HEIGHT }]}>
            {renderAddMode()}
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  modeContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  practiceContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  counterContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  flashcardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  flashcard: {
    width: "100%",
    minHeight: 200,
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flashcardText: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  translationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    width: "100%",
  },
  translationText: {
    fontSize: 24,
    fontStyle: "italic",
    textAlign: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
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
