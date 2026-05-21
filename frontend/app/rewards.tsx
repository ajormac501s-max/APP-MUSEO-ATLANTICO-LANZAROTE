import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/theme";
import Particles from "../src/components/Particles";

export default function Rewards() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { setItems(await api.rewards()); } finally { setLoading(false); } })(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="rewards-screen">
      <LinearGradient colors={["#011627", "#050A10"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={14} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} testID="rewards-back">
          <Ionicons name="chevron-back" size={22} color={COLORS.brand} />
        </Pressable>
        <Text style={styles.kicker}>RECOMPENSAS</Text>
        <Text style={styles.title}>Tu botín{"\n"}submarino.</Text>
      </View>
      {loading ? <ActivityIndicator color={COLORS.brand} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((r) => (
            <View key={r.id} style={[styles.card, r.unlocked && styles.cardUnlocked]} testID={`reward-${r.id}`}>
              <LinearGradient
                colors={r.unlocked ? ["rgba(0,229,255,0.2)", "rgba(5,10,16,0.95)"] : ["rgba(14,23,36,0.5)", "rgba(5,10,16,0.95)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={[styles.icon, !r.unlocked && { opacity: 0.4 }]}>{r.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.type, !r.unlocked && { opacity: 0.5 }]}>{r.type.toUpperCase()}</Text>
                <Text style={[styles.name, !r.unlocked && { opacity: 0.5 }]}>{r.name}</Text>
                <Text style={[styles.desc, !r.unlocked && { opacity: 0.4 }]}>{r.description}</Text>
              </View>
              {r.unlocked ? <Ionicons name="checkmark-circle" size={28} color={COLORS.success} /> : <Ionicons name="lock-closed" size={24} color={COLORS.onSurfaceDim} />}
            </View>
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingHorizontal: SPACING.xl, gap: 4 },
  back: { position: "absolute", top: 60, left: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.7)" },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display, marginTop: 20 },
  title: { color: COLORS.onSurface, fontSize: 32, fontFamily: FONTS.display, fontWeight: "800", lineHeight: 36, marginTop: 4 },
  list: { padding: SPACING.xl, gap: 12, paddingTop: 16 },
  card: { padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", gap: 14, alignItems: "center", overflow: "hidden" },
  cardUnlocked: { borderColor: COLORS.borderStrong, shadowColor: COLORS.brand, shadowOpacity: 0.4, shadowRadius: 10 },
  icon: { fontSize: 36 },
  type: { color: COLORS.brand, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.display },
  name: { color: COLORS.onSurface, fontSize: 16, fontFamily: FONTS.display, fontWeight: "700", marginTop: 2 },
  desc: { color: COLORS.onSurfaceMuted, fontSize: 12, fontFamily: FONTS.text, marginTop: 4 },
});
