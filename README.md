# 🐦 WildMilu — Fotografía de naturaleza de Milagros

Sitio web estático + panel de administración para que Milagros cargue fotos sola.

## 📂 Estructura
```
wildmilu/
├── index.html          → la página principal
├── fotos.json          → 👈 los datos de las fotos (los edita el panel)
├── css/styles.css      → estilos (colores/tipografías en :root)
├── js/main.js          → lógica: lee fotos.json y arma la galería
├── images/             → las fotos (optimizadas para web)
├── admin/              → 🔐 el panel de administración
│   ├── index.html
│   └── config.yml       → define qué puede editar Milagros
├── netlify.toml         → config de hosting
├── ACTIVAR-PANEL.md     → 🔐 pasos para vos: activar el login en Netlify
├── GUIA-MILAGROS.md     → 🐦 guía simple para que Mili suba fotos
├── DEPLOY.md            → guía original de publicación
└── README.md            → este archivo
```

## 🚀 Estado
- ✅ Sitio publicado en Netlify.
- ⏳ Panel /admin: falta activar el login → seguí **ACTIVAR-PANEL.md**.

## ⚙️ Cómo funciona ahora
Las fotos ya NO están en el código: viven en **`fotos.json`**, que el panel
`/admin` edita por vos. El sitio lee ese archivo y arma la galería sola.

## ▶️ Verlo local
Como ahora usa `fetch`, hay que servirlo (no abrir con doble clic):
```bash
cd wildmilu
python -m http.server 8000
```
Y entrá a http://localhost:8000

## ➕ Agregar fotos
- **Milagros:** desde el panel → ver **GUIA-MILAGROS.md**.
- **A mano (vos):** editás `fotos.json` y hacés `git push`.

**Categorías:** Jardín · Bosque · Humedales · Rapaces · Pastizal · Otra fauna

## 🎨 Personalizar
Colores/tipografías: `:root` al inicio de `css/styles.css`.
Textos (hero, "Sobre Milagros"): en `index.html`.

Hecho con cariño para sorprender a Milagros. 💚
