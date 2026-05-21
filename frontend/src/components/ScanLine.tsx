import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "../theme";

const { width } = Dimensions.get("window");

export default function ScanLine() {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1, false);
    opacity.value = withRepeat(
      withSequence(withTiming(0.9, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1,
      true
    );
  }, [y, opacity]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value * 600 }],
    opacity: opacity.value,
  }));
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.line, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 0, left: 0, right: 0, height: "100%", overflow: "hidden" },
  line: {
    height: 2,
    width,
    backgroundColor: COLORS.brand,
    shadowColor: COLORS.brand,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
