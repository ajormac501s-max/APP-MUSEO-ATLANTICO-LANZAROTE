import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "atlantis_token";

export async function setToken(token: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") return window.localStorage.getItem(KEY);
    return null;
  }
  return await SecureStore.getItemAsync(KEY);
}
export async function clearToken() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

const BASE = (process.env.EXPO_PUBLIC_BACKEND_URL || "") + "/api";

async function request(path: string, options: RequestInit = {}, auth = true) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && data.detail) || `Error ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : "Error");
  }
  return data;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) }, false),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false),
  me: () => request("/auth/me"),
  sculptures: () => request("/sculptures"),
  sculpture: (id: string) => request(`/sculptures/${id}`),
  unlock: (sculpture_id: string) =>
    request("/sculptures/unlock", { method: "POST", body: JSON.stringify({ sculpture_id }) }),
  missions: () => request("/missions"),
  arScan: (sculpture_id: string) =>
    request("/missions/ar-scan", { method: "POST", body: JSON.stringify({ sculpture_id }) }),
  vrComplete: () => request("/missions/vr-complete", { method: "POST" }),
  quiz: () => request("/quiz"),
  submitQuiz: (score: number, total: number) =>
    request("/quiz/submit", { method: "POST", body: JSON.stringify({ score, total }) }),
  aiChat: (message: string) =>
    request("/ai/chat", { method: "POST", body: JSON.stringify({ message }) }),
  aiHistory: () => request("/ai/history"),
  rewards: () => request("/rewards"),
};
