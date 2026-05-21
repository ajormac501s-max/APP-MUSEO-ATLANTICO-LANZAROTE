import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { useAuth } from "../src/auth";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/theme";
import Particles from "../src/components/Particles";

export default function Quiz() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const ANSWERS = [1, 1, 1, 1, 1]; // server keeps the keys; mirror for instant feedback

  useEffect(() => { (async () => { try { setQuestions(await api.quiz()); } finally { setLoading(false); } })(); }, []);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === ANSWERS[idx]) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) finish();
      else { setIdx((x) => x + 1); setPicked(null); }
    }, 900);
  };

  const finish = async () => {
    setDone(true);
    try { const u = await api.submitQuiz(score, questions.length); setUser(u); } catch {}
  };

  if (loading) return <View style={styles.bg}><ActivityIndicator color={COLORS.brand} /></View>;

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <View style={styles.bg} testID="quiz-result">
        <LinearGradient colors={["#011627", "#050A10"]} style={StyleSheet.absoluteFillObject} />
        <Particles count={16} />
        <View style={styles.result}>
          <Text style={styles.bigEmoji}>{pct >= 80 ? "🏆" : "🌊"}</Text>
          <Text style={styles.resTitle}>{pct >= 80 ? "MARINE GUARDIAN" : "BUEN INTENTO"}</Text>
          <Text style={styles.resScore}>{score} / {questions.length}</Text>
          <Text style={styles.resSub}>{pct >= 80 ? "Has demostrado tu compromiso oceánico." : "Sigue explorando para dominar el océano."}</Text>
          <Pressable onPress={() => router.back()} style={styles.btn} testID="quiz-close">
            <LinearGradient colors={["#00E5FF", "#14F1D9"]} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.btnTxt}>VOLVER</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const q = questions[idx];
  return (
    <View style={styles.bg} testID="quiz-screen">
      <LinearGradient colors={["#011627", "#050A10"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={14} />
      <Pressable onPress={() => router.back()} style={styles.close} testID="quiz-back">
        <Ionicons name="close" size={22} color={COLORS.brand} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>QUIZ SOSTENIBILIDAD · {idx + 1}/{questions.length}</Text>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${((idx + 1) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.question}>{q.q}</Text>
        <View style={{ gap: 12 }}>
          {q.options.map((opt: string, i: number) => {
            const isPick = picked === i;
            const isAns = i === ANSWERS[idx];
            const showCorrect = picked !== null && isAns;
            const showWrong = isPick && !isAns;
            return (
              <Pressable
                key={i}
                onPress={() => choose(i)}
                testID={`quiz-opt-${i}`}
                style={[styles.opt, showCorrect && styles.optCorrect, showWrong && styles.optWrong]}
              >
                <Text style={[styles.optTxt, (showCorrect || showWrong) && { fontWeight: "700" }]}>{opt}</Text>
                {showCorrect && <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />}
                {showWrong && <Ionicons name="close-circle" size={22} color={COLORS.error} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  close: { position: "absolute", top: 60, right: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,10,16,0.7)", zIndex: 10 },
  scroll: { padding: SPACING.xl, paddingTop: 100, gap: 20, width: "100%" },
  kicker: { color: COLORS.brand, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display },
  progress: { height: 4, borderRadius: 999, backgroundColor: COLORS.surfaceTertiary, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: COLORS.brand, borderRadius: 999 },
  question: { color: COLORS.onSurface, fontSize: 22, fontFamily: FONTS.display, fontWeight: "700", lineHeight: 28 },
  opt: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(14,23,36,0.7)", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optTxt: { color: COLORS.onSurface, fontFamily: FONTS.text, fontSize: 15, flex: 1 },
  optCorrect: { borderColor: COLORS.success, backgroundColor: "rgba(20,241,217,0.15)" },
  optWrong: { borderColor: COLORS.error, backgroundColor: "rgba(255,46,99,0.15)" },
  result: { padding: 40, alignItems: "center", gap: 12 },
  bigEmoji: { fontSize: 80 },
  resTitle: { color: COLORS.onSurface, fontSize: 24, fontFamily: FONTS.display, fontWeight: "800", letterSpacing: 2 },
  resScore: { color: COLORS.brand, fontSize: 48, fontFamily: FONTS.display, fontWeight: "800" },
  resSub: { color: COLORS.onSurfaceMuted, fontSize: 14, fontFamily: FONTS.text, textAlign: "center" },
  btn: { marginTop: 20, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, overflow: "hidden" },
  btnTxt: { color: "#00161B", fontFamily: FONTS.display, letterSpacing: 2, fontWeight: "800" },
});
