# 🌊 ATLANTIS EXPERIENCE

> Aplicación móvil **gamificada ultra premium** para el **Museo Atlántico Lanzarote** — el primer museo submarino de Europa.

Una experiencia inmersiva que combina turismo inteligente, gamificación, realidad aumentada simulada, exploración submarina y una IA holográfica futurista (**ATLANTIS AI** basada en Gemini 3.1 Pro).

![Stack](https://img.shields.io/badge/Stack-Expo%20%2B%20FastAPI%20%2B%20MongoDB%20%2B%20Gemini-00E5FF?style=for-the-badge)

---

## ✨ Features

- 🔐 **Auth JWT** (email + contraseña, bcrypt)
- 🗺️ **Mapa submarino interactivo** con 12 esculturas reales de Jason deCaires Taylor
- 🎮 **Gamificación completa**: 10 niveles (Surface Diver → Atlantis Master), XP, insignias
- 🎯 **5 misiones**: Ocean Explorer, Marine Guardian, Underwater Hunter, Deep Diver, Atlantis Master
- 📸 **AR cinematográfica** estilo Apple Vision Pro (reticle holográfico + scan-line)
- 🤿 **VR Deep Dive** modo inmersivo 360°
- 🧠 **Quiz** de sostenibilidad oceánica
- 🤖 **ATLANTIS AI** chat con **Gemini 3.1 Pro** (vía Emergent LLM Key)
- 🏆 **Recompensas**: insignias, descuentos al museo, tour VIP, contenido exclusivo
- 🎨 **Estética cinematográfica**: deep ocean dark + cyan glow #00E5FF, glassmorphism, partículas animadas, gradientes premium

---

## 📂 Estructura del proyecto

```
app/
├── backend/                  # FastAPI + MongoDB
│   ├── server.py             # API completa (auth, sculptures, missions, AI chat)
│   ├── requirements.txt
│   ├── Dockerfile            # Para deploy en Render/Railway/Fly.io
│   └── .env.example
├── frontend/                 # Expo Router (React Native)
│   ├── app/                  # Rutas (Welcome, Login, Home, Map, AI, Profile, AR, VR, Quiz, Rewards)
│   ├── src/                  # theme, api, auth, components
│   ├── dist/                 # Build web estático (auto-generado, listo para GitHub Pages)
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🚀 Cómo desplegarlo

Tienes **dos opciones**:

### Opción A — Web estático (GitHub Pages)
Ver guía detallada en [`/frontend/DEPLOY_WEB.md`](frontend/DEPLOY_WEB.md). El build ya está generado en `/frontend/dist/`. Solo necesitas:

1. Subir `dist/` a la rama `gh-pages` de tu repo
2. Activar GitHub Pages en Settings → Pages
3. Desplegar el backend aparte (ver opción B abajo)

### Opción B — Backend FastAPI (Render / Railway / Fly.io)
Ver guía detallada en [`/backend/DEPLOY_BACKEND.md`](backend/DEPLOY_BACKEND.md). Incluye `Dockerfile` listo y variables de entorno.

### Opción C — Local (desarrollo)
```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # rellena MONGO_URL, JWT_SECRET, EMERGENT_LLM_KEY
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (en otra terminal)
cd frontend
yarn install
cp .env.example .env  # apunta EXPO_PUBLIC_BACKEND_URL a tu backend
yarn start
```

Escanea el QR con la app **Expo Go** o pulsa `w` para abrir en navegador.

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|------|------------|
| **Móvil** | Expo SDK 54, expo-router, React Native 0.81 |
| **UI** | expo-blur (glassmorphism), expo-linear-gradient, react-native-reanimated, expo-image, expo-haptics |
| **Backend** | FastAPI + Motor (MongoDB async) |
| **Auth** | JWT + bcrypt |
| **IA** | Gemini 3.1 Pro vía `emergentintegrations` |
| **Base de datos** | MongoDB |

---

## 🔑 Variables de entorno requeridas

**Backend (`/backend/.env`)**:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=atlantis_db
JWT_SECRET=<tu-secreto-largo>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=43200
EMERGENT_LLM_KEY=<tu-key>   # Obtener desde Emergent: Profile → Universal Key
```

**Frontend (`/frontend/.env`)**:
```
EXPO_PUBLIC_BACKEND_URL=https://tu-backend.onrender.com
```

---

## 🧪 Credenciales de prueba

- Email: `explorer@atlantis.com`
- Password: `atlantis2026`

(o crea tu propio usuario en pantalla "Iniciar Inmersión")

---

## 📜 Licencia

MIT — Uso libre con atribución. Las esculturas pertenecen a Jason deCaires Taylor y al Museo Atlántico Lanzarote.

---

Hecho con ❤️ por Emergent · 🌊 **Sumérgete en la experiencia.**
