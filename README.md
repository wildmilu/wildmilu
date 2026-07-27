# 🐦 WildMilu — Fotografía de naturaleza de Milagros

Sitio web estático, liviano y fácil de mantener. Sin frameworks ni build:
son solo archivos que cualquier navegador entiende.

## 📂 Estructura
```
wildmilu/
├── index.html          → la página (estructura y textos)
├── 404.html            → página de error personalizada
├── css/styles.css      → estilos (colores y tipografías en :root)
├── js/data.js          → 👈 TUS FOTOS viven acá (lo único que se edita)
├── js/main.js          → lógica (galería, filtros, visor). No hace falta tocar.
├── images/             → las fotos
├── netlify.toml        → config de publicación en Netlify
└── DEPLOY.md           → 🚀 guía paso a paso para publicar online
```

## ▶️ Cómo verlo en tu compu
Doble clic en `index.html`, o mejor con un servidor local:
```bash
cd wildmilu
python -m http.server 8000
```
Y entrá a http://localhost:8000

## 🚀 Cómo publicarlo online
Seguí la guía **DEPLOY.md** (GitHub + Netlify, paso a paso).

## ➕ Cómo agregar / editar una foto (para Milagros)
1. Copiá la imagen en la carpeta `images/`.
2. Abrí `js/data.js` y duplicá un bloque `{ ... }`.
3. Editá: titulo, especie, categoria, lugar, fecha, descripcion.
4. Guardá y recargá. La galería y los filtros se actualizan solos. ✅

**Categorías actuales:** Jardín · Bosque · Humedales · Rapaces · Pastizal · Otra fauna

## ✏️ Pendientes para completar
- Revisar/corregir las **especies** (son una primera estimación).
- Completar **lugar** y **fecha** de cada foto (están vacíos a propósito).

## 🎨 Personalizar
Los colores y tipografías están al inicio de `css/styles.css` (bloque `:root`).
Los textos (hero, "Sobre Milagros", contacto) se editan en `index.html`.

## ➡️ Próxima etapa
Panel `/admin` (Decap CMS) para que Mili suba fotos sola desde una web,
sin tocar código. Se suma sobre este mismo repo.

Hecho con cariño para sorprender a Milagros. 💚
