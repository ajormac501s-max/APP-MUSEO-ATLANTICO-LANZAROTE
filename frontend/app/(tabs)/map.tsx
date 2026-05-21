import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../src/api";
import { COLORS, FONTS, IMAGES, RADIUS, SPACING } from "../../src/theme";
import ScanLine from "../../src/components/ScanLine";
import Particles from "../../src/components/Particles";

const ZONES = ["TODAS", "Zona Norte", "Zona Central", "Zona Sur"];

export default function MapScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [zone, setZone] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { setItems(await api.sculptures()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = zone === "TODAS" ? items : items.filter((s) => s.zone === zone);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="map-screen">
      <ImageBackground source={{ uri: IMAGES.mapBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(5,10,16,0.55)", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
      <ScanLine />
      <Particles count={12} />

      <View style={styles.header}>
        <Text style={styles.kicker}>SONAR ACTIVO · 12.4M</Text>
        <Text style={styles.title}>Mapa{"\n"}Submarino</Text>
        <Text style={styles.sub}>Explora. Descubre. Evoluciona.</Text>
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
          {ZONES.map((z) => {
            const active = zone === z;
            return (
              <Pressable key={z} testID={`map-zone-${z}`} onPress={() => setZone(z)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{z.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ paddingTop: 60 }}><ActivityIndicator color={COLORS.brand} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />}
        >
          {filtered.map((s) => (
            <Pressable
              key={s.id}
              testID={`map-pin-${s.id}`}
              onPress={() => router.push(`/sculpture/${s.id}` as any)}
              style={[styles.card, s.unlocked && styles.cardUnlocked]}
            >
              <Image source={{ uri: s.image }} style={styles.cardImg} contentFit="cover" />
              <LinearGradient colors={["transparent", "rgba(5,10,16,0.92)"]} style={StyleSheet.absoluteFillObject} />
              {!s.unlocked && <View style={styles.lockOverlay}><Ionicons name="lock-closed" size={24} color={COLORS.brand} /></View>}
              <View style={styles.cardFoot}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={[styles.pin, { backgroundColor: s.unlocked ? COLORS.success : COLORS.onSurfaceDim }]} />
                  <Text style={styles.cardZone}>{s.zone} · {s.depth_m}M</Text>
                </View>
                <Text style={styles.cardName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.cardStatus}>{s.unlocked ? "🟢 DESBLOQUEADA" : "🔒 BLOQUEADA · Visita la escultura"}</Text>
              </View>
            </Pressable>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingHorizontal: SPACING.xl, gap: 6 },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display },
  title: { color: COLORS.onSurface, fontSize: 32, fontFamily: FONTS.display, fontWeight: "800", lineHeight: 36, marginTop: 4 },
  sub: { color: COLORS.onSurfaceMuted, fontFamily: FONTS.text, fontSize: 13 },
  chipsWrap: { height: 56, marginTop: 16, justifyContent: "center" },
  chip: { height: 36, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", backgroundColor: "rgba(14,23,36,0.7)" },
  chipActive: { borderColor: COLORS.borderStrong, backgroundColor: "rgba(0,229,255,0.18)" },
  chipText: { color: COLORS.onSurfaceMuted, fontSize: 11, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "600" },
  chipTextActive: { color: COLORS.brand },
  list: { paddingHorizontal: SPACING.xl, gap: 14, paddingTop: 8 },
  card: { height: 180, borderRadius: RADIUS.lg, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceSecondary },
  cardUnlocked: { borderColor: COLORS.borderStrong, shadowColor: COLORS.brand, shadowOpacity: 0.5, shadowRadius: 12 },
  cardImg: { ...StyleSheet.absoluteFillObject },
  lockOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.6)" },
  cardFoot: { position: "absolute", left: 16, right: 16, bottom: 14 },
  cardZone: { color: COLORS.brand, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display },
  pin: { width: 8, height: 8, borderRadius: 4, shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 6 },
  cardName: { color: COLORS.onSurface, fontSize: 20, fontFamily: FONTS.display, fontWeight: "700", marginTop: 4 },
  cardStatus: { color: COLORS.onSurfaceMuted, fontSize: 11, fontFamily: FONTS.display, marginTop: 6, letterSpacing: 1 },
});
