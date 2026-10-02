/* =====================================================================
   WildMilu · LÓGICA DEL SITIO
   ---------------------------------------------------------------------
   Las fotos viven en  fotos.json  y el texto de "Sobre Milagros" en
   sitio.json (los dos los edita el panel /admin). Este archivo los lee
   y arma la galería, los filtros y el visor.
   No hace falta tocarlo para agregar fotos.
   ===================================================================== */

const galeria   = document.getElementById("galeria");
const filtrosEl = document.getElementById("filtros");

// Orden fijo de los filtros (solo se muestran las clases que tienen fotos)
const CLASES = ["Aves", "Mamíferos", "Reptiles", "Anfibios", "Peces", "Invertebrados"];

let FOTOS = [];
let fotosVisibles = [];

/* ---------------------------------------------------------------------
   Rutas de imágenes
   --------------------------------------------------------------------- */
// Tolera "images/x.jpg", "/images/x.jpg" o una URL completa. Las rutas quedan
// relativas para que el sitio funcione en un dominio propio o en una subcarpeta.
function normalizarRuta(src) {
  if (!src) return "";
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s)) return s;   // URL completa: se deja igual
  return s.replace(/^\/+/, "");             // "/images/x.jpg" → "images/x.jpg"
}

// Miniatura liviana para la grilla: images/x.jpg → images/thumbs/x.jpg
// (el panel la genera al subir cada foto; si falta, se usa la grande)
function rutaMiniatura(src) {
  const ruta = normalizarRuta(src);
  return ruta.startsWith("images/") ? ruta.replace("images/", "images/thumbs/") : ruta;
}

// Identificador de cada foto para su link propio: images/benteveo.jpg → "benteveo"
function idFoto(foto) {
  return normalizarRuta(foto.src).split("/").pop().replace(/\.[^.]+$/, "");
}

/* ---------- 0. Cargar los datos ---------- */
const sinCache = "?" + Date.now();   // evita leer una versión vieja

fetch("fotos.json" + sinCache)
  .then(r => r.json())
  .then(data => {
    FOTOS = (data.fotos || []).filter(f => f && f.src);  // ignora entradas vacías
    fotosVisibles = [...FOTOS];
    construirFiltros();
    renderizar();
    abrirDesdeLink();   // si entraron con un link a una foto puntual
  })
  .catch(err => {
    console.error("No se pudo cargar fotos.json:", err);
    galeria.innerHTML =
      "<p style='text-align:center;color:#8a8578'>No se pudieron cargar las fotos. " +
      "Si estás abriendo el sitio localmente, usá un servidor (ver README).</p>";
  });

// "Sobre Milagros": si sitio.json no está, queda el texto que trae index.html
fetch("sitio.json" + sinCache)
  .then(r => (r.ok ? r.json() : null))
  .then(sitio => {
    const sobre = sitio && sitio.sobre;
    if (!sobre) return;
    if (sobre.foto) document.getElementById("sobre-foto").src = normalizarRuta(sobre.foto);
    if (sobre.texto) {
      const cont = document.getElementById("sobre-parrafos");
      cont.replaceChildren(...sobre.texto.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean).map(t => {
        const p = document.createElement("p");
        p.textContent = t;
        return p;
      }));
    }
  })
  .catch(() => {});

/* ---------- 1. Filtros ---------- */
function construirFiltros() {
  filtrosEl.innerHTML = "";
  const presentes = new Set(FOTOS.map(f => f.categoria).filter(Boolean));
  const categorias = ["Todas",
    ...CLASES.filter(c => presentes.has(c)),
    ...[...presentes].filter(c => !CLASES.includes(c))];   // por si aparece alguna otra
  categorias.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filtro" + (i === 0 ? " activo" : "");
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", i === 0);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro").forEach(b => {
        b.classList.remove("activo");
        b.setAttribute("aria-pressed", false);
      });
      btn.classList.add("activo");
      btn.setAttribute("aria-pressed", true);
      filtrar(cat);
    });
    filtrosEl.appendChild(btn);
  });
}

function filtrar(cat) {
  fotosVisibles = cat === "Todas" ? [...FOTOS] : FOTOS.filter(f => f.categoria === cat);
  renderizar();
}

/* ---------- 2. Galería ---------- */
/* Grilla tipo "masonry" ordenada de izquierda a derecha: cada foto va a la
   columna más corta. Como fotos.json trae el ancho y alto de cada foto, el
   lugar queda reservado desde el principio y nada salta mientras carga. */
