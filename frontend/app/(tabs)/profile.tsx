import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { COLORS, FONTS, RADIUS, SPACING } from "../../src/theme";
import Particles from "../../src/components/Particles";
import GlassCard from "../../src/components/GlassCard";

const LEVEL_TIERS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4500, 6000, 8000];

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<any[]>([]);
  const [sculptures, setSculptures] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try { const [m, s] = await Promise.all([api.missions(), api.sculptures()]); setMissions(m); setSculptures(s); refresh(); } catch {}
    })();
  }, []);

  const xp = user?.xp || 0;
  const currentTier = LEVEL_TIERS[Math.min((user?.level || 1) - 1, LEVEL_TIERS.length - 2)];
  const nextTier = LEVEL_TIERS[Math.min(user?.level || 1, LEVEL_TIERS.length - 1)];
  const pct = nextTier > currentTier ? Math.min(100, ((xp - currentTier) / (nextTier - currentTier)) * 100) : 100;
  const completedCount = user?.completed_missions.length || 0;
  const unlockedCount = sculptures.filter((s) => s.unlocked).length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="profile-screen">
      <LinearGradient colors={["#011627", "#050A10"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={14} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>EXPLORADOR · ACTIVO</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <GlassCard glow>
          <View style={styles.lvlRow}>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlNum}>{user?.level || 1}</Text>
              <Text style={styles.lvlLab}>NIVEL</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{user?.title?.toUpperCase()}</Text>
              <View style={styles.barTrack}>
                <LinearGradient colors={["#00E5FF", "#14F1D9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.xpInfo}>{xp} / {nextTier} XP</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNum}>🏆 {xp}</Text><Text style={styles.statLab}>XP TOTAL</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>🌊 {unlockedCount}</Text><Text style={styles.statLab}>ESCULTURAS</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>🐠 {completedCount}</Text><Text style={styles.statLab}>RETOS</Text></View>
        </View>

        <Pressable style={styles.rewardsBtn} onPress={() => router.push("/rewards")} testID="profile-rewards-btn">
          <LinearGradient colors={["rgba(0,229,255,0.2)", "rgba(20,241,217,0.05)"]} style={StyleSheet.absoluteFillObject} />
          <View>
            <Text style={styles.rewardsKick}>RECOMPENSAS</Text>
            <Text style={styles.rewardsTitle}>Ver insignias y descuentos</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={COLORS.brand} />
        </Pressable>

        <Text style={styles.sectionTitle}>INSIGNIAS DESBLOQUEADAS</Text>
        <View style={styles.badgeGrid}>
          {(user?.badges || []).length === 0 && (
            <Text style={styles.emptyTxt}>Aún sin insignias. Completa misiones para desbloquearlas.</Text>
          )}
          {missions.filter((m) => m.completed).map((m) => (
            <View key={m.id} style={styles.badge}>
              <Text style={{ fontSize: 28 }}>{m.icon}</Text>
              <Text style={styles.badgeName}>{m.title}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={async () => { await logout(); router.replace("/"); }} style={styles.logoutBtn} testID="profile-logout-btn">
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.logoutTxt}>Cerrar inmersión</Text>
        </Pressable>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 70, paddingHorizontal: SPACING.xl, gap: 16, paddingBottom: 40 },
  header: { gap: 4 },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display },
  name: { color: COLORS.onSurface, fontSize: 28, fontFamily: FONTS.display, fontWeight: "800", marginTop: 4 },
  email: { color: COLORS.onSurfaceMuted, fontSize: 13, fontFamily: FONTS.text },
  lvlRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  lvlBadge: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,229,255,0.1)", shadowColor: COLORS.brand, shadowOpacity: 0.6, shadowRadius: 12 },
  lvlNum: { color: COLORS.brand, fontSize: 32, fontFamily: FONTS.display, fontWeight: "800" },
  lvlLab: { color: COLORS.brand, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.display, marginTop: -4 },
  title: { color: COLORS.onSurface, fontSize: 14, letterSpacing: 2, fontFamily: FONTS.display, fontWeight: "700", marginBottom: 8 },
  barTrack: { height: 8, borderRadius: 999, backgroundColor: COLORS.surfaceTertiary, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  barFill: { height: "100%", borderRadius: 999 },
  xpInfo: { color: COLORS.onSurfaceMuted, fontSize: 11, fontFamily: FONTS.display, marginTop: 6, letterSpacing: 1 },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(14,23,36,0.7)", alignItems: "center", gap: 4 },
  statNum: { color: COLORS.brand, fontSize: 16, fontFamily: FONTS.display, fontWeight: "700" },
  statLab: { color: COLORS.onSurfaceDim, fontSize: 9, letterSpacing: 1.5, fontFamily: FONTS.display },
  rewardsBtn: { borderRadius: RADIUS.lg, padding: 18, borderWidth: 1, borderColor: COLORS.borderStrong, overflow: "hidden", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rewardsKick: { color: COLORS.brand, fontSize: 10, letterSpacing: 2.5, fontFamily: FONTS.display },
  rewardsTitle: { color: COLORS.onSurface, fontSize: 18, fontFamily: FONTS.display, fontWeight: "700", marginTop: 4 },
  sectionTitle: { color: COLORS.onSurface, fontSize: 13, letterSpacing: 2.5, fontFamily: FONTS.display, fontWeight: "700", marginTop: 12 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: 100, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "rgba(0,229,255,0.08)", alignItems: "center", gap: 6 },
  badgeName: { color: COLORS.onSurface, fontSize: 11, fontFamily: FONTS.display, letterSpacing: 1, textAlign: "center" },
  emptyTxt: { color: COLORS.onSurfaceDim, fontFamily: FONTS.text, fontSize: 13 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 999, borderWidth: 1, borderColor: COLORS.error, marginTop: 12, backgroundColor: "rgba(255,46,99,0.08)" },
  logoutTxt: { color: COLORS.error, fontFamily: FONTS.display, letterSpacing: 1.5, fontSize: 12, fontWeight: "700" },
});
