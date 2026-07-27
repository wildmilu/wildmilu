# 🔐 Cómo activar el panel /admin (para Pablo)

El sitio ya trae el panel armado (`/admin`). Solo falta **activar la autenticación**
en Netlify para que Milagros pueda entrar con su email. Es una configuración de
una sola vez, ~10 minutos.

> ✅ Nota (2026): Netlify confirmó en febrero de 2026 que **Netlify Identity sigue
> siendo un servicio soportado**, así que este método (Identity + Git Gateway) es
> el camino oficial y más simple. Milagros NO necesita cuenta de GitHub.

---

## PASO 1 · Subir la nueva versión al repo

Reemplazá el contenido del repo por esta versión (que ya trae `fotos.json`,
la carpeta `admin/` y el login integrado):

```bash
# desde la carpeta del proyecto
git add .
git commit -m "Agrego panel de administración (Decap CMS)"
git push
```

Netlify va a redeployar solo. Esperá a que termine (~1 min).

---

## PASO 2 · Habilitar Identity (el login)

1. Entrá a tu sitio en https://app.netlify.com
2. En el menú, buscá **Identity** (puede estar en *Integrations → Identity*
   o directamente como pestaña **Identity**).
3. Clic en **Enable Identity**.

---

## PASO 3 · Configurar el registro (solo invitados)

1. Dentro de Identity → **Settings and usage** (o *Configuration*).
2. En **Registration preferences**, elegí **Invite only**.
   👉 Así nadie se puede registrar solo; solo entra quien vos invites.

---

## PASO 4 · Habilitar Git Gateway (la llave al repo)

1. En Identity, bajá hasta **Services → Git Gateway**.
2. Clic en **Enable Git Gateway**.
   👉 Esto es lo que permite que el panel guarde las fotos en el repo
   sin que Milagros tenga acceso directo a GitHub.

---

## PASO 5 · Invitar a Milagros (¡y a vos!)

1. En Identity → pestaña **Identity** → botón **Invite users**.
2. Escribí el **email de Milagros** (y el tuyo, para probar vos primero).
3. Enviar. Le va a llegar un mail de invitación.

> 💡 **Probá vos primero:** invitá tu propio email, aceptá la invitación,
> creá una contraseña y entrá a `wildmilu.netlify.app/admin`. Si podés agregar
> una foto de prueba, ¡está todo listo para Mili! 🎉

---

## PASO 6 · El primer login de Milagros

1. Milagros abre el mail → clic en **Accept the invite**.
2. La lleva al sitio → le pide crear una **contraseña**.
3. Listo: entra a `wildmilu.netlify.app/admin` y ya puede cargar fotos.

---

## ✅ Cómo saber que quedó bien

- Entrás a `wildmilu.netlify.app/admin` y aparece una pantalla de **Login**.
- Te logueás y ves la sección **"Galería de WildMilu"** con la lista de las 16 fotos.
- Agregás una, "Publicar", y en ~1 min aparece en la web. 🐦

---

## ⚠️ Un detalle sobre el peso de las fotos

El panel guarda las imágenes **tal cual las sube Milagros** (no las optimiza
solo). Si ella sube fotos de 3-5 MB directo de la cámara, el sitio va a ir
creciendo en peso. Dos caminos para cuando quieras:

- **Fácil:** pedirle que suba fotos ya redimensionadas (~1600px de ancho).
- **Automático (etapa futura):** sumamos un paso de optimización en el deploy.
  Avisame y lo armamos.

---

## 🆘 Si algo no funciona

- **El /admin muestra "config error"** → revisá que `admin/config.yml` esté en
  el repo y que `repo`/`branch` sean correctos (branch `main`).
- **No puede loguearse** → verificá que Git Gateway esté *Enabled* (Paso 4).
- **La foto no aparece** → esperá 1-2 min (Netlify reconstruye) y recargá con
  Ctrl+F5. Revisá en GitHub que el commit haya llegado.