function cantidadColumnas() {
  if (window.innerWidth <= 560) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function proporcion(foto) {               // alto / ancho
  return foto.ancho && foto.alto ? foto.alto / foto.ancho : 0.75;
}

function crearTarjeta(foto, indice) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.setAttribute("aria-label", `Ver foto: ${foto.titulo || "sin título"}`);

  const img = document.createElement("img");
  img.src = rutaMiniatura(foto.src);
  img.alt = "";                           // el nombre ya lo dice la tarjeta
  img.loading = indice < 6 ? "eager" : "lazy";
  img.decoding = "async";
  if (foto.ancho && foto.alto) { img.width = foto.ancho; img.height = foto.alto; }
  img.style.aspectRatio = `1 / ${proporcion(foto)}`;

  // Si falta la miniatura se usa la foto grande; si tampoco está
  // (ruta mal escrita, archivo borrado) se oculta la tarjeta.
  img.addEventListener("error", () => {
    const grande = normalizarRuta(foto.src);
    if (!img.src.endsWith(grande)) { img.src = grande; return; }
    console.warn("No se encontró la imagen:", grande);
    card.hidden = true;
  });

  const info = document.createElement("span");
  info.className = "card__info";
  const titulo = document.createElement("span");
  titulo.className = "card__titulo";
  titulo.textContent = foto.titulo || "";
  const especie = document.createElement("span");
  especie.className = "card__especie";
  especie.textContent = foto.especie || "";
  info.append(titulo, especie);

  card.append(img, info);
  card.addEventListener("click", () => abrirLightbox(indice));
  return card;
}

let columnasActuales = 0;
function renderizar() {
  const n = cantidadColumnas();
  columnasActuales = n;
  const columnas = Array.from({ length: n }, () => {
    const col = document.createElement("div");
    col.className = "galeria__col";
    return col;
  });
  const altura = new Array(n).fill(0);
  fotosVisibles.forEach((foto, i) => {
    let c = 0;                            // columna más corta (a igual altura, la de la izquierda)
    for (let k = 1; k < n; k++) if (altura[k] < altura[c] - 0.01) c = k;
    columnas[c].appendChild(crearTarjeta(foto, i));
    altura[c] += proporcion(foto) + 0.08;  // + el espacio entre tarjetas
  });
  galeria.replaceChildren(...columnas);
}

// Al girar el celular o cambiar el tamaño de la ventana, reacomodar si cambia la cantidad de columnas
let esperaResize;
window.addEventListener("resize", () => {
  clearTimeout(esperaResize);
  esperaResize = setTimeout(() => { if (cantidadColumnas() !== columnasActuales) renderizar(); }, 150);
});

/* ---------- 3. Visor (lightbox) ---------- */
const lightbox    = document.getElementById("lightbox");
const lbImg       = document.getElementById("lb-img");
const lbTitulo    = document.getElementById("lb-titulo");
const lbEspecie   = document.getElementById("lb-especie");
const lbDetalle   = document.getElementById("lb-detalle");
const lbContador  = document.getElementById("lb-contador");
const lbCerrar    = document.getElementById("lb-cerrar");
const lbCompartir = document.getElementById("lb-compartir");
const lbContenido = document.querySelector(".lightbox__contenido");
let indiceActual = 0;
let focoAnterior = null;      // para devolver el foco a la tarjeta al cerrar (teclado)
let entradaPropia = false;    // true si el visor agregó una entrada al historial

const visorAbierto = () => lightbox.classList.contains("abierto");

// ¿Se está usando el teclado? El foco solo se mueve en ese caso, así con el
// dedo o el mouse no aparecen recuadros de foco.
let usandoTeclado = false;
document.addEventListener("keydown", e => { if (e.key === "Tab" || e.key === "Enter" || e.key === " ") usandoTeclado = true; });
document.addEventListener("pointerdown", () => { usandoTeclado = false; });

function abrirLightbox(indice, { desdeLink = false } = {}) {
  indiceActual = indice;
  focoAnterior = document.activeElement;
  mostrarFoto();
  lightbox.classList.add("abierto");
  document.body.style.overflow = "hidden";
  // Link propio de la foto (#foto=benteveo). Se agrega al historial para que
  // el botón "atrás" del celular cierre el visor en vez de salir del sitio.
  if (!desdeLink) {
    history.pushState({ visor: true }, "", "#foto=" + idFoto(fotosVisibles[indice]));
    entradaPropia = true;
  }
  if (usandoTeclado) lbCerrar.focus({ preventScroll: true });
}

