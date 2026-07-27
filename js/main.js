/* =====================================================================
   WildMilu · LÓGICA DE LA GALERÍA
   ---------------------------------------------------------------------
   Las fotos ahora viven en  fotos.json  (lo edita el panel /admin).
   Este archivo lee ese JSON y arma la galería, los filtros y el visor.
   No hace falta tocarlo para agregar fotos.
   ===================================================================== */

const galeria   = document.getElementById("galeria");
const filtrosEl = document.getElementById("filtros");

let FOTOS = [];
let fotosVisibles = [];

/* ---------- 0. Cargar los datos desde fotos.json ---------- */
fetch("fotos.json?" + Date.now())          // el ?... evita caché vieja
  .then(r => r.json())
  .then(data => {
    FOTOS = data.fotos || [];
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
    card.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}" loading="lazy">
      <div class="card__info">
        <div class="card__titulo">${foto.titulo || ""}</div>
        <div class="card__especie">${foto.especie || ""}</div>
      </div>`;
    card.addEventListener("click", () => abrirLightbox(indice));
    galeria.appendChild(card);
  });
}

/* ---------- 4. Lightbox (visor ampliado) ---------- */
const lightbox = document.getElementById("lightbox");
const lbImg     = document.getElementById("lb-img");
const lbTitulo  = document.getElementById("lb-titulo");
const lbEspecie = document.getElementById("lb-especie");
const lbDetalle = document.getElementById("lb-detalle");
let indiceActual = 0;

function abrirLightbox(indice) {
  indiceActual = indice;
  mostrarFoto();
  lightbox.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function mostrarFoto() {
  const foto = fotosVisibles[indiceActual];
  lbImg.src = foto.src;
  lbImg.alt = foto.titulo;
  lbTitulo.textContent = foto.titulo || "";
  lbEspecie.textContent = foto.especie || "";
  const partes = [foto.lugar, foto.fecha].filter(Boolean).join(" · ");
  lbDetalle.textContent = [partes, foto.descripcion].filter(Boolean).join(" — ");
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
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("abierto")) return;
  if (e.key === "Escape")     cerrarLightbox();
  if (e.key === "ArrowLeft")  cambiar(-1);
  if (e.key === "ArrowRight") cambiar(1);
});
