/* =====================================================================
   WildMilu · LÓGICA DE LA GALERÍA
   ---------------------------------------------------------------------
   Las fotos viven en  fotos.json  (lo edita el panel /admin).
   Este archivo lee ese JSON y arma la galería, los filtros y el visor.
   No hace falta tocarlo para agregar fotos.
   ===================================================================== */

const galeria   = document.getElementById("galeria");
const filtrosEl = document.getElementById("filtros");

let FOTOS = [];
let fotosVisibles = [];

/* ---------------------------------------------------------------------
   Normaliza la ruta de una imagen.
   Tolera "images/x.jpg", "/images/x.jpg" o una URL completa.
   Las rutas quedan relativas para que el sitio funcione igual en un
   dominio propio o en una subcarpeta (ej: usuario.github.io/wildmilu/).
   --------------------------------------------------------------------- */
function normalizarRuta(src) {
  if (!src) return "";
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s)) return s;   // URL completa: se deja igual
  return s.replace(/^\/+/, "");             // "/images/x.jpg" → "images/x.jpg"
}

/* ---------- 0. Cargar los datos desde fotos.json ---------- */
fetch("fotos.json?" + Date.now())          // el ?... evita caché vieja
  .then(r => r.json())
  .then(data => {
    FOTOS = (data.fotos || []).filter(f => f && f.src);  // ignora entradas vacías
    fotosVisibles = [...FOTOS];
    construirFiltros();
    renderizar(FOTOS);
  })
  .catch(err => {
    console.error("No se pudo cargar fotos.json:", err);
    galeria.innerHTML =
      "<p style='text-align:center;color:#8a8578'>No se pudieron cargar las fotos. " +
      "Si estás abriendo el sitio localmente, usá un servidor (ver README).</p>";
  });

/* ---------- 1. Construir botones de filtro dinámicamente ---------- */
function construirFiltros() {
  filtrosEl.innerHTML = "";
  const categorias = ["Todas", ...new Set(FOTOS.map(f => f.categoria).filter(Boolean))];
  categorias.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = "filtro" + (i === 0 ? " activo" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      filtrar(cat);
    });
    filtrosEl.appendChild(btn);
  });
}

/* ---------- 2. Filtrar por categoría ---------- */
function filtrar(cat) {
  fotosVisibles = cat === "Todas" ? [...FOTOS] : FOTOS.filter(f => f.categoria === cat);
  renderizar(fotosVisibles);
}

/* ---------- 3. Renderizar las tarjetas ---------- */
function renderizar(lista) {
  galeria.innerHTML = "";
  lista.forEach((foto, indice) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = normalizarRuta(foto.src);
    img.alt = foto.titulo || "Foto de WildMilu";
    img.loading = "lazy";

    // Si la imagen no carga (ruta mal escrita, archivo faltante),
    // se oculta la tarjeta en vez de mostrar el ícono roto.
    img.addEventListener("error", () => {
      console.warn("No se encontró la imagen:", img.src);
      card.style.display = "none";
    });

    const info = document.createElement("div");
    info.className = "card__info";
    info.innerHTML = `
      <div class="card__titulo">${foto.titulo || ""}</div>
      <div class="card__especie">${foto.especie || ""}</div>`;

    card.appendChild(img);
    card.appendChild(info);
    card.addEventListener("click", () => abrirLightbox(indice));
    galeria.appendChild(card);
  });
}

/* ---------- 4. Lightbox (visor ampliado) ---------- */
const lightbox  = document.getElementById("lightbox");
const lbImg     = document.getElementById("lb-img");
const lbTitulo  = document.getElementById("lb-titulo");
const lbEspecie = document.getElementById("lb-especie");
const lbDetalle = document.getElementById("lb-detalle");
const lbContador = document.getElementById("lb-contador");
let indiceActual = 0;

function abrirLightbox(indice) {
  indiceActual = indice;
  mostrarFoto();
  lightbox.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function mostrarFoto() {
  const foto = fotosVisibles[indiceActual];
  if (!foto) return;
  lbImg.src = normalizarRuta(foto.src);
  lbImg.alt = foto.titulo || "";
  lbTitulo.textContent  = foto.titulo || "";
  lbEspecie.textContent = foto.especie || "";
  const partes = [foto.lugar, foto.fecha].filter(Boolean).join(" · ");
  lbDetalle.textContent = [partes, foto.descripcion].filter(Boolean).join(" — ");
  lbContador.textContent = `${indiceActual + 1} / ${fotosVisibles.length}`;
}

function cerrarLightbox() {
  lightbox.classList.remove("abierto");
  document.body.style.overflow = "";
}

function cambiar(dir) {
  indiceActual = (indiceActual + dir + fotosVisibles.length) % fotosVisibles.length;
  mostrarFoto();
}

/* Eventos del lightbox */
document.getElementById("lb-cerrar").addEventListener("click", cerrarLightbox);
document.getElementById("lb-prev").addEventListener("click", () => cambiar(-1));
document.getElementById("lb-next").addEventListener("click", () => cambiar(1));
lightbox.addEventListener("click", e => { if (e.target === lightbox) cerrarLightbox(); });

/* Gestos en el celular:
   - izquierda/derecha → cambia de foto
   - hacia abajo → la foto sigue al dedo y, al soltar, se cierra el visor */
const lbContenido = document.querySelector(".lightbox__contenido");
const lbCerrar    = document.getElementById("lb-cerrar");
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
  toqueX = e.touches[0].clientX;
  toqueY = e.touches[0].clientY;
  direccion = null;
  bajada = 0;
}, { passive: true });

lightbox.addEventListener("touchmove", e => {
  if (toqueX === null || e.touches.length > 1) return;
  const dx = e.touches[0].clientX - toqueX;
  const dy = e.touches[0].clientY - toqueY;
  if (!direccion && Math.hypot(dx, dy) > 10) direccion = Math.abs(dy) > Math.abs(dx) ? "vertical" : "horizontal";
  if (direccion === "vertical") {
    e.preventDefault();                       // que no se mueva la página de atrás
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

document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("abierto")) return;
  if (e.key === "Escape")     cerrarLightbox();
  if (e.key === "ArrowLeft")  cambiar(-1);
  if (e.key === "ArrowRight") cambiar(1);
});

/* ---------- 5. Menú del celular ---------- */
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
