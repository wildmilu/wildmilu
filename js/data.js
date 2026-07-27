/* =====================================================================
   WildMilu · BASE DE DATOS DE FOTOS
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitás tocar para agregar, quitar o
   editar fotos de la galería.

   👉 Para agregar una foto nueva:
      1. Copiá tu imagen dentro de la carpeta  /images
      2. Duplicá uno de los bloques { ... } de abajo
      3. Cambiá los datos (src, titulo, especie, etc.)
      4. Guardá el archivo. ¡Listo! La galería se actualiza sola.

   Campos de cada foto:
      src        → ruta de la imagen (dentro de /images)
      titulo     → nombre que se muestra
      especie    → nombre científico o común (opcional)
      categoria  → sirve para los filtros de arriba. Usá una de estas:
                   "Jardín" · "Bosque" · "Humedales" · "Rapaces"
                   "Pastizal" · "Otra fauna"   (o inventá una nueva)
      lugar      → dónde se tomó la foto   ← COMPLETAR (lo sabe Mili)
      fecha      → cuándo (formato libre)   ← COMPLETAR (lo sabe Mili)
      descripcion→ un textito o anécdota (opcional)

   -----------------------------------------------------------------
   ⚠️ NOTA de Pablo: las especies son una PRIMERA ESTIMACIÓN a partir
   de las fotos. Revisá/corregí las que quieras, y completá "lugar" y
   "fecha" que las tenés vos. Están vacías a propósito.
   ===================================================================== */

const FOTOS = [

  /* ---------------------------- AVES ---------------------------- */
  {
    src: "images/picaflor-cometa.jpg",
    titulo: "Picaflor cometa en vuelo",
    especie: "Sappho sparganurus",
    categoria: "Jardín",
    lugar: "",
    fecha: "",
    descripcion: "Con su larga cola dorada, libando entre las salvias rojas."
  },
  {
    src: "images/cardenal.jpg",
    titulo: "Cardenal copetón",
    especie: "Paroaria coronata",
    categoria: "Bosque",
    lugar: "",
    fecha: "",
    descripcion: "Ese copete rojo imposible de no mirar, entre las ramas de un algarrobo."
  },
  {
    src: "images/chiflon.jpg",
    titulo: "Chiflón al sol",
    especie: "Syrigma sibilatrix",
    categoria: "Humedales",
    lugar: "",
    fecha: "",
    descripcion: "La garza silbadora, con su antifaz celeste y pico rosado."
  },
  {
    src: "images/chimango.jpg",
    titulo: "Chimango cantando",
    especie: "Milvago chimango",
    categoria: "Rapaces",
    lugar: "",
    fecha: "",
    descripcion: "Posado en lo alto, dando su clásico chillido."
  },
  {
    src: "images/taguato.jpg",
    titulo: "Taguató vigilando",
    especie: "Rupornis magnirostris",
    categoria: "Rapaces",
    lugar: "",
    fecha: "",
    descripcion: "El gavilán común, atento desde la punta de una rama seca."
  },
  {
    src: "images/lechucita.jpg",
    titulo: "Lechucita de las vizcacheras",
    especie: "Athene cunicularia",
    categoria: "Rapaces",
    lugar: "",
    fecha: "",
    descripcion: "Ojos enormes y dorados que lo ven todo al atardecer."
  },
  {
    src: "images/nandu.jpg",
    titulo: "Ñandú en el pastizal",
    especie: "Rhea americana",
    categoria: "Pastizal",
    lugar: "",
    fecha: "",
    descripcion: "El ave corredora más grande de Sudamérica, entre los pastos."
  },
  {
    src: "images/golondrinas.jpg",
    titulo: "Golondrinas al sol",
    especie: "Pygochelidon cyanoleuca",
    categoria: "Jardín",
    lugar: "",
    fecha: "",
    descripcion: "Dos golondrinas descansando en la rama de un sauce."
  },
  {
    src: "images/durmili.jpg",
    titulo: "Durmilí en pareja",
    especie: "Nystalus maculatus",
    categoria: "Bosque",
    lugar: "",
    fecha: "",
    descripcion: "Quietos y tranquilos, fieles a su fama de dormilones."
  },
  {
    src: "images/tiranidos.jpg",
    titulo: "Pareja de tiránidos",
    especie: "(a confirmar)",
    categoria: "Bosque",
    lugar: "",
    fecha: "",
    descripcion: "Dos jóvenes esperando en una rama con líquenes."
  },
  {
    src: "images/zorzal-americano.jpg",
    titulo: "Zorzal americano",
    especie: "Turdus migratorius",
    categoria: "Jardín",
    lugar: "",
    fecha: "",
    descripcion: "Su pecho anaranjado se destaca sobre el musgo verde."
  },

  /* ------------------------- OTRA FAUNA ------------------------- */
  {
    src: "images/yacare.jpg",
    titulo: "Yacaré al acecho",
    especie: "Caiman sp.",
    categoria: "Otra fauna",
    lugar: "",
    fecha: "",
    descripcion: "Sólo los ojos asoman entre los camalotes."
  },
  {
    src: "images/lagartija.jpg",
    titulo: "Lagartija verde al sol",
    especie: "Teius sp.",
    categoria: "Otra fauna",
    lugar: "",
    fecha: "",
    descripcion: "Su verde eléctrico brilla tomando sol sobre una roca."
  },
  {
    src: "images/zorro.jpg",
    titulo: "Zorro dormido",
    especie: "Lycalopex sp.",
    categoria: "Otra fauna",
    lugar: "",
    fecha: "",
    descripcion: "Enroscado y en calma, durmiendo sobre la piedra."
  },
  {
    src: "images/mono-caraya.jpg",
    titulo: "Mono carayá",
    especie: "Alouatta caraya",
    categoria: "Otra fauna",
    lugar: "",
    fecha: "",
    descripcion: "Aullador, observando desde las ramas de la selva."
  },
  {
    src: "images/vaca-highland.jpg",
    titulo: "Vaca Highland",
    especie: "Bos taurus (raza Highland)",
    categoria: "Otra fauna",
    lugar: "",
    fecha: "",
    descripcion: "El clásico flequillo de las vacas peludas de las tierras altas."
  }

];