function ocultarLightbox() {
  lightbox.classList.remove("abierto");
  document.body.style.overflow = "";
  if (usandoTeclado && focoAnterior && document.contains(focoAnterior)) focoAnterior.focus({ preventScroll: true });
}

function cerrarLightbox() {
  if (!visorAbierto()) return;
  ocultarLightbox();
  if (entradaPropia) {
    entradaPropia = false;
    history.back();             // saca del historial la entrada que agregó el visor
  } else {                      // entraron directo con el link: se limpia la dirección
    history.replaceState(null, "", location.pathname + location.search);
  }
}

window.addEventListener("popstate", () => {
  const id = idDesdeDireccion();
  if (!id && visorAbierto()) { entradaPropia = false; ocultarLightbox(); }
  else if (id && !visorAbierto()) abrirDesdeLink();
});

function idDesdeDireccion() {
  const m = location.hash.match(/^#foto=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function abrirDesdeLink() {
  const id = idDesdeDireccion();
  if (!id || !FOTOS.length) return;
  const i = fotosVisibles.findIndex(f => idFoto(f) === id);
  if (i >= 0) abrirLightbox(i, { desdeLink: true });
  else history.replaceState(null, "", location.pathname + location.search);  // link viejo: foto borrada
}

function mostrarFoto() {
  const foto = fotosVisibles[indiceActual];
  if (!foto) return;
  // Primero la miniatura (ya está en caché, aparece al instante)
  // y en cuanto baja la foto grande, se reemplaza.
  const grande = normalizarRuta(foto.src);
  const completa = new Image();
  completa.onload = () => { if (fotosVisibles[indiceActual] === foto) lbImg.src = grande; };
  completa.src = grande;
  lbImg.src = completa.complete ? grande : rutaMiniatura(foto.src);
  lbImg.alt = [foto.titulo, foto.especie].filter(Boolean).join(" — ");
  lbTitulo.textContent  = foto.titulo || "";
  lbEspecie.textContent = foto.especie || "";
  const partes = [foto.lugar, foto.fecha].filter(Boolean).join(" · ");
  lbDetalle.textContent = [partes, foto.descripcion].filter(Boolean).join(" — ");
  lbContador.textContent = `${indiceActual + 1} / ${fotosVisibles.length}`;
  if (visorAbierto()) history.replaceState(history.state, "", "#foto=" + idFoto(foto));
  precargarVecinas();
}

/* Baja por adelantado la foto siguiente y la anterior: al deslizar aparecen al instante */
const precargadas = new Set();
function precargarVecinas() {
  const n = fotosVisibles.length;
  [1, -1].forEach(d => {
    const vecina = fotosVisibles[(indiceActual + d + n) % n];
    const ruta = vecina && normalizarRuta(vecina.src);
    if (ruta && !precargadas.has(ruta)) { precargadas.add(ruta); new Image().src = ruta; }
  });
}

function cambiar(dir) {
  indiceActual = (indiceActual + dir + fotosVisibles.length) % fotosVisibles.length;
  mostrarFoto();
}

/* Compartir: en el celular abre el menú de compartir (WhatsApp, etc.);
   en la compu copia el link */
const aviso = document.getElementById("aviso");
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(mostrarAviso.t);
  mostrarAviso.t = setTimeout(() => aviso.classList.remove("visible"), 2200);
}

