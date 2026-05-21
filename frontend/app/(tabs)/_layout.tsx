import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../src/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.onSurfaceDim,
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 1.5, fontFamily: FONTS.display, fontWeight: "600", marginBottom: 4 },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {Platform.OS !== "web" ? (
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(5,10,16,0.92)" }]} />
            )}
            <View style={styles.topBorder} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "INICIO",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "water" : "water-outline"} color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "MAPA",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "map" : "map-outline"} color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: "MISIONES",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "trophy" : "trophy-outline"} color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "ATLANTIS AI",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "sparkles" : "sparkles-outline"} color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "PERFIL",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person-circle" : "person-circle-outline"} color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    height: 76,
    paddingTop: 8,
  },
  topBorder: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: COLORS.borderStrong, shadowColor: COLORS.brand, shadowOpacity: 0.8, shadowRadius: 8 },
});
