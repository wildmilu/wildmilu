#!/usr/bin/env python3
"""
WildMilu · arma la versión publicada del sitio (lo corre GitHub Actions en cada cambio).

Copia el sitio a _site/ y le agrega:
  - images/thumbs/…      → las miniaturas que falten (por si una foto se subió sin panel)
  - foto/<id>/index.html → una página por foto con su vista previa para WhatsApp,
    Instagram, etc. (og:image). Las personas son redirigidas al visor de esa foto.
  - sitemap.xml          → para que Google encuentre el sitio y sus fotos.

Para probarlo en tu compu:  python3 scripts/generar.py  (y mirá la carpeta _site/)
"""
import html
import json
import os
import shutil
from datetime import datetime, timezone

SITIO_URL = "https://wildmilu.github.io"   # si algún día hay dominio propio, cambiarlo acá
SALIDA = "_site"
NO_PUBLICAR = {".git", ".github", "scripts", SALIDA, "node_modules"}
ANCHO_MINIATURA = 800

raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(raiz)


def ruta(src):
    return str(src or "").strip().lstrip("/")


def id_foto(foto):
    return os.path.splitext(os.path.basename(ruta(foto["src"])))[0]


def miniatura(src):
    r = ruta(src)
    return r.replace("images/", "images/thumbs/", 1) if r.startswith("images/") else r


def url(r):
    return r if r.startswith("http") else f"{SITIO_URL}/{r}"


def e(texto):
    return html.escape(str(texto or ""), quote=True)


# ---------- 1. Copiar el sitio ----------
if os.path.exists(SALIDA):
    shutil.rmtree(SALIDA)
os.makedirs(SALIDA)
for nombre in os.listdir("."):
    if nombre in NO_PUBLICAR or nombre.endswith(".md"):
        continue
    if os.path.isdir(nombre):
        shutil.copytree(nombre, os.path.join(SALIDA, nombre))
    else:
        shutil.copy2(nombre, SALIDA)

fotos = [f for f in json.load(open("fotos.json", encoding="utf-8")).get("fotos", []) if f and f.get("src")]

# ---------- 1b. Miniaturas que falten ----------
try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None
    print("Aviso: sin Pillow no se generan miniaturas faltantes")
for foto in fotos:
    src, mini = ruta(foto["src"]), miniatura(foto["src"])
    destino = os.path.join(SALIDA, mini)
    if Image is None or mini == src or os.path.exists(destino) or not os.path.exists(src):
        continue
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if im.width > ANCHO_MINIATURA:
        im = im.resize((ANCHO_MINIATURA, round(im.height * ANCHO_MINIATURA / im.width)), Image.LANCZOS)
    im.save(destino, "JPEG", quality=78, optimize=True, progressive=True)
    print("Miniatura creada:", mini)

# ---------- 1c. Tamaño y color que falten (la galería los usa para no "saltar") ----------
completadas = 0
for foto in fotos:
    src = ruta(foto["src"])
    if Image is None or not os.path.exists(src) or (foto.get("ancho") and foto.get("alto") and foto.get("color")):
        continue
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    foto.setdefault("ancho", im.width)
    foto.setdefault("alto", im.height)
    if not foto.get("color"):
        r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
        foto["color"] = "#%02x%02x%02x" % (r, g, b)
    completadas += 1
if completadas:
    with open(os.path.join(SALIDA, "fotos.json"), "w", encoding="utf-8") as f:
        json.dump({"fotos": fotos}, f, ensure_ascii=False, indent=2)
    print(f"Datos completados en {completadas} fotos")

# ---------- 2. Una página por foto (vista previa al compartir) ----------
PLANTILLA = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{titulo} · WildMilu</title>
<meta name="description" content="{descripcion}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{sitio}/">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="WildMilu">
<meta property="og:title" content="{titulo} · WildMilu">
<meta property="og:description" content="{descripcion}">
<meta property="og:url" content="{pagina}">
<meta property="og:image" content="{imagen}">
<meta property="og:image:width" content="{ancho}">
<meta property="og:image:height" content="{alto}">
<meta property="og:image:alt" content="{titulo}">
<meta property="og:locale" content="es_AR">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url={destino}">
<script>location.replace({destino_js});</script>
<style>body{{margin:0;background:#14120f;color:#f7f4ec;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}}a{{color:#f2b8a2}}</style>
</head>
<body><p><a href="{destino}">Ver «{titulo}» en WildMilu</a></p></body>
</html>
"""

hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
for foto in fotos:
    ident = id_foto(foto)
    partes = [foto.get("especie"), " · ".join(p for p in (foto.get("lugar"), foto.get("fecha")) if p), foto.get("descripcion")]
    descripcion = " — ".join(p for p in partes if p) or "Fotografía de naturaleza por Milagros."
    imagen = miniatura(foto["src"]) if os.path.exists(os.path.join(SALIDA, miniatura(foto["src"]))) else ruta(foto["src"])
    ancho, alto = foto.get("ancho"), foto.get("alto")
    if ancho and alto and imagen != ruta(foto["src"]) and ancho > ANCHO_MINIATURA:
        ancho, alto = ANCHO_MINIATURA, round(alto * ANCHO_MINIATURA / ancho)
    destino = f"/#foto={ident}"
    carpeta = os.path.join(SALIDA, "foto", ident)
    os.makedirs(carpeta, exist_ok=True)
    with open(os.path.join(carpeta, "index.html"), "w", encoding="utf-8") as f:
        f.write(PLANTILLA.format(
            titulo=e(foto.get("titulo") or "Foto"),
            descripcion=e(descripcion),
            sitio=SITIO_URL,
            pagina=f"{SITIO_URL}/foto/{ident}/",
            imagen=e(url(imagen)),
            ancho=ancho or "", alto=alto or "",
            destino=e(destino),
            destino_js=json.dumps(destino),
        ))

# ---------- 3. Mapa del sitio para Google (con las fotos, para Google Imágenes) ----------
imagenes = "\n".join(
    f"""    <image:image>
      <image:loc>{e(url(ruta(foto["src"])))}</image:loc>
    </image:image>""" for foto in fotos)
with open(os.path.join(SALIDA, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>{SITIO_URL}/</loc>
    <lastmod>{hoy}</lastmod>
{imagenes}
  </url>
</urlset>
""")

print(f"Listo: {len(fotos)} páginas de fotos + sitemap.xml en {SALIDA}/")
