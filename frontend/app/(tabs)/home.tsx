import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, Pressable, Dimensions, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { COLORS, FONTS, IMAGES, RADIUS, SPACING, TYPE } from "../../src/theme";
import Particles from "../../src/components/Particles";
import GlassCard from "../../src/components/GlassCard";

const { width } = Dimensions.get("window");

export default function Home() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [sculptures, setSculptures] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, m] = await Promise.all([api.sculptures(), api.missions()]);
      setSculptures(s); setMissions(m);
    } catch {}
  };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await Promise.all([load(), refresh()]); setRefreshing(false); };

  const unlocked = sculptures.filter((s) => s.unlocked).length;
  const total = sculptures.length || 12;
  const featured = sculptures.slice(0, 5);
  const xpToNext = nextLevelXP(user?.xp || 0);
  const xpProgress = xpToNext.to > xpToNext.from ? ((user?.xp || 0) - xpToNext.from) / (xpToNext.to - xpToNext.from) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="home-screen">
      <ImageBackground source={{ uri: IMAGES.welcomeBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" blurRadius={2} />
      <LinearGradient colors={["rgba(5,10,16,0.6)", "rgba(5,10,16,0.92)", "rgba(5,10,16,1)"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={16} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />}
      >
        <View style={styles.topHud}>
          <View>
            <Text style={styles.hudTime}>NIVEL {user?.level || 1}</Text>
            <Text style={styles.welcome}>Hola, {user?.name?.split(" ")[0]}.</Text>
          </View>
          <View style={styles.hudRight}>
            <View style={styles.dot} />
            <Text style={styles.hudTxt}>{user?.title?.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.hero}>SUMÉRGETE{"\n"}EN LA EXPERIENCIA</Text>
        <Text style={styles.sub}>El futuro del turismo submarino.</Text>

        {/* XP Bar */}
        <GlassCard style={{ marginTop: 8 }} glow>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={styles.xpLabel}>XP TOTAL</Text>
            <Text style={styles.xpValue}>{user?.xp || 0} / {xpToNext.to}</Text>
          </View>
          <View style={styles.barTrack}>
            <LinearGradient colors={["#00E5FF", "#14F1D9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${Math.min(100, xpProgress * 100)}%` }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <Stat label="ESCULTURAS" value={`${unlocked}/${total}`} />
            <Stat label="MISIONES" value={`${user?.completed_missions.length || 0}/${missions.length || 5}`} />
            <Stat label="INSIGNIAS" value={String(user?.badges.length || 0)} />
          </View>
        </GlassCard>

        {/* Quick actions */}
        <View style={styles.actions}>
          <Action testID="home-explore-btn" icon="water" label="Explorar océano" onPress={() => router.push("/(tabs)/map")} />
          <Action testID="home-mission-btn" icon="rocket" label="Iniciar misión" onPress={() => router.push("/(tabs)/missions")} />
          <Action testID="home-achievements-btn" icon="trophy" label="Mis logros" onPress={() => router.push("/rewards")} />
        </View>

        {/* Featured */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ESCULTURAS DESTACADAS</Text>
          <Pressable onPress={() => router.push("/(tabs)/map")}><Text style={styles.linkSmall}>VER TODAS →</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 24 }}>
          {featured.map((s) => (
            <Pressable key={s.id} testID={`featured-${s.id}`} style={styles.featured} onPress={() => router.push(`/sculpture/${s.id}` as any)}>
              <Image source={{ uri: s.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              <LinearGradient colors={["transparent", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
              {!s.unlocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.brand} />
                  <Text style={styles.lockText}>BLOQUEADA</Text>
                </View>
              )}
              <View style={styles.featuredFoot}>
                <Text style={styles.featuredZone}>{s.zone.toUpperCase()} · {s.depth_m}M</Text>
                <Text style={styles.featuredName} numberOfLines={2}>{s.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* AR Bento */}
        <Pressable style={[styles.bento, { marginTop: 24 }]} onPress={() => router.push("/ar")} testID="home-ar-btn">
          <ImageBackground source={{ uri: IMAGES.arBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient colors={["rgba(0,229,255,0.18)", "rgba(5,10,16,0.92)"]} style={StyleSheet.absoluteFillObject} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bentoKick}>EXPERIENCIA AR</Text>
              <Text style={styles.bentoTitle}>El océano cobra vida</Text>
              <Text style={styles.bentoSub}>Activar escáner holográfico</Text>
            </View>
            <View style={styles.bentoIcon}><Ionicons name="scan" size={28} color={COLORS.brand} /></View>
          </View>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function nextLevelXP(xp: number) {
  const tiers = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4500, 6000, 8000];
  for (let i = 0; i < tiers.length - 1; i++) {
    if (xp < tiers[i + 1]) return { from: tiers[i], to: tiers[i + 1] };
  }
  return { from: tiers[tiers.length - 2], to: tiers[tiers.length - 1] };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>
  );
}

function Action({ icon, label, onPress, testID }: any) {
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.action}>
      <LinearGradient colors={["rgba(0,229,255,0.15)", "rgba(20,241,217,0.05)"]} style={StyleSheet.absoluteFillObject} />
      <Ionicons name={icon} size={22} color={COLORS.brand} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 70, paddingHorizontal: SPACING.xl, paddingBottom: 40, gap: 16 },
  topHud: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  welcome: { color: COLORS.onSurface, fontSize: 20, fontFamily: FONTS.display, fontWeight: "600", marginTop: 4 },
  hudTime: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display },
  hudRight: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  hudTxt: { color: COLORS.onSurfaceMuted, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display },
  hero: { color: COLORS.onSurface, fontSize: 32, fontFamily: FONTS.display, fontWeight: "800", lineHeight: 36, letterSpacing: -0.5, marginTop: 14 },
  sub: { color: COLORS.onSurfaceMuted, fontFamily: FONTS.text, fontSize: 14 },
  xpLabel: { color: COLORS.brand, fontSize: 10, letterSpacing: 2.5, fontFamily: FONTS.display },
  xpValue: { color: COLORS.onSurface, fontSize: 13, fontFamily: FONTS.display },
  barTrack: { height: 8, borderRadius: 999, backgroundColor: COLORS.surfaceTertiary, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  barFill: { height: "100%", borderRadius: 999 },
  statLabel: { color: COLORS.onSurfaceDim, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.display },
  statValue: { color: COLORS.brand, fontSize: 18, fontFamily: FONTS.display, fontWeight: "700", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, paddingVertical: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", overflow: "hidden", gap: 8 },
  actionLabel: { color: COLORS.onSurface, fontSize: 11, letterSpacing: 1, textAlign: "center", fontFamily: FONTS.display, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  sectionTitle: { color: COLORS.onSurface, fontSize: 14, letterSpacing: 2.5, fontFamily: FONTS.display, fontWeight: "700" },
  linkSmall: { color: COLORS.brand, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display },
  featured: { width: width * 0.62, height: 220, borderRadius: RADIUS.lg, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  featuredFoot: { position: "absolute", left: 14, right: 14, bottom: 14 },
  featuredZone: { color: COLORS.brand, fontSize: 10, letterSpacing: 2, fontFamily: FONTS.display, marginBottom: 4 },
  featuredName: { color: COLORS.onSurface, fontSize: 16, fontFamily: FONTS.display, fontWeight: "700" },
  lockBadge: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(5,10,16,0.85)", borderWidth: 1, borderColor: COLORS.border },
  lockText: { color: COLORS.brand, fontSize: 9, letterSpacing: 1.5, fontFamily: FONTS.display },
  bento: { height: 130, borderRadius: RADIUS.lg, overflow: "hidden", borderWidth: 1, borderColor: COLORS.borderStrong, padding: 18, justifyContent: "center", shadowColor: COLORS.brand, shadowOpacity: 0.5, shadowRadius: 14 },
  bentoKick: { color: COLORS.brand, fontSize: 10, letterSpacing: 3, fontFamily: FONTS.display },
  bentoTitle: { color: COLORS.onSurface, fontSize: 22, fontFamily: FONTS.display, fontWeight: "700", marginTop: 4 },
  bentoSub: { color: COLORS.onSurfaceMuted, fontFamily: FONTS.text, fontSize: 13, marginTop: 4 },
  bentoIcon: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: COLORS.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,229,255,0.1)" },
});
