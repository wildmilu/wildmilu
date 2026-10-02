/* =====================================================================
   WildMilu · PANEL DE MILAGROS
   ---------------------------------------------------------------------
   Reemplaza a Decap CMS + Netlify Identity. Habla directo con la API de
   GitHub usando una "llave" (token fine-grained con permiso solo sobre
   este repo). Cada vez que se publica, hace UN commit con fotos.json y
   las imágenes nuevas; el hosting (GitHub Pages / Cloudflare Pages)
   redeploya solo.

   Las fotos se achican en el navegador antes de subirlas, así el sitio
   no crece con archivos de 5 MB recién salidos de la cámara.
   ===================================================================== */

const CONFIG = {
  owner: "wildmilu",
  repo: "wildmilu.github.io",
  branch: "main",
  archivoDatos: "fotos.json",
  carpetaImagenes: "images",
  maxLado: 2000,      // px del lado más largo al achicar
  calidad: 0.85,      // calidad JPEG (0 a 1)
};

const CATEGORIAS = ["Jardín", "Bosque", "Humedales", "Rapaces", "Pastizal", "Otra fauna"];
const CLAVE_TOKEN = "wildmilu-token";
const API = "https://api.github.com";

/* ---------- Estado ---------- */
let token = "";
let fotos = [];               // lo que se ve en el panel (con cambios)
let fotosPublicadas = [];     // copia de lo último publicado (para "Descartar")
let commitBase = "";          // commit sobre el que se cargó fotos.json
let shaDatos = "";            // sha de fotos.json en ese commit
let imagenesNuevas = new Map();   // ruta → base64 (pendientes de subir)
let vistasPrevias = new Map();    // ruta → objectURL (para ver fotos aún no desplegadas)
let cambios = [];             // descripciones para el mensaje del commit
let editando = -1;            // índice en edición (-1 = nueva)
let imagenElegida = null;     // { base64, url, nombre } en el formulario

const $ = id => document.getElementById(id);

/* =====================================================================
   API de GitHub
   ===================================================================== */
