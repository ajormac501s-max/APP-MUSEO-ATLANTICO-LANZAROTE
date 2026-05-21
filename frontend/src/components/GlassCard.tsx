import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS } from "../theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  glow?: boolean;
  radius?: number;
};

export default function GlassCard({ children, style, intensity = 50, glow = false, radius = RADIUS.lg }: Props) {
  return (
    <View style={[styles.wrap, { borderRadius: radius }, glow && styles.glow, style]}>
      <BlurView intensity={intensity} tint="dark" style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]} />
      <LinearGradient
        colors={["rgba(0,229,255,0.08)", "rgba(14,23,36,0.85)"]}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
      <View style={{ padding: 16 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: Platform.OS === "android" ? "rgba(14,23,36,0.65)" : "transparent",
  },
  glow: {
    borderColor: COLORS.borderStrong,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
