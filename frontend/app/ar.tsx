import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { useAuth } from "../src/auth";
import { COLORS, FONTS, IMAGES, RADIUS, SPACING } from "../src/theme";
import ScanLine from "../src/components/ScanLine";
import Particles from "../src/components/Particles";

export default function AR() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [target, setTarget] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => { (async () => { const s = await api.sculptures(); setItems(s); setTarget(s[0]); })(); }, []);

  const scan = async () => {
    if (!target || scanning) return;
    setScanning(true); setScanned(false);
    setTimeout(async () => {
      try { const u = await api.arScan(target.id); setUser(u); setScanned(true); } catch {}
      setScanning(false);
    }, 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="ar-screen">
      <ImageBackground source={{ uri: target?.image || IMAGES.arBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(5,10,16,0.55)", "rgba(5,10,16,0.78)"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={18} />
      {scanning && <ScanLine />}

      <Pressable onPress={() => router.back()} style={styles.close} testID="ar-close">
        <Ionicons name="close" size={22} color={COLORS.brand} />
      </Pressable>

      <View style={styles.topHud}>
        <View style={[styles.dot, { backgroundColor: scanning ? COLORS.warning : COLORS.success }]} />
        <Text style={styles.hudTxt}>AR MODE · {scanning ? "ESCANEANDO..." : scanned ? "OBJETO IDENTIFICADO" : "LISTO"}</Text>
      </View>

      {/* HUD reticle */}
      <View style={styles.reticleWrap} pointerEvents="none">
        <View style={[styles.corner, { top: 0, left: 0, borderLeftWidth: 3, borderTopWidth: 3 }]} />
        <View style={[styles.corner, { top: 0, right: 0, borderRightWidth: 3, borderTopWidth: 3 }]} />
        <View style={[styles.corner, { bottom: 0, left: 0, borderLeftWidth: 3, borderBottomWidth: 3 }]} />
        <View style={[styles.corner, { bottom: 0, right: 0, borderRightWidth: 3, borderBottomWidth: 3 }]} />
      </View>

      <View style={styles.bottom}>
        {scanned && target && (
          <View style={styles.infoCard}>
            <Image source={{ uri: target.image }} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>IDENTIFICADO · {target.depth_m}M</Text>
              <Text style={styles.name}>{target.name}</Text>
              <Text style={styles.fact} numberOfLines={2}>{target.fact}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
          </View>
        )}

        <Text style={styles.targetLabel}>SELECCIONA OBJETIVO HOLOGRÁFICO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
          {items.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => { setTarget(s); setScanned(false); }}
              testID={`ar-target-${s.id}`}
              style={[styles.targetChip, target?.id === s.id && styles.targetChipActive]}
            >
              <Image source={{ uri: s.image }} style={styles.targetImg} contentFit="cover" />
              <Text style={[styles.targetTxt, target?.id === s.id && { color: COLORS.brand }]} numberOfLines={1}>{s.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable onPress={scan} disabled={scanning} style={styles.scanBtn} testID="ar-scan-btn">
          <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
          {scanning ? <ActivityIndicator color="#00161B" /> : <Ionicons name="scan" size={24} color="#00161B" />}
          <Text style={styles.scanTxt}>{scanning ? "ESCANEANDO..." : "ESCANEAR HOLOGRAMA"}</Text>
        </Pressable>
        <Text style={styles.tip}>El océano cobra vida digitalmente.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { position: "absolute", top: 60, right: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.7)", zIndex: 10 },
  topHud: { position: "absolute", top: 60, left: 20, flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(5,10,16,0.7)", borderWidth: 1, borderColor: COLORS.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hudTxt: { color: COLORS.brand, fontSize: 11, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "700" },
  reticleWrap: { position: "absolute", top: "30%", left: "20%", width: "60%", height: 220 },
  corner: { position: "absolute", width: 30, height: 30, borderColor: COLORS.brand, shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 10 },
  bottom: { position: "absolute", bottom: 30, left: 0, right: 0, gap: 12 },
  infoCard: { marginHorizontal: 20, padding: 12, flexDirection: "row", gap: 12, alignItems: "center", borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "rgba(14,23,36,0.95)" },
  thumb: { width: 56, height: 56, borderRadius: RADIUS.md },
  kicker: { color: COLORS.brand, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display },
  name: { color: COLORS.onSurface, fontSize: 15, fontFamily: FONTS.display, fontWeight: "700", marginTop: 2 },
  fact: { color: COLORS.onSurfaceMuted, fontSize: 11, fontFamily: FONTS.text, marginTop: 2 },
  targetLabel: { color: COLORS.brand, fontSize: 10, letterSpacing: 2.5, fontFamily: FONTS.display, paddingHorizontal: 20 },
  targetChip: { width: 90, padding: 6, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(14,23,36,0.85)", alignItems: "center", gap: 4 },
  targetChipActive: { borderColor: COLORS.borderStrong, shadowColor: COLORS.brand, shadowOpacity: 0.7, shadowRadius: 8 },
  targetImg: { width: "100%", height: 50, borderRadius: 4 },
  targetTxt: { color: COLORS.onSurfaceMuted, fontSize: 9, fontFamily: FONTS.display, letterSpacing: 1 },
  scanBtn: { marginHorizontal: 20, height: 56, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, overflow: "hidden", shadowColor: COLORS.brand, shadowOpacity: 0.7, shadowRadius: 14 },
  scanTxt: { color: "#00161B", fontFamily: FONTS.display, letterSpacing: 1.5, fontWeight: "800", fontSize: 14 },
  tip: { color: COLORS.onSurfaceMuted, fontSize: 12, fontFamily: FONTS.text, textAlign: "center", fontStyle: "italic" },
});
