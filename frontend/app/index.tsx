import React from "react";
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../src/auth";
import { COLORS, FONTS, IMAGES, SPACING, TYPE } from "../src/theme";
import HUDButton from "../src/components/HUDButton";
import Particles from "../src/components/Particles";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.brand} size="large" />
        <Text style={styles.loadingText}>SUMERGIENDO...</Text>
      </View>
    );
  }
  if (user) return <Redirect href="/(tabs)/home" />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="welcome-screen">
      <ImageBackground source={{ uri: IMAGES.welcomeBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(5,10,16,0.35)", "rgba(5,10,16,0.78)", "rgba(5,10,16,0.98)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <Particles count={22} />
      <View style={styles.container}>
        <View style={styles.hudTop}>
          <View style={styles.hudDot} />
          <Text style={styles.hudText}>ATLANTIS · LANZAROTE · 28.8°N 13.7°W</Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.kicker}>EUROPA · PRIMER MUSEO SUBMARINO</Text>
          <Text style={styles.hero}>SUMÉRGETE EN{"\n"}LA EXPERIENCIA</Text>
          <Text style={styles.sub}>El futuro del turismo submarino.</Text>
        </View>

        <View style={styles.actions}>
          <HUDButton
            testID="welcome-start-btn"
            label="Iniciar Inmersión"
            onPress={() => router.push("/register")}
            icon={<Ionicons name="water" size={18} color="#00161B" />}
          />
          <Pressable testID="welcome-login-btn" onPress={() => router.push("/login")} style={styles.linkBtn}>
            <Text style={styles.linkText}>Ya tengo cuenta · Acceder</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.brand} />
          </Pressable>
        </View>

        <View style={styles.hudBottom}>
          <Text style={styles.hudSmall}>v1.0 · ATLANTIS AI ACTIVE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  loadingText: { color: COLORS.brand, marginTop: 16, letterSpacing: 4, fontFamily: FONTS.display, fontSize: 12 },
  container: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 80, paddingBottom: SPACING.xxxl, justifyContent: "space-between" },
  hudTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  hudDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brand, shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 8 },
  hudText: { color: COLORS.brand, fontSize: 11, letterSpacing: 2, fontFamily: FONTS.display },
  middle: { gap: 14 },
  kicker: { color: COLORS.brandSecondary, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display, textTransform: "uppercase" },
  hero: { color: COLORS.onSurface, fontSize: TYPE.display, fontFamily: FONTS.display, fontWeight: "800", lineHeight: 48, letterSpacing: -1 },
  sub: { color: COLORS.onSurfaceMuted, fontSize: TYPE.lg, fontFamily: FONTS.text, marginTop: 8 },
  actions: { gap: SPACING.lg },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  linkText: { color: COLORS.brand, fontFamily: FONTS.text, fontSize: 14, letterSpacing: 0.5 },
  hudBottom: { alignItems: "center" },
  hudSmall: { color: COLORS.onSurfaceDim, fontSize: 10, letterSpacing: 3, fontFamily: FONTS.display },
});
