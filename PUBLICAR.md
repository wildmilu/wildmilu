# 🚀 Publicar WildMilu sin Netlify (para Pablo)

El sitio ya no depende de Netlify: es HTML estático + un panel propio (`/admin`)
que guarda los cambios directo en GitHub. Lo podés alojar **gratis** en
cualquiera de estas dos opciones. Elegí una.

---

## Opción A · Cloudflare Pages (recomendada si el repo sigue privado)

Gratis, ancho de banda ilimitado y funciona con repos **privados**.

1. Creá una cuenta en https://dash.cloudflare.com (gratis).
2. **Workers & Pages → Create → Pages → Connect to Git**.
3. Autorizá GitHub y elegí el repo **wildmilu**.
4. Configuración del build:
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
5. **Save and Deploy**. Queda en `https://wildmilu.pages.dev`.

Cada cambio en `main` (tuyo o del panel de Mili) se publica solo en ~1 minuto.

## Opción B · GitHub Pages (todo en GitHub)

Gratis, pero **solo para repos públicos** (para privados pide GitHub Pro).
No hay nada privado en el repo: son las mismas fotos que ya se ven en la web,
y la llave del panel NO está guardada en el repo.

1. En GitHub: **Settings → General → Danger Zone → Change visibility → Public**.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
3. Queda en `https://pablote9d.github.io/wildmilu/`.

---

## 🔑 Crear la llave del panel (una vez por año, aprox.)

El panel usa un *token* de GitHub con permiso **solo sobre este repo**.
Mili no necesita cuenta de GitHub: usa la llave que vos le pasás.

1. GitHub → tu foto → **Settings → Developer settings → Personal access tokens
   → Fine-grained tokens → Generate new token**.
2. **Token name:** `WildMilu panel`
3. **Expiration:** la más larga disponible (anotá cuándo vence 📅).
4. **Repository access:** *Only select repositories* → `wildmilu`.
5. **Permissions → Repository permissions → Contents: Read and write**.
   (Nada más. "Metadata: Read" se agrega solo.)
6. **Generate token** y copiá la llave (empieza con `github_pat_`).
7. Abrí `<tu-sitio>/admin` en el celu/compu de Mili, pegá la llave,
   dejá tildado "Recordarme" y entrá. Listo: no la tiene que volver a poner.

> 🔒 Si la llave se pierde o se filtra: borrala en GitHub (mismo lugar) y creá
> otra. Solo da acceso a este repo, nada más de tu cuenta.
>
> ⏰ Cuando venza, el panel va a decir "La llave no es válida o venció":
> generá una nueva y volvé a cargarla.

---

## 🌐 Dominio propio (opcional, ~USD 10/año)

Comprá `wildmilu.com` (Cloudflare lo vende a precio de costo) y:
- **Cloudflare Pages:** tu proyecto → **Custom domains → Set up a domain**.
- **GitHub Pages:** Settings → Pages → **Custom domain**.

El sitio usa rutas relativas, así que funciona igual en un dominio propio o en
una subcarpeta como `github.io/wildmilu/`.

---

## 🧹 Dar de baja Netlify

Cuando el sitio nuevo ande (y probaste el panel), en https://app.netlify.com:
**Site configuration → Delete this site**. Si tenías dominio apuntando a
Netlify, cambiá los DNS antes.
