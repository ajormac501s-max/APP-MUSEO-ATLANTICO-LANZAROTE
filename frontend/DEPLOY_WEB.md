# 🌐 Despliegue Web Estático en GitHub Pages

El build web ya está generado en `/frontend/dist/` (20 rutas estáticas). Solo necesitas subirlo.

---

## 📋 Pre-requisitos

⚠️ **El frontend web necesita un backend desplegado**. Antes de empezar:
1. Despliega el backend siguiendo [`/backend/DEPLOY_BACKEND.md`](../backend/DEPLOY_BACKEND.md)
2. Anota la URL pública (ej. `https://atlantis-api.onrender.com`)

---

## 🚀 PASO 1 — Configurar el backend URL

Edita `/frontend/.env`:
```
EXPO_PUBLIC_BACKEND_URL=https://atlantis-api.onrender.com
```

Reconstruye el build:
```bash
cd frontend
npx expo export --platform web --output-dir dist
```

---

## 🚀 PASO 2 — Subir a GitHub Pages

### Método A — Branch `gh-pages` (recomendado)

```bash
cd frontend

# Instala gh-pages si no lo tienes
yarn add --dev gh-pages

# Añade a package.json en "scripts":
#   "deploy": "gh-pages -d dist"

# Despliega
yarn deploy
```

GitHub Pages servirá tu app en:
`https://<tu-usuario>.github.io/<nombre-repo>/`

### Método B — Subir manual a una nueva rama

```bash
cd frontend/dist
git init
git checkout -b gh-pages
git add .
git commit -m "Deploy Atlantis Experience web"
git remote add origin https://github.com/<tu-usuario>/<repo>.git
git push -f origin gh-pages
```

### Método C — GitHub Actions (auto-deploy)

Crea `.github/workflows/deploy.yml`:
```yaml
name: Deploy Atlantis Web
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && yarn install
      - run: cd frontend && npx expo export --platform web --output-dir dist
        env:
          EXPO_PUBLIC_BACKEND_URL: ${{ secrets.BACKEND_URL }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

Añade `BACKEND_URL` en Settings → Secrets and variables → Actions.

---

## ⚙️ PASO 3 — Activar GitHub Pages

1. Ve a tu repo en GitHub → Settings → Pages
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` → `/ (root)`
4. Save

En ~1 min tu app estará disponible en:
`https://<tu-usuario>.github.io/<nombre-repo>/`

---

## 🛠️ Configurar base path (si el repo NO se llama `<usuario>.github.io`)

Si tu repo se llama `atlantis-experience`, la app vivirá en `/atlantis-experience/`. Edita `frontend/app.json` ANTES de exportar:

```json
{
  "expo": {
    ...
    "experiments": {
      "baseUrl": "/atlantis-experience"
    }
  }
}
```

Luego vuelve a exportar:
```bash
npx expo export --platform web --output-dir dist
```

---

## ⚠️ Limitaciones del build web

Algunas features de la app móvil NO funcionan al 100% en web:

| Feature | Web | Móvil (Expo Go) |
|---------|-----|------------------|
| Auth + UI | ✅ | ✅ |
| Mapa + Esculturas | ✅ | ✅ |
| Misiones + Quiz | ✅ | ✅ |
| ATLANTIS AI chat | ✅ | ✅ |
| AR holográfica (simulada) | ✅ visual | ✅ visual |
| Haptics | ❌ | ✅ |
| SecureStore | ⚠️ usa localStorage | ✅ |
| expo-blur (glassmorphism) | ⚠️ menos intenso | ✅ |

Para la experiencia completa premium, recomienda a los usuarios descargar la app móvil.

---

## 🎉 Listo

Tu Atlantis Experience web estará disponible al mundo. Comparte el link 🌊
