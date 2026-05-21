import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/auth";
import { COLORS, FONTS, IMAGES, RADIUS, SPACING, TYPE } from "../src/theme";
import HUDButton from "../src/components/HUDButton";
import Particles from "../src/components/Particles";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null); setLoading(true);
    try {
      await login(email.trim(), pwd);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }} testID="login-screen">
      <ImageBackground source={{ uri: IMAGES.welcomeBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient colors={["rgba(5,10,16,0.65)", "rgba(5,10,16,0.95)"]} style={StyleSheet.absoluteFillObject} />
      <Particles count={14} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} testID="login-back-btn">
            <Ionicons name="chevron-back" size={22} color={COLORS.brand} />
          </Pressable>
          <Text style={styles.kicker}>ACCESO EXPLORADOR</Text>
          <Text style={styles.title}>Bienvenido{"\n"}de vuelta.</Text>
          <Text style={styles.sub}>Las corrientes te esperan, explorador.</Text>

          <View style={styles.form}>
            <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="explorer@atlantis.com" keyboardType="email-address" testID="login-email" />
            <Field label="CONTRASEÑA" value={pwd} onChangeText={setPwd} placeholder="••••••••" secure testID="login-password" />
            {err ? <Text style={styles.err} testID="login-error">{err}</Text> : null}
            <HUDButton
              testID="login-submit-btn"
              label={loading ? "ACCEDIENDO..." : "Acceder"}
              onPress={submit}
              icon={loading ? <ActivityIndicator size="small" color="#00161B" /> : <Ionicons name="enter" size={18} color="#00161B" />}
            />
            <Pressable onPress={() => router.replace("/register")} style={{ alignItems: "center", marginTop: 12 }} testID="login-go-register-btn">
              <Text style={styles.link}>¿Sin cuenta? Crear inmersión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, secure, keyboardType, testID }: any) {
  return (
    <View style={fStyles.wrap}>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.onSurfaceDim}
        secureTextEntry={!!secure}
        autoCapitalize="none"
        keyboardType={keyboardType}
        style={fStyles.input}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "rgba(14,23,36,0.55)" },
  label: { color: COLORS.brand, fontSize: 10, letterSpacing: 2.5, fontFamily: FONTS.display, marginBottom: 4 },
  input: { color: COLORS.onSurface, fontSize: 16, fontFamily: FONTS.text, paddingVertical: 6 },
});

const styles = StyleSheet.create({
  scroll: { padding: SPACING.xl, paddingTop: 80, gap: SPACING.lg },
  back: { position: "absolute", top: 50, left: 20, padding: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(14,23,36,0.6)" },
  kicker: { color: COLORS.brandSecondary, fontSize: 11, letterSpacing: 3, fontFamily: FONTS.display, marginTop: 30 },
  title: { color: COLORS.onSurface, fontSize: TYPE.hero, fontFamily: FONTS.display, fontWeight: "800", lineHeight: 42, letterSpacing: -1 },
  sub: { color: COLORS.onSurfaceMuted, fontSize: 15, fontFamily: FONTS.text, marginBottom: 12 },
  form: { gap: 14 },
  err: { color: COLORS.error, fontSize: 13, fontFamily: FONTS.text, textAlign: "center" },
  link: { color: COLORS.brand, fontFamily: FONTS.text, fontSize: 14 },
});