async function gh(ruta, { method = "GET", body } = {}) {
  const res = await fetch(API + ruta, {
    method,
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = new Error(`GitHub respondió ${res.status}`);
    err.status = res.status;
    try { err.detalle = (await res.json()).message; } catch {}
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const repo = () => `/repos/${CONFIG.owner}/${CONFIG.repo}`;

function base64ATexto(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function leerDatos(commit) {
  const archivo = await gh(`${repo()}/contents/${CONFIG.archivoDatos}?ref=${commit}`);
  return { sha: archivo.sha, datos: JSON.parse(base64ATexto(archivo.content)) };
}

async function cargar() {
  const ref = await gh(`${repo()}/git/ref/heads/${CONFIG.branch}`);
  const { sha, datos } = await leerDatos(ref.object.sha);
  commitBase = ref.object.sha;
  shaDatos = sha;
  fotosPublicadas = (datos.fotos || []).filter(f => f && f.src);
  fotos = structuredClone(fotosPublicadas);
  imagenesNuevas.clear();
  cambios = [];
  render();
}

/* Un solo commit con fotos.json + imágenes nuevas */
async function publicar() {
  const ref = await gh(`${repo()}/git/ref/heads/${CONFIG.branch}`);
  const cabeza = ref.object.sha;

  // Si alguien publicó desde otro dispositivo, no pisamos sus cambios.
  if (cabeza !== commitBase) {
    const { sha } = await leerDatos(cabeza);
    if (sha !== shaDatos) {
      const err = new Error("conflicto");
      err.conflicto = true;
      throw err;
    }
  }

  const commit = await gh(`${repo()}/git/commits/${cabeza}`);
  const arbol = [];

  const usadas = new Set(fotos.map(f => rutaRepo(f.src)));
  for (const [ruta, base64] of imagenesNuevas) {
    if (!usadas.has(ruta)) continue;  // se agregó y se borró antes de publicar
    const blob = await gh(`${repo()}/git/blobs`, { method: "POST", body: { content: base64, encoding: "base64" } });
    arbol.push({ path: ruta, mode: "100644", type: "blob", sha: blob.sha });
  }

  // Las imágenes de fotos borradas NO se eliminan del repo: alguna puede
  // estar usada en otra parte del sitio (ej: la de "Sobre Milagros").

  arbol.push({
    path: CONFIG.archivoDatos, mode: "100644", type: "blob",
    content: JSON.stringify({ fotos }, null, 2) + "\n",
  });

  const nuevoArbol = await gh(`${repo()}/git/trees`, { method: "POST", body: { base_tree: commit.tree.sha, tree: arbol } });
  const mensaje = cambios.length === 1 ? cambios[0] : `Actualizar galería (${cambios.length} cambios)\n\n- ` + cambios.join("\n- ");
  const nuevo = await gh(`${repo()}/git/commits`, { method: "POST", body: { message: mensaje, tree: nuevoArbol.sha, parents: [cabeza] } });
  await gh(`${repo()}/git/refs/heads/${CONFIG.branch}`, { method: "PATCH", body: { sha: nuevo.sha } });

  await cargar();
}

/* =====================================================================
   Imágenes
   ===================================================================== */
function rutaRepo(src) {
  return String(src || "").trim().replace(/^\/+/, "");
}

function urlMiniatura(src) {
  const ruta = rutaRepo(src);
  if (/^https?:\/\//i.test(src)) return src;
  return vistasPrevias.get(ruta) || "../" + ruta;
}

/* Achica la foto (lado mayor ≤ maxLado) y la pasa a JPEG */
function procesarImagen(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, CONFIG.maxLado / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * escala);
      canvas.height = Math.round(img.naturalHeight * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error("No se pudo convertir la imagen"));
        // Si ya era un JPEG chico, recomprimirlo solo lo empeora: va el original.
        if (escala === 1 && archivo.type === "image/jpeg" && archivo.size <= blob.size) blob = archivo;
        const lector = new FileReader();
        lector.onload = () => resolve({
          base64: lector.result.split(",")[1],
          url: URL.createObjectURL(blob),
          peso: blob.size,
          ancho: canvas.width,
          alto: canvas.height,
        });
        lector.onerror = reject;
        lector.readAsDataURL(blob);
      }, "image/jpeg", CONFIG.calidad);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("formato")); };
    img.src = url;
  });
}

function slug(texto) {
  return (texto || "foto").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "foto";
}

function rutaNueva(titulo) {
  const existentes = new Set([...fotos.map(f => rutaRepo(f.src)), ...imagenesNuevas.keys()]);
  const base = `${CONFIG.carpetaImagenes}/${slug(titulo)}`;
  let ruta = `${base}.jpg`, n = 2;
  while (existentes.has(ruta)) ruta = `${base}-${n++}.jpg`;
  return ruta;
}

/* =====================================================================
   Interfaz
   ===================================================================== */
function aviso(texto, esError = false) {
  const el = $("aviso");
  el.textContent = texto;
  el.classList.toggle("error-aviso", esError);
  el.hidden = false;
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => (el.hidden = true), esError ? 7000 : 4000);
}

function boton(texto, titulo, clase, accion) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn--icono " + clase;
  b.textContent = texto;
  b.title = titulo;
  b.setAttribute("aria-label", titulo);
  b.addEventListener("click", accion);
  return b;
}

