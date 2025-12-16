import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SymbolViewProps } from "expo-symbols";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

export type ButtonVariant = "primary" | "secondary" | "icon";

export interface ButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: SymbolViewProps["name"];
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isDisabled = disabled || loading;

  // Determine button colors based on variant and theme
  const getButtonColors = () => {
    if (variant === "icon") {
      return {
        backgroundColor: "transparent",
        textColor: colors.tint,
        iconColor: colors.tint,
      };
    }

    if (variant === "secondary") {
      return {
        backgroundColor: "transparent",
        textColor: colors.tint,
        iconColor: colors.tint,
        borderColor: colors.tint,
      };
    }

    // Primary variant
    return {
      backgroundColor: colors.tint,
      textColor: colorScheme === "dark" ? colors.background : "#fff",
      iconColor: colorScheme === "dark" ? colors.background : "#fff",
    };
  };

  const buttonColors = getButtonColors();

  const buttonStyle: ViewStyle[] = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && [
      styles.secondaryButton,
      { borderColor: buttonColors.borderColor },
    ],
    variant === "icon" && styles.iconButton,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    { backgroundColor: buttonColors.backgroundColor },
    style,
  ].filter(
    (style): style is ViewStyle => style !== false && style !== undefined
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={buttonColors.textColor} />;
    }

    if (variant === "icon" && icon) {
      return (
        <IconSymbol
          name={icon}
          size={24}
          color={isDisabled ? colors.icon + "40" : buttonColors.iconColor}
        />
      );
    }

    return (
      <>
        {icon && iconPosition === "left" && (
          <IconSymbol
            name={icon}
            size={24}
            color={isDisabled ? colors.icon + "40" : buttonColors.iconColor}
            style={title ? styles.iconLeft : undefined}
          />
        )}
        {title && (
          <ThemedText
            style={[
              styles.buttonText,
              variant === "primary" && styles.primaryButtonText,
              variant === "secondary" && styles.secondaryButtonText,
              {
                color: isDisabled ? colors.icon + "40" : buttonColors.textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
        )}
        {icon && iconPosition === "right" && (
          <IconSymbol
            name={icon}
            size={24}
            color={isDisabled ? colors.icon + "40" : buttonColors.iconColor}
            style={title ? styles.iconRight : undefined}
          />
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 44,
  },
  primaryButton: {
    // Primary button styles are handled by backgroundColor
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  iconButton: {
    padding: 12,
    minHeight: 44,
    minWidth: 44,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonText: {
    // Primary text color is handled dynamically
  },
  secondaryButtonText: {
    // Secondary text color is handled dynamically
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
