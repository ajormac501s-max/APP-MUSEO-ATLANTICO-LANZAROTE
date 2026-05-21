import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from "react-native-reanimated";
import { COLORS } from "../theme";

const { width, height } = Dimensions.get("window");

type ParticleProps = { x: number; size: number; duration: number; delay: number; opacity: number };

function Particle({ x, size, duration, delay, opacity }: ParticleProps) {
  const y = useSharedValue(height + 50);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(-100, { duration, easing: Easing.linear }), -1, false)
    );
  }, [y, duration, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { left: x, width: size, height: size, borderRadius: size / 2, opacity },
        style,
      ]}
    />
  );
}

export default function Particles({ count = 18 }: { count?: number }) {
  const particles = Array.from({ length: count }).map((_, i) => ({
    key: i,
    x: Math.random() * width,
    size: 2 + Math.random() * 4,
    duration: 9000 + Math.random() * 8000,
    delay: Math.random() * 5000,
    opacity: 0.25 + Math.random() * 0.55,
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {particles.map((p) => (
        <Particle key={p.key} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    backgroundColor: COLORS.brand,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