function render() {
  const lista = $("lista");
  lista.innerHTML = "";
  $("contador").textContent = `(${fotos.length})`;

  fotos.forEach((foto, i) => {
    const li = document.createElement("li");
    li.className = "item";

    const img = document.createElement("img");
    img.src = urlMiniatura(foto.src);
    img.alt = "";
    img.loading = "lazy";

    const texto = document.createElement("div");
    texto.className = "item__texto";
    const titulo = document.createElement("div");
    titulo.className = "item__titulo";
    titulo.textContent = foto.titulo || "(sin título)";
    if (imagenesNuevas.has(rutaRepo(foto.src))) {
      const et = document.createElement("span");
      et.className = "etiqueta";
      et.textContent = "nueva";
      titulo.appendChild(et);
    }
    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = [foto.categoria, foto.especie].filter(Boolean).join(" · ");
    texto.append(titulo, meta);

    const acciones = document.createElement("div");
    acciones.className = "item__acciones";
    const subir = boton("↑", "Subir", "btn--suave", () => mover(i, -1));
    const bajar = boton("↓", "Bajar", "btn--suave", () => mover(i, 1));
    subir.disabled = i === 0;
    bajar.disabled = i === fotos.length - 1;
    acciones.append(
      subir, bajar,
      boton("Editar", "Editar", "btn--suave", () => abrirFormulario(i)),
      boton("Borrar", "Borrar", "btn--peligro", () => borrar(i)),
    );

    li.append(img, texto, acciones);
    lista.appendChild(li);
  });

  $("pendientes").hidden = cambios.length === 0;
  $("pendientes-texto").textContent = cambios.length === 1
    ? "Tenés 1 cambio sin publicar"
    : `Tenés ${cambios.length} cambios sin publicar`;
}

