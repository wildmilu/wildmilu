# 🚀 Cómo publicar WildMilu (GitHub + Netlify)

Guía paso a paso para poner el sitio online. Es la **Etapa 1**: publicar la V1.
La **Etapa 2** (panel /admin para que Mili suba fotos sola) la sumamos después.

> ⏱️ Tiempo estimado: 15-20 minutos. No hace falta instalar nada complicado.

---

## 🧱 Requisitos previos (una sola vez)

1. Una cuenta en **GitHub** → https://github.com (gratis)
2. Una cuenta en **Netlify** → https://netlify.com (gratis, podés entrar con GitHub)
3. **Git** instalado en tu compu → https://git-scm.com/downloads
   - Para verificar: abrí una terminal y escribí `git --version`

---

## 📦 PASO 1 · Crear el repositorio en GitHub

1. Entrá a https://github.com/new
2. **Repository name:** `wildmilu`
3. Dejalo **Public** (o Private, funciona igual con Netlify).
4. **NO** tildes "Add a README" (ya tenemos archivos).
5. Clic en **Create repository**.
6. GitHub te muestra una página con comandos. Anotá la URL del repo, que será algo como:
   `https://github.com/TU-USUARIO/wildmilu.git`

---

## ⬆️ PASO 2 · Subir el sitio al repo

Abrí una terminal, ubicate en la carpeta `wildmilu` (donde está `index.html`) y corré:

```bash
cd ruta/a/wildmilu

git init
git add .
git commit -m "WildMilu v1 - galería de fotos de Milagros"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/wildmilu.git
git push -u origin main
```

> 🔑 Si te pide usuario/contraseña, GitHub hoy usa un **token** en lugar de la
> contraseña. Si te complica, la alternativa más fácil es instalar
> **GitHub Desktop** (https://desktop.github.com): arrastrás la carpeta,
> "Publish repository" y listo, sin terminal.

Cuando termine, refrescá la página del repo en GitHub: deberías ver todos los
archivos (`index.html`, `css/`, `js/`, `images/`, etc.).

---

## 🌐 PASO 3 · Conectar Netlify al repo

1. Entrá a https://app.netlify.com y logueate (podés usar tu cuenta de GitHub).
2. Clic en **Add new site → Import an existing project**.
3. Elegí **GitHub** y autorizá el acceso.
4. Buscá y seleccioná el repo **wildmilu**.
5. Netlify te muestra la config de build. Como es un sitio estático:
   - **Build command:** dejalo VACÍO
   - **Publish directory:** `.` (un punto) o vacío
   - (El archivo `netlify.toml` que ya incluimos configura esto solo.)
6. Clic en **Deploy wildmilu**.
7. En ~30-60 segundos vas a ver "Published" y una URL tipo
   `https://random-nombre-123.netlify.app`. **¡Ya está online!** 🎉

---

## ✨ PASO 4 · Ponerle un nombre lindo a la URL

1. En el panel del sitio → **Site configuration → Change site name**
   (o **Domain management**).
2. Escribí `wildmilu`.
3. Tu sitio queda en **https://wildmilu.netlify.app** 💚

---

## 🔄 Cómo actualizar el sitio de ahora en más

Cada vez que cambies algo (por ejemplo, editar `js/data.js` para agregar una foto):

```bash
git add .
git commit -m "Agrego foto nueva"
git push
```

Netlify detecta el push y **republica solo** en menos de un minuto. Mágico. ✨

(Con GitHub Desktop es: escribís el mensaje → "Commit to main" → "Push origin".)

---

## 🎁 (Opcional) Dominio propio wildmilu.com

1. Comprá el dominio en **Namecheap** o **Cloudflare** (~USD 10-13/año).
2. En Netlify → **Domain management → Add a domain** → escribí `wildmilu.com`.
3. Netlify te dice qué registros DNS cargar en el registrador (o podés delegar
   los nameservers a Netlify, que es lo más simple).
4. En unos minutos/horas (propagación DNS) el sitio vive en tu dominio, con
   HTTPS automático incluido.

---

## ➡️ Próxima etapa: el panel para Mili

Una vez que esto esté funcionando, sumamos **Decap CMS**:
- Un `/admin` donde Mili entra, arrastra la foto, llena un formulario y publica.
- Usa **Netlify Identity + Git Gateway** (auth incluida, sin plomería).
- El contenido se sigue guardando en el repo (todo versionado).

Avisame cuando la V1 esté arriba y lo armamos. 🚀
