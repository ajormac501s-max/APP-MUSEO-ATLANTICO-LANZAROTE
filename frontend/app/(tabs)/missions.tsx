import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, FONTS, RADIUS, SPACING } from "../../src/theme";
import Particles from "../../src/components/Particles";

export default function Missions() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { try { setItems(await api.missions()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const goAction = (m: any) => {
    if (m.type === "explore") router.push("/(tabs)/map");
    else if (m.type === "ar") router.push("/ar");
    else if (m.type === "quiz") router.push("/quiz");
    else if (m.type === "vr") router.push("/vr");
    else router.push("/(tabs)/map");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="missions-screen">
      <LinearGradient colors={["#011627", "#050A10"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={14} />
      <View style={styles.header}>
        <Text style={styles.kicker}>MISIONES ACTIVAS</Text>
        <Text style={styles.title}>Retos &{"\n"}Misiones</Text>
        <View style={styles.xpBadge}>
          <Ionicons name="flash" size={14} color={COLORS.brand} />
          <Text style={styles.xpText}>{user?.xp || 0} XP TOTAL</Text>
        </View>
      </View>
      {loading ? (
        <View style={{ paddingTop: 60 }}><ActivityIndicator color={COLORS.brand} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />}
        >
          {items.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
            return (
              <View key={m.id} style={[styles.card, m.completed && styles.cardDone]} testID={`mission-${m.id}`}>
                <LinearGradient
                  colors={m.completed ? ["rgba(20,241,217,0.18)", "rgba(5,10,16,0.95)"] : ["rgba(0,229,255,0.08)", "rgba(14,23,36,0.9)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.cardHead}>
                  <Text style={styles.icon}>{m.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mTitle}>{m.title.toUpperCase()}</Text>
                    <Text style={styles.mSub}>{m.subtitle}</Text>
                  </View>
                  <View style={[styles.xpTag, m.completed && { borderColor: COLORS.success, backgroundColor: "rgba(20,241,217,0.15)" }]}>
                    <Text style={[styles.xpTagTxt, m.completed && { color: COLORS.success }]}>+{m.xp_reward} XP</Text>
                  </View>
                </View>
                <Text style={styles.desc}>{m.description}</Text>
                <View style={styles.barTrack}>
                  <LinearGradient colors={m.completed ? ["#14F1D9", "#14F1D9"] : ["#00E5FF", "#14F1D9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.cardFoot}>
                  <Text style={styles.progress}>{m.progress}/{m.target}  ·  {pct}%</Text>
                  {m.completed ? (
                    <View style={styles.doneTag}><Ionicons name="checkmark" size={14} color={COLORS.success} /><Text style={styles.doneText}>COMPLETADA</Text></View>
                  ) : (
                    <Pressable onPress={() => goAction(m)} style={styles.goBtn} testID={`mission-go-${m.id}`}>
                      <Text style={styles.goTxt}>INICIAR →</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
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
  xpBadge: { alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "rgba(0,229,255,0.1)" },
  xpText: { color: COLORS.brand, fontSize: 11, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "700" },
  list: { padding: SPACING.xl, gap: 14, paddingTop: 16 },
  card: { borderRadius: RADIUS.lg, padding: 18, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  cardDone: { borderColor: COLORS.success, shadowColor: COLORS.success, shadowOpacity: 0.4, shadowRadius: 10 },
  cardHead: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { fontSize: 30 },
  mTitle: { color: COLORS.onSurface, fontSize: 14, fontFamily: FONTS.display, fontWeight: "700", letterSpacing: 1.5 },
  mSub: { color: COLORS.onSurfaceMuted, fontSize: 12, fontFamily: FONTS.text, marginTop: 2 },
  xpTag: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  xpTagTxt: { color: COLORS.brand, fontSize: 11, letterSpacing: 1, fontFamily: FONTS.display, fontWeight: "700" },
  desc: { color: COLORS.onSurfaceMuted, fontSize: 12.5, fontFamily: FONTS.text, marginTop: 10, marginBottom: 10, lineHeight: 18 },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: COLORS.surfaceTertiary, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  barFill: { height: "100%", borderRadius: 999 },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  progress: { color: COLORS.onSurfaceMuted, fontSize: 11, fontFamily: FONTS.display, letterSpacing: 1 },
  goBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(0,229,255,0.18)", borderWidth: 1, borderColor: COLORS.borderStrong },
  goTxt: { color: COLORS.brand, fontSize: 11, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "700" },
  doneTag: { flexDirection: "row", gap: 4, alignItems: "center" },
  doneText: { color: COLORS.success, fontSize: 11, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "700" },
});
