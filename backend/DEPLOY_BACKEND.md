# 🛰️ Despliegue del Backend ATLANTIS EXPERIENCE

El backend es **FastAPI + MongoDB + Gemini 3.1 Pro**. Aquí tienes 3 opciones de despliegue gratuitas / baratas.

---

## 🟢 OPCIÓN 1 — Render (más sencillo, recomendado)

### 1. Sube el proyecto a GitHub
(ver `README.md` raíz, sección "Save to GitHub")

### 2. Crea una base de datos MongoDB gratis
- Ve a https://www.mongodb.com/cloud/atlas
- Crea un cluster gratis (M0 Free)
- Crea un usuario y obtén la URI: `mongodb+srv://usuario:password@cluster.mongodb.net/atlantis_db`

### 3. Crea un nuevo Web Service en Render
- Ve a https://render.com → New → Web Service
- Conecta tu repo de GitHub
- Configura:
  - **Root Directory**: `backend`
  - **Environment**: `Docker`
  - **Dockerfile path**: `Dockerfile`
  - **Branch**: `main`

### 4. Variables de entorno (Environment tab)
```
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/atlantis_db
DB_NAME=atlantis_db
JWT_SECRET=<genera-un-secreto-largo-y-aleatorio>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=43200
EMERGENT_LLM_KEY=<tu-emergent-llm-key>
```

### 5. Deploy
Render construirá el Dockerfile y expondrá tu API en `https://tu-app.onrender.com`.
Test: `https://tu-app.onrender.com/api/` debe responder `{"app":"Atlantis Experience","status":"online"}`.

---

## 🟣 OPCIÓN 2 — Railway

### 1. Ve a https://railway.app → New Project → Deploy from GitHub Repo
### 2. Selecciona el subdirectorio `backend/`
### 3. Añade plugin MongoDB o conecta MongoDB Atlas
### 4. Variables de entorno (mismas que Render)
### 5. Railway autodetecta el Dockerfile y despliega

---

## 🔵 OPCIÓN 3 — Fly.io (CLI)

```bash
cd backend
fly launch  # detecta el Dockerfile automáticamente
fly secrets set MONGO_URL="..." JWT_SECRET="..." EMERGENT_LLM_KEY="..." DB_NAME="atlantis_db"
fly deploy
```

---

## 🔐 Obtener la Emergent LLM Key

1. Ve a tu perfil en Emergent → **Universal Key**
2. Copia la clave que empieza por `sk-emergent-...`
3. Pégala en `EMERGENT_LLM_KEY`

Esta clave habilita Gemini 3.1 Pro para el chat de ATLANTIS AI.

---

## ✅ Verificar que funciona

```bash
# Registrarse
curl -X POST https://tu-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Tester"}'

# Debe devolver { "token": "...", "user": {...} }
```

---

## 🔗 Conectar el frontend

Edita `/frontend/.env`:
```
EXPO_PUBLIC_BACKEND_URL=https://tu-backend.onrender.com
```

Reconstruye el web export:
```bash
cd frontend
npx expo export --platform web --output-dir dist
```

Y sube `dist/` a GitHub Pages (ver `DEPLOY_WEB.md`).
