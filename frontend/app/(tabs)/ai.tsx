import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, FONTS, IMAGES, RADIUS, SPACING } from "../../src/theme";
import Particles from "../../src/components/Particles";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: string };

const SUGGESTIONS = [
  "¿Qué escultura me recomiendas hoy?",
  "Cuéntame sobre Rubicon",
  "Ruta de 1 hora en el museo",
  "¿Por qué es importante el museo?",
];

export default function AIScreen() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const hist = await api.aiHistory();
        if (hist?.length) setMsgs(hist);
        else setMsgs([{ role: "assistant", content: `Bienvenido ${user?.name?.split(" ")[0] || "explorador"}. Las corrientes susurran tu llegada. ¿Qué deseas descubrir hoy?` }]);
      } catch {
        setMsgs([{ role: "assistant", content: "Bienvenido explorador. ¿Qué deseas descubrir hoy?" }]);
      }
    })();
  }, [user]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const res = await api.aiChat(text);
      setMsgs((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "assistant", content: "Señal abisal perdida. Intenta de nuevo en unos instantes." }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="ai-screen">
      <ImageBackground source={{ uri: IMAGES.aiBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(5,10,16,0.55)", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={18} />

      <View style={styles.header}>
        <View style={styles.orb}><LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} /></View>
        <View>
          <Text style={styles.kicker}>HOLOGRAMA · ONLINE</Text>
          <Text style={styles.title}>ATLANTIS AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false}>
          {msgs.map((m, i) => (
            <View key={i} style={[styles.bubbleWrap, m.role === "user" ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
              <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleAI]} testID={`msg-${i}`}>
                {m.role === "assistant" && <Text style={styles.aiLabel}>ATLANTIS</Text>}
                <Text style={[styles.bubbleText, m.role === "user" && { color: "#00161B" }]}>{m.content}</Text>
              </View>
            </View>
          ))}
          {sending && (
            <View style={[styles.bubbleWrap, { alignItems: "flex-start" }]}>
              <View style={[styles.bubble, styles.bubbleAI]}>
                <Text style={styles.aiLabel}>ATLANTIS</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}><ActivityIndicator size="small" color={COLORS.brand} /><Text style={[styles.bubbleText, { opacity: 0.7 }]}>Procesando señales abisales...</Text></View>
              </View>
            </View>
          )}
        </ScrollView>

        {msgs.length <= 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggRow}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={styles.sugg} testID={`sugg-${s}`}>
                <Text style={styles.suggTxt}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.composer}>
          <TextInput
            testID="ai-input"
            value={input}
            onChangeText={setInput}
            placeholder="Pregúntale a ATLANTIS..."
            placeholderTextColor={COLORS.onSurfaceDim}
            style={styles.input}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            editable={!sending}
          />
          <Pressable onPress={() => send()} disabled={sending} style={[styles.sendBtn, sending && { opacity: 0.5 }]} testID="ai-send">
            <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="paper-plane" size={18} color="#00161B" />
          </Pressable>
        </View>
        <View style={{ height: 80 }} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingHorizontal: SPACING.xl, flexDirection: "row", gap: 14, alignItems: "center" },
  orb: { width: 50, height: 50, borderRadius: 25, overflow: "hidden", shadowColor: COLORS.brand, shadowOpacity: 1, shadowRadius: 16 },
  kicker: { color: COLORS.brand, fontSize: 10, letterSpacing: 2.5, fontFamily: FONTS.display },
  title: { color: COLORS.onSurface, fontSize: 24, fontFamily: FONTS.display, fontWeight: "800", letterSpacing: 2 },
  chat: { padding: SPACING.xl, paddingTop: 24, gap: 12, flexGrow: 1 },
  bubbleWrap: { width: "100%" },
  bubble: { maxWidth: "82%", padding: 12, borderRadius: 18, borderWidth: 1 },
  bubbleAI: { backgroundColor: "rgba(14,23,36,0.85)", borderColor: COLORS.borderStrong, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: COLORS.brand, borderColor: COLORS.brand, borderTopRightRadius: 4 },
  aiLabel: { color: COLORS.brand, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.display, marginBottom: 4, fontWeight: "700" },
  bubbleText: { color: COLORS.onSurface, fontSize: 14, fontFamily: FONTS.text, lineHeight: 20 },
  suggRow: { paddingHorizontal: SPACING.xl, gap: 8, paddingBottom: 8 },
  sugg: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(14,23,36,0.7)" },
  suggTxt: { color: COLORS.brand, fontSize: 11, fontFamily: FONTS.text },
  composer: { flexDirection: "row", gap: 10, paddingHorizontal: SPACING.xl, paddingTop: 8 },
  input: { flex: 1, height: 48, borderRadius: 999, paddingHorizontal: 18, color: COLORS.onSurface, fontFamily: FONTS.text, backgroundColor: "rgba(14,23,36,0.85)", borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden", shadowColor: COLORS.brand, shadowOpacity: 0.7, shadowRadius: 10 },
});