lbCompartir.addEventListener("click", async () => {
  const foto = fotosVisibles[indiceActual];
  // Página propia de la foto: al compartirla, WhatsApp/Instagram muestran ESA foto
  const url = location.origin + location.pathname.replace(/[^/]*$/, "") + "foto/" + idFoto(foto) + "/";
  const titulo = `${foto.titulo} · WildMilu`;
  if (navigator.share) {
    try { await navigator.share({ title: titulo, url }); } catch { /* canceló */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    mostrarAviso("Link copiado ✓");
  } catch {
    prompt("Copiá este link:", url);
  }
});

/* Eventos del visor */
lbCerrar.addEventListener("click", cerrarLightbox);
document.getElementById("lb-prev").addEventListener("click", () => cambiar(-1));
document.getElementById("lb-next").addEventListener("click", () => cambiar(1));
lightbox.addEventListener("click", e => { if (e.target === lightbox) cerrarLightbox(); });

document.addEventListener("keydown", e => {
  if (!visorAbierto()) return;
  if (e.key === "Escape")     cerrarLightbox();
  if (e.key === "ArrowLeft")  cambiar(-1);
  if (e.key === "ArrowRight") cambiar(1);
  // Con Tab, el foco queda dentro del visor (no se va a la página de atrás)
  if (e.key === "Tab") {
    const enfocables = [...lightbox.querySelectorAll("button")].filter(b => b.offsetParent !== null);
    const primero = enfocables[0], ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    else if (!lightbox.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
  }
});

/* Gestos en el celular:
   - izquierda/derecha → cambia de foto
   - hacia abajo → la foto sigue al dedo y, al soltar, se cierra el visor */
let toqueX = null, toqueY = null, direccion = null, bajada = 0;

function moverVisor(dy, animado) {
  const t = animado ? "0.25s ease" : "0s";
  lbContenido.style.transition = `transform ${t}`;
  lightbox.style.transition    = `background-color ${t}`;
  lbCerrar.style.transition    = `opacity ${t}`;
  // la foto baja con el dedo y se achica apenas (como en Fotos del iPhone)
  lbContenido.style.transform  = dy ? `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 1200)})` : "";
  // el fondo se aclara y deja ver la galería; la X desaparece
  lightbox.style.backgroundColor = dy ? `rgba(20, 18, 15, ${Math.max(0, 1 - dy / 350)})` : "";
  lbCerrar.style.opacity = dy ? Math.max(0, 1 - dy / 60) : "";
}

lightbox.addEventListener("touchstart", e => {
  if (e.touches.length > 1) return;          // pellizco para hacer zoom: no tocar
  if (e.target.closest("button")) return;    // tocar un botón (ej. Compartir) no es un gesto
  toqueX = e.touches[0].clientX;
  toqueY = e.touches[0].clientY;
  direccion = null;
  bajada = 0;
}, { passive: true });

lightbox.addEventListener("touchmove", e => {
  if (toqueX === null || e.touches.length > 1) return;
  const dx = e.touches[0].clientX - toqueX;
  const dy = e.touches[0].clientY - toqueY;
  if (e.cancelable) e.preventDefault();       // que Safari no scrollee la página de atrás
  if (!direccion && Math.hypot(dx, dy) > 10) direccion = Math.abs(dy) > Math.abs(dx) ? "vertical" : "horizontal";
  if (direccion === "vertical") {
    bajada = Math.max(0, dy);                 // solo hacia abajo
    moverVisor(bajada, false);
  }
}, { passive: false });

lightbox.addEventListener("touchend", e => {
  if (toqueX === null) return;
  const dx = e.changedTouches[0].clientX - toqueX;
  toqueX = toqueY = null;

  if (direccion === "horizontal" && Math.abs(dx) > 50) {
    cambiar(dx < 0 ? 1 : -1);
  } else if (direccion === "vertical") {
    if (bajada > 110) {
      moverVisor(window.innerHeight, true);   // sale por abajo...
      setTimeout(() => { cerrarLightbox(); moverVisor(0, false); }, 250);  // ...y se cierra
    } else {
      moverVisor(0, true);                    // no llegó: vuelve a su lugar
    }
  }
  direccion = null;
}, { passive: true });

// Si el sistema interrumpe el gesto (llamada, notificación...), la foto vuelve a su lugar
lightbox.addEventListener("touchcancel", () => {
  toqueX = toqueY = direccion = null;
  moverVisor(0, true);
});

/* ---------- 4. Menú del celular ---------- */
const navMenu  = document.getElementById("nav-menu");
const navLinks = document.getElementById("nav-links");

function menuAbierto(abierto) {
  navLinks.classList.toggle("abierto", abierto);
  navMenu.classList.toggle("abierto", abierto);
  navMenu.setAttribute("aria-expanded", abierto);
  navMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}
navMenu.addEventListener("click", () => menuAbierto(!navLinks.classList.contains("abierto")));
navLinks.addEventListener("click", e => { if (e.target.closest("a")) menuAbierto(false); });
document.addEventListener("click", e => { if (!e.target.closest(".nav")) menuAbierto(false); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && navLinks.classList.contains("abierto")) { menuAbierto(false); navMenu.focus(); }
});
