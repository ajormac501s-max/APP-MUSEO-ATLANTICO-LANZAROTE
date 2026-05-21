import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { useAuth } from "../src/auth";
import { COLORS, FONTS, IMAGES, SPACING } from "../src/theme";
import Particles from "../src/components/Particles";
import ScanLine from "../src/components/ScanLine";

export default function VR() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [stage, setStage] = useState<"idle" | "running" | "done">("idle");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (stage !== "running") return;
    const t = setInterval(() => {
      setPct((p) => {
        const next = p + 4;
        if (next >= 100) { clearInterval(t); finish(); return 100; }
        return next;
      });
    }, 120);
    return () => clearInterval(t);
  }, [stage]);

  const finish = async () => {
    try { const u = await api.vrComplete(); setUser(u); } catch {}
    setStage("done");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="vr-screen">
      <ImageBackground source={{ uri: IMAGES.aiBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(5,10,16,0.5)", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={28} />
      {stage === "running" && <ScanLine />}

      <Pressable onPress={() => router.back()} style={styles.close} testID="vr-close">
        <Ionicons name="close" size={22} color={COLORS.brand} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.orb}>
          <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
          {stage === "running" && <ActivityIndicator size="large" color="#00161B" style={{ position: "absolute" }} />}
        </View>
        <Text style={styles.kicker}>EXPERIENCIA INMERSIVA · 360°</Text>
        <Text style={styles.title}>
          {stage === "idle" && "Deep Dive\nVR Experience"}
          {stage === "running" && "Sumergiéndote..."}
          {stage === "done" && "Inmersión\nCompletada"}
        </Text>
        <Text style={styles.sub}>
          {stage === "idle" && "Cierra los ojos y sumérgete 360° en el Museo Atlántico."}
          {stage === "running" && "Cardúmenes pasan junto a ti. Las esculturas respiran."}
          {stage === "done" && "+500 XP · Insignia Deep Diver desbloqueada."}
        </Text>

        {stage === "running" && (
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        )}

        {stage === "idle" && (
          <Pressable onPress={() => setStage("running")} style={styles.btn} testID="vr-start">
            <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="play" size={20} color="#00161B" />
            <Text style={styles.btnTxt}>INICIAR INMERSIÓN</Text>
          </Pressable>
        )}
        {stage === "done" && (
          <Pressable onPress={() => router.back()} style={styles.btn} testID="vr-finish">
            <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="checkmark" size={20} color="#00161B" />
            <Text style={styles.btnTxt}>VOLVER</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { position: "absolute", top: 60, right: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.7)", zIndex: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: 16 },
  orb: { width: 140, height: 140, borderRadius: 70, overflow: "hidden", shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 30, alignItems: "center", justifyContent: "center" },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display, marginTop: 12 },
  title: { color: COLORS.onSurface, fontSize: 32, fontFamily: FONTS.display, fontWeight: "800", textAlign: "center", lineHeight: 36 },
  sub: { color: COLORS.onSurfaceMuted, fontSize: 14, fontFamily: FONTS.text, textAlign: "center", paddingHorizontal: 30 },
  barTrack: { width: 240, height: 6, borderRadius: 999, backgroundColor: COLORS.surfaceTertiary, overflow: "hidden", marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  barFill: { height: "100%", backgroundColor: COLORS.brand, borderRadius: 999, shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 6 },
  btn: { marginTop: 24, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, flexDirection: "row", gap: 10, alignItems: "center", overflow: "hidden", shadowColor: COLORS.brand, shadowOpacity: 0.7, shadowRadius: 14 },
  btnTxt: { color: "#00161B", fontFamily: FONTS.display, letterSpacing: 2, fontWeight: "800" },
});
