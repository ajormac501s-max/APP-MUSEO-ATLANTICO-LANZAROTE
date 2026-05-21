# ATLANTIS EXPERIENCE — PRD

Premium gamified mobile experience for Museo Atlántico Lanzarote (first underwater museum in Europe).

## Stack
- Frontend: Expo Router, React Native, expo-blur, expo-linear-gradient, expo-image, expo-haptics, react-native-reanimated
- Backend: FastAPI + MongoDB (motor)
- AI: Gemini 3.1 Pro (via emergentintegrations + Emergent LLM Key) as ATLANTIS AI
- Auth: JWT + bcrypt email/password

## Theme
Deep ocean dark (#050A10) with cyan glow #00E5FF and turquoise #14F1D9. Glassmorphism, holographic HUD elements, animated underwater particles.

## Screens
- Welcome / Login / Register (cinematic underwater)
- Tabs: Home (XP HUD + featured sculptures), Mapa Submarino (12 esculturas + filtros por zona), Misiones (5 retos gamificados), ATLANTIS AI (chat holográfico), Perfil (nivel/insignias)
- AR Experience (escaneo holográfico estilo Apple Vision Pro)
- VR Deep Dive (inmersión 360°)
- Quiz Sostenibilidad
- Sculpture detail
- Rewards (insignias + descuentos + experiencias)

## Gamification
- XP por descubrir esculturas (+100), AR scan (+150), Quiz (+50/pregunta), VR (+500), misión Atlantis Master (+1000)
- 10 niveles (Surface Diver → Atlantis Master)
- 5 misiones: Ocean Explorer, Marine Guardian, Underwater Hunter, Deep Diver, Atlantis Master
- 8 recompensas (insignias + descuento museo + tour VIP + contenido exclusivo)

## Data
- 12 esculturas reales de Jason deCaires Taylor con descripciones curadas, año, profundidad y zona

## Business angle
**Marketing experiencial**: descuentos para entrada al museo y tour VIP guiado se desbloquean por niveles, convirtiendo a cada visitante en un cliente recurrente y embajador social al compartir sus insignias.