function mover(i, dir) {
  const j = i + dir;
  [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
  cambios.push(`Reordenar "${fotos[j].titulo}"`);
  render();
}

function borrar(i) {
  if (!confirm(`¿Borrar "${fotos[i].titulo}"? (se borra al publicar)`)) return;
  const [foto] = fotos.splice(i, 1);
  cambios.push(`Eliminar foto "${foto.titulo}"`);
  render();
}

/* ---------- Formulario ---------- */
function abrirFormulario(i = -1) {
  editando = i;
  imagenElegida = null;
  const foto = i >= 0 ? fotos[i] : { titulo: "", especie: "", categoria: "Otra fauna", lugar: "", fecha: "", descripcion: "" };

  $("dialogo-titulo").textContent = i >= 0 ? "Editar foto" : "Agregar foto";
  $("archivo-label").textContent = i >= 0 ? "Cambiar foto" : "Elegir foto";
  $("archivo").value = "";
  $("archivo-info").textContent = "";
  $("form-error").hidden = true;
  $("vista-previa").hidden = i < 0;
  if (i >= 0) $("vista-previa").src = urlMiniatura(foto.src);

  $("f-titulo").value = foto.titulo || "";
  $("f-especie").value = foto.especie || "";
  $("f-categoria").value = CATEGORIAS.includes(foto.categoria) ? foto.categoria : "Otra fauna";
  $("f-lugar").value = foto.lugar || "";
  $("f-fecha").value = foto.fecha || "";
  $("f-descripcion").value = foto.descripcion || "";

  $("dialogo").showModal();
}

async function alElegirArchivo() {
  const archivo = $("archivo").files[0];
  if (!archivo) return;
  $("archivo-info").textContent = "Preparando la foto…";
  $("btn-guardar").disabled = true;
  try {
    imagenElegida = await procesarImagen(archivo);
    $("vista-previa").src = imagenElegida.url;
    $("vista-previa").hidden = false;
    const mb = (archivo.size / 1048576).toFixed(1);
    const kb = Math.round(imagenElegida.peso / 1024);
    $("archivo-info").textContent = `Lista ✓ ${imagenElegida.ancho}×${imagenElegida.alto}px · ${mb} MB → ${kb} KB`;
    if (!$("f-titulo").value) $("f-titulo").value = archivo.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  } catch {
    imagenElegida = null;
    $("archivo-info").textContent = "No se pudo leer esta foto. Probá con JPG o PNG.";
  } finally {
    $("btn-guardar").disabled = false;
  }
}

function guardarFormulario(e) {
  e.preventDefault();
  const titulo = $("f-titulo").value.trim();
  if (editando < 0 && !imagenElegida) {
    $("form-error").textContent = "Falta elegir la foto.";
    $("form-error").hidden = false;
    return;
  }
  if (!titulo) {
    $("form-error").textContent = "Falta el título.";
    $("form-error").hidden = false;
    return;
  }

  const datos = {
    src: editando >= 0 ? fotos[editando].src : "",
    titulo,
    especie: $("f-especie").value.trim(),
    categoria: $("f-categoria").value,
    lugar: $("f-lugar").value.trim(),
    fecha: $("f-fecha").value.trim(),
    descripcion: $("f-descripcion").value.trim(),
  };

  if (imagenElegida) {
    const ruta = rutaNueva(titulo);
    imagenesNuevas.set(ruta, imagenElegida.base64);
    vistasPrevias.set(ruta, imagenElegida.url);
    datos.src = ruta;
  }

  if (editando >= 0) {
    fotos[editando] = datos;
    cambios.push(`Editar foto "${titulo}"`);
  } else {
    fotos.unshift(datos);   // las nuevas aparecen primero en la galería
    cambios.push(`Agregar foto "${titulo}"`);
  }

  $("dialogo").close();
  render();
}

/* ---------- Login / sesión ---------- */
function mostrar(vista) {
  $("vista-login").hidden = vista !== "login";
  $("vista-panel").hidden = vista !== "panel";
}

function mensajeError(err) {
  if (err.status === 401) return "La llave no es válida o venció. Pedile una nueva a Pablo.";
  if (err.status === 403 || err.status === 404) return "La llave no tiene permiso sobre el repositorio.";
  if (err.conflicto) return "Hubo cambios desde otro dispositivo. Recargá la página y volvé a hacer tus cambios.";
  if (err instanceof TypeError) return "Sin conexión. Revisá internet y probá de nuevo.";
  return "Algo salió mal: " + (err.detalle || err.message);
}

async function entrar(t, recordar) {
  token = t;
  try {
    await cargar();
    try { recordar ? localStorage.setItem(CLAVE_TOKEN, t) : localStorage.removeItem(CLAVE_TOKEN); } catch {}
    mostrar("panel");
  } catch (err) {
    token = "";
    try { localStorage.removeItem(CLAVE_TOKEN); } catch {}
    mostrar("login");
    $("login-error").textContent = mensajeError(err);
    $("login-error").hidden = false;
  }
}

/* ---------- Eventos ---------- */
$("f-categoria").innerHTML = CATEGORIAS.map(c => `<option>${c}</option>`).join("");

$("form-login").addEventListener("submit", e => {
  e.preventDefault();
  $("login-error").hidden = true;
  entrar($("token").value.trim(), $("recordar").checked);
});

$("btn-salir").addEventListener("click", () => {
  if (cambios.length && !confirm("Tenés cambios sin publicar. ¿Salir igual?")) return;
  try { localStorage.removeItem(CLAVE_TOKEN); } catch {}
  location.reload();
});

$("btn-agregar").addEventListener("click", () => abrirFormulario());
$("btn-cancelar").addEventListener("click", () => $("dialogo").close());
$("archivo").addEventListener("change", alElegirArchivo);
$("form-foto").addEventListener("submit", guardarFormulario);

$("btn-descartar").addEventListener("click", () => {
  if (!confirm("¿Descartar todos los cambios sin publicar?")) return;
  fotos = structuredClone(fotosPublicadas);
  imagenesNuevas.clear();
  cambios = [];
  render();
});

$("btn-publicar").addEventListener("click", async () => {
  const btn = $("btn-publicar");
  btn.disabled = true;
  btn.textContent = "Publicando…";
  try {
    await publicar();
    aviso("¡Publicado! 🎉 En 1-2 minutos se ve en la web.");
  } catch (err) {
    aviso(mensajeError(err), true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Publicar";
  }
});

window.addEventListener("beforeunload", e => {
  if (cambios.length) { e.preventDefault(); e.returnValue = ""; }
});

/* ---------- Inicio ---------- */
let guardado = null;
try { guardado = localStorage.getItem(CLAVE_TOKEN); } catch {}
if (guardado) entrar(guardado, true);
else mostrar("login");
