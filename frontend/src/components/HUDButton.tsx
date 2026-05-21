import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS, RADIUS, FONTS } from "../theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
  style?: ViewStyle;
  icon?: React.ReactNode;
  testID?: string;
  disabled?: boolean;
};

export default function HUDButton({ label, onPress, variant = "primary", style, icon, testID, disabled }: Props) {
  const handle = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress?.();
  };
  if (variant === "ghost") {
    return (
      <Pressable testID={testID} disabled={disabled} onPress={handle} style={[styles.ghost, style, disabled && { opacity: 0.5 }]}>
        {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable testID={testID} disabled={disabled} onPress={handle} style={[styles.wrap, style, disabled && { opacity: 0.5 }]}>
      <LinearGradient
        colors={["#00E5FF", "#14F1D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    shadowColor: COLORS.brand,
    shadowOpacity: 0.65,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  bg: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#00161B",
    fontFamily: FONTS.display,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  ghost: {
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: RADIUS.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,229,255,0.06)",
  },
  ghostLabel: {
    color: COLORS.brand,
    fontFamily: FONTS.display,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});
