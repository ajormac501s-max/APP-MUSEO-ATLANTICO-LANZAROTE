import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, FONTS, RADIUS, SPACING } from "../../src/theme";
import HUDButton from "../../src/components/HUDButton";

export default function SculptureDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setUser } = useAuth();
  const [item, setItem] = useState<any | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => { (async () => { try { setItem(await api.sculpture(String(id))); } catch {} })(); }, [id]);

  const unlock = async () => {
    if (!item) return;
    setUnlocking(true);
    try { const u = await api.unlock(item.id); setUser(u); setItem({ ...item, unlocked: true }); } catch {}
    setUnlocking(false);
  };

  if (!item) return <View style={styles.bg}><ActivityIndicator color={COLORS.brand} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="sculpture-detail">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <LinearGradient colors={["rgba(5,10,16,0.2)", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
          <Pressable onPress={() => router.back()} style={styles.back} testID="detail-back">
            <Ionicons name="chevron-back" size={22} color={COLORS.brand} />
          </Pressable>
          <View style={styles.heroFoot}>
            <Text style={styles.kicker}>{item.zone.toUpperCase()} · {item.depth_m}M · {item.year}</Text>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.artist}>{item.artist}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, item.unlocked ? { borderColor: COLORS.success } : { borderColor: COLORS.border }]}>
              <View style={[styles.dot, { backgroundColor: item.unlocked ? COLORS.success : COLORS.onSurfaceDim }]} />
              <Text style={[styles.statusTxt, item.unlocked && { color: COLORS.success }]}>{item.unlocked ? "DESBLOQUEADA" : "BLOQUEADA"}</Text>
            </View>
          </View>
          <Text style={styles.sectionLabel}>SOBRE LA OBRA</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <View style={styles.factCard}>
            <Ionicons name="bulb" size={20} color={COLORS.brand} />
            <Text style={styles.factText}>{item.fact}</Text>
          </View>
          <View style={{ gap: 12, marginTop: 16 }}>
            {!item.unlocked && (
              <HUDButton
                testID="detail-unlock-btn"
                label={unlocking ? "DESBLOQUEANDO..." : "Desbloquear (+100 XP)"}
                onPress={unlock}
                icon={<Ionicons name="lock-open" size={18} color="#00161B" />}
                disabled={unlocking}
              />
            )}
            <HUDButton
              testID="detail-ar-btn"
              label="Escanear en AR"
              onPress={() => router.push("/ar")}
              variant="ghost"
              icon={<Ionicons name="scan" size={18} color={COLORS.brand} />}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  heroWrap: { height: 480, position: "relative" },
  back: { position: "absolute", top: 60, left: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.7)" },
  heroFoot: { position: "absolute", left: 24, right: 24, bottom: 24 },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display },
  title: { color: COLORS.onSurface, fontSize: 30, fontFamily: FONTS.display, fontWeight: "800", marginTop: 6, lineHeight: 34 },
  artist: { color: COLORS.onSurfaceMuted, fontSize: 13, fontFamily: FONTS.text, marginTop: 4 },
  body: { padding: SPACING.xl, gap: 12 },
  statusRow: { flexDirection: "row" },
  statusPill: { flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { color: COLORS.onSurfaceMuted, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display, fontWeight: "700" },
  sectionLabel: { color: COLORS.brand, fontSize: 11, letterSpacing: 2.5, fontFamily: FONTS.display, marginTop: 8 },
  desc: { color: COLORS.onSurfaceMuted, fontSize: 15, fontFamily: FONTS.text, lineHeight: 22 },
  factCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "rgba(0,229,255,0.07)", marginTop: 6 },
  factText: { color: COLORS.onSurface, fontSize: 13, fontFamily: FONTS.text, flex: 1, lineHeight: 19, fontStyle: "italic" },
});
