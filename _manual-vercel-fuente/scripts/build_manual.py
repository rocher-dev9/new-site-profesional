#!/usr/bin/env python3
"""Genera public/manual-vercel/index.html a partir de Manual_de_usuario_Vercel.docx.

Uso: python3 scripts/build_manual.py
"""
import html
import re
import sys
import unicodedata
import zipfile
from collections import Counter
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Manual_de_usuario_Vercel.docx"
# El manual se publica como archivo estático de la web: solo rutas relativas, nunca con «/» inicial.
OUTPUT = ROOT.parent / "public" / "manual-vercel" / "index.html"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
CODE_COLOR = "8A1C3B"
HEADER_FILL = "1F3A5F"
BULLET_LISTS = {"2"}
CALLOUT_FILLS = {"FDF3E3": "warn", "EAF6EE": "tip", "E8F1FA": "note"}

# La división en partes procede de la tabla del apartado 1.3 del manual.
PARTS = [
    ("I", "Fundamentos", "Qué es Vercel y cómo procesa las peticiones y los builds.", 1, 2, 262),
    ("II", "Primeros pasos", "Cuenta, equipos, planes, CLI y primer despliegue.", 3, 5, 232),
    ("III", "Desarrollo y despliegue", "Proyectos, builds, Git, entornos, variables, despliegues y monorepos.", 6, 10, 195),
    ("IV", "Red, rendimiento y cómputo", "Dominios, CDN, caché, ISR, funciones, enrutamiento, imágenes y Cron Jobs.", 11, 16, 160),
    ("V", "Datos", "Vercel Blob, Global Config y almacenamiento del Marketplace.", 17, 17, 125),
    ("VI", "Seguridad y gobierno", "Deployment Protection, Firewall, WAF y roles.", 18, 20, 85),
    ("VII", "Observabilidad", "Logs, Observability, Web Analytics y Speed Insights.", 21, 21, 50),
    ("VIII", "Costes", "Modelo de precios, uso y Spend Management.", 22, 22, 15),
    ("IX", "Automatización y buenas prácticas", "REST API, SDK, AI Gateway y recomendaciones.", 23, 24, 330),
]
ANNEX_HUE = 295
_PX_ARROW_RECTS = '<rect x="4" y="0" width="1" height="1"/><rect x="4" y="1" width="2" height="1"/><rect x="0" y="2" width="7" height="1"/><rect x="4" y="3" width="2" height="1"/><rect x="4" y="4" width="1" height="1"/>'
PX_ARROW = f'<svg class="px-arrow" viewBox="0 0 8 5" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">{_PX_ARROW_RECTS}</svg>'
PX_ARROW_BACK = PX_ARROW.replace('class="px-arrow"', 'class="px-arrow px-arrow--back"')
ANNEX_DESC = "Referencias de consulta: CLI, vercel.json, variables, límites, regiones, precios, errores, glosario y fuentes."


def esc(text):
    return html.escape(text, quote=False)


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def link_refs(text):
    """Enlaza las referencias cruzadas y las URL que aparecen en texto corrido."""
    text = re.sub(r"\b([Cc]apítulos?) (\d{1,2})\b", r'<a href="#cap-\2">\1 \2</a>', text)
    text = re.sub(r"\b(Anexos?) ([A-K])\b", lambda m: f'<a href="#anexo-{m[2].lower()}">{m[1]} {m[2]}</a>', text)
    text = re.sub(r"(?<![\w/.\">])(https://[\w./\-]+\w|vercel\.com/docs[\w./\-]*\w)", external_link, text)
    return text


def external_link(match):
    url = match[1]
    href = url if url.startswith("http") else f"https://{url}"
    return f'<a href="{href}" rel="noopener">{url}</a>'


def run_format(run):
    props = run.find(f"{W}rPr")
    if props is None:
        return ""
    color = props.find(f"{W}color")
    if color is not None and color.get(f"{W}val") == CODE_COLOR:
        return "code"
    fmt = ""
    if props.find(f"{W}b") is not None:
        fmt += "b"
    if props.find(f"{W}i") is not None:
        fmt += "i"
    return fmt


def run_text(run):
    parts = []
    for el in run:
        if el.tag == f"{W}t":
            parts.append(el.text or "")
        elif el.tag == f"{W}tab":
            parts.append("\t")
        elif el.tag == f"{W}br":
            parts.append("\n")
    return "".join(parts)


def plain(par):
    return "".join(run_text(r) for r in par.iter(f"{W}r"))


def inline(par):
    """Convierte un párrafo en HTML en línea, fusionando runs con igual formato."""
    spans = []
    for run in par.iter(f"{W}r"):
        text = run_text(run)
        if not text:
            continue
        fmt = run_format(run)
        if spans and spans[-1][0] == fmt:
            spans[-1][1] += text
        else:
            spans.append([fmt, text])
    out = []
    for fmt, text in spans:
        if fmt == "code":
            out.append(f"<code>{esc(text)}</code>")
            continue
        body = link_refs(esc(text)).replace("\n", "<br>")
        if "b" in fmt:
            body = f"<strong>{body}</strong>"
        if "i" in fmt:
            body = f"<em>{body}</em>"
        out.append(body)
    return "".join(out)


def cell_fill(cell):
    shd = cell.find(f"{W}tcPr/{W}shd")
    return shd.get(f"{W}fill") if shd is not None else None


def render_callout(kind, paragraphs):
    label = esc(plain(paragraphs[0]).strip())
    body = "".join(f"<p>{inline(p)}</p>" for p in paragraphs[1:] if plain(p).strip())
    return f'<aside class="callout callout--{kind}"><span class="callout__label">{label}</span>{body}</aside>'


def render_source(paragraphs):
    items = "".join(f"<li>{inline(p)}</li>" for p in paragraphs[1:] if plain(p).strip())
    return f'<div class="source"><span class="source__label">Fuente oficial</span><ul>{items}</ul></div>'


def render_code(paragraphs):
    label = esc(plain(paragraphs[0]).strip())
    lines = [plain(p).rstrip() for p in paragraphs[1:]]
    while lines and not lines[-1]:
        lines.pop()
    code = "\n".join(
        f'<span class="comment">{esc(l)}</span>' if l.lstrip().startswith(("# ", "// ")) else esc(l)
        for l in lines
    )
    return (
        f'<figure class="code"><figcaption><span>{label}</span>'
        f'<button type="button" class="code__copy">Copiar</button></figcaption>'
        f'<pre tabindex="0"><code>{code}</code></pre></figure>'
    )


def render_table(table):
    rows = table.findall(f"{W}tr")
    first = rows[0].findall(f"{W}tc")
    if len(rows) == 1 and len(first) == 1:
        paragraphs = first[0].findall(f"{W}p")
        fill = cell_fill(first[0])
        if plain(paragraphs[0]).strip() == "Fuente oficial":
            return render_source(paragraphs)
        if fill in CALLOUT_FILLS:
            return render_callout(CALLOUT_FILLS[fill], paragraphs)
        return render_code(paragraphs)

    def cell_html(cell):
        return "<br>".join(inline(p) for p in cell.findall(f"{W}p"))

    has_header = cell_fill(first[0]) == HEADER_FILL
    headers = [" ".join(plain(p) for p in c.findall(f"{W}p")).strip() for c in first] if has_header else []
    out = [f'<div class="table table--c{len(first)}"><table>']
    if has_header:
        out.append("<thead><tr>" + "".join(f'<th scope="col">{cell_html(c)}</th>' for c in first) + "</tr></thead>")
    out.append("<tbody>")
    for row in rows[1 if has_header else 0:]:
        cells = row.findall(f"{W}tc")
        tds = []
        for i, cell in enumerate(cells):
            label = f' data-label="{html.escape(headers[i])}"' if i < len(headers) else ""
            tds.append(f"<td{label}>{cell_html(cell)}</td>")
        out.append("<tr>" + "".join(tds) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def part_for(chapter):
    for part in PARTS:
        if part[3] <= chapter <= part[4]:
            return part
    raise ValueError(chapter)


class Section:
    def __init__(self, title):
        self.title = title
        self.blocks = []
        self.toc = []
        match = re.match(r"(\d+)\.\s+(.*)", title)
        annex = re.match(r"Anexo ([A-K])\.\s+(.*)", title)
        if match:
            self.number = int(match[1])
            self.heading = match[2]
            self.id = f"cap-{self.number}"
            part = part_for(self.number)
            self.tab = f"Parte {part[0]}, capítulo {self.number}"
            self.hue, self.step = part[5], PARTS.index(part)
        elif annex:
            self.number = None
            self.heading = annex[2]
            self.id = f"anexo-{annex[1].lower()}"
            self.tab = f"Anexo {annex[1]}"
            self.hue, self.step = ANNEX_HUE, len(PARTS)
        elif title == "Anexos":
            self.number = None
            self.heading = "Anexos"
            self.id = "anexos"
            self.tab = "Anexos"
            self.hue, self.step = ANNEX_HUE, len(PARTS)
        else:
            self.number = None
            self.heading = title
            self.id = slugify(title)
            self.tab = "Antes de empezar"
            self.hue, self.step = ANNEX_HUE, 0


def parse(body):
    sections = []
    current = None
    skipping = False
    list_id = None
    list_items = []

    def flush():
        nonlocal list_id, list_items
        if list_items:
            tag = "ul" if list_id in BULLET_LISTS else "ol"
            current.blocks.append(f"<{tag}>" + "".join(f"<li>{i}</li>" for i in list_items) + f"</{tag}>")
        list_id, list_items = None, []

    cover = []
    for el in body:
        if el.tag == f"{W}tbl":
            if current is not None and not skipping:
                flush()
                current.blocks.append(render_table(el))
            continue
        if el.tag != f"{W}p":
            continue
        text = plain(el).strip()
        style = el.find(f"{W}pPr/{W}pStyle")
        style = style.get(f"{W}val") if style is not None else ""
        if style == "Ttulo1":
            if current is not None:
                flush()
            skipping = text == "Índice"  # el índice se genera en la portada
            if not skipping:
                current = Section(text)
                sections.append(current)
            continue
        if not text:
            continue
        if current is None:
            cover.append(text)
            continue
        if skipping:
            continue
        if style in ("Ttulo2", "Ttulo3"):
            flush()
            if style == "Ttulo2":
                match = re.match(r"([\dA-K]+\.\d+)\.\s", text)
                hid = slugify(match[1]) if match else f"{current.id}-{slugify(text)}"
                if not hid.startswith(("cap", "anexo")):
                    hid = f"s-{hid}"
                current.toc.append((hid, text))
                current.blocks.append(f'<h3 id="{hid}">{inline(el)}</h3>')
            else:
                current.blocks.append(f"<h4>{inline(el)}</h4>")
            continue
        num = el.find(f"{W}pPr/{W}numPr/{W}numId")
        if num is not None:
            nid = num.get(f"{W}val")
            if nid != list_id:
                flush()
                list_id = nid
            list_items.append(inline(el))
            continue
        flush()
        current.blocks.append(f"<p>{inline(el)}</p>")
    flush()
    return cover, sections


def render_pager_link(kind, label, target, title):
    arrow = PX_ARROW_BACK if kind == "prev" else PX_ARROW
    return (
        f'<a class="pager__link pager__link--{kind}" href="#{target}">'
        f"<small>{arrow}{label}</small><strong>{esc(title)}</strong></a>"
    )


def render_section(section, prev, nxt):
    toc = ""
    if section.toc:
        links = "".join(f'<li><a href="#{hid}">{esc(text)}</a></li>' for hid, text in section.toc)
        toc = f'<nav class="sheet__toc" aria-label="Apartados de {html.escape(section.heading)}"><ul>{links}</ul></nav>'
    # Al principio y al final, el enlace que falta lleva al índice de la portada
    before = render_pager_link("prev", "Anterior", prev.id, prev.heading) if prev else render_pager_link("prev", "Volver", "indice", "Índice del manual")
    after = render_pager_link("next", "Siguiente", nxt.id, nxt.heading) if nxt else render_pager_link("next", "Volver", "indice", "Índice del manual")
    pager = f'<nav class="pager" aria-label="Capítulo anterior y siguiente">{before}{after}</nav>'
    return (
        f'<section class="sheet" id="{section.id}" data-part="{section.step}">'
        f'<div class="sheet__tab">{section.tab}</div>'
        f'<div class="sheet__inner">{toc}<div class="sheet__body">'
        f"<h2>{esc(section.heading)}</h2>{''.join(section.blocks)}"
        f"</div>{pager}</div></section>"
    )


def render_strip(numeral, name, desc, hue, chapters, target):
    links = "".join(f'<li><a href="#{s.id}">{esc(s.heading)}</a></li>' for s in chapters)
    return (
        f'<li class="strip">'
        f'<a class="strip__title" href="#{target}"><span class="strip__num">{numeral}</span><span>{esc(name)}</span></a>'
        f'<p class="strip__desc">{esc(desc)}</p><ol class="strip__chapters">{links}</ol></li>'
    )


def render_page(cover, sections):
    by_id = {s.id: s for s in sections}
    strips, rail = [], []
    for i, (numeral, name, desc, first, last, hue) in enumerate(PARTS):
        chapters = [by_id[f"cap-{n}"] for n in range(first, last + 1)]
        strips.append(render_strip(numeral, name, desc, hue, chapters, f"cap-{first}"))
        rail.append(
            f'<li><a href="#cap-{first}" data-rail="{i}" aria-label="Parte {numeral}: {html.escape(name)}">{numeral}</a></li>'
        )
    annexes = [s for s in sections if s.id.startswith("anexo-")]
    strips.append(render_strip("A–K", "Anexos", ANNEX_DESC, ANNEX_HUE, annexes, "anexos"))
    rail.append(f'<li><a href="#anexos" data-rail="{len(PARTS)}" aria-label="Anexos">A–K</a></li>')

    title_kicker, title_name, subtitle, *meta = cover
    template = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manual de usuario de Vercel · Roger Avellana</title>
<meta name="description" content="{html.escape(subtitle)}">
<link rel="icon" href="../favicon.ico" sizes="32x32">
<link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../img/apple-touch-icon.png">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#control-del-documento">Saltar al contenido</a>
<header class="bar">
  <a class="bar__brand" href="../" title="Roger Avellana" aria-label="Roger Avellana, ir a la portada"><img src="../img/brand-hand.svg" alt="" width="17" height="21"></a>
  <nav class="bar__links" aria-label="Volver a la web">
    <a class="bar__back" href="../trabajo/manual-vercel/">{PX_ARROW_BACK}<span>Ficha del manual</span></a>
    <a class="bar__home" href="../">Portada</a>
  </nav>
  <button type="button" class="here" id="here" aria-haspopup="dialog"><span class="here__tab" id="here-tab">Manual</span><span class="here__title" id="here-title">Índice</span><svg class="here__caret" viewBox="0 0 12 6" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h2v2H0zM10 0h2v2h-2zM2 2h2v2H2zM8 2h2v2H8zM4 4h4v2H4z"/></svg></button>
  <button type="button" class="finder-open" id="finder-open" aria-haspopup="dialog">Índice y búsqueda</button>
  <span class="progress" id="progress" aria-hidden="true"></span>
</header>
<nav class="rail" aria-label="Partes del manual"><ol>{''.join(rail)}</ol></nav>

<header class="cover">
  <div class="cover__title">
    <span class="cover__eyebrow">Documentación</span>
    <h1>Manual de usuario de <em>{esc(title_name)}.</em></h1>
    <p class="cover__lead">{esc(subtitle)}.</p>
    <p class="cover__meta">{esc(meta[2])}. {esc(meta[0])}. {esc(meta[1])}.</p>
  </div>
  <nav id="indice" aria-label="Índice del manual"><ol class="strips">{''.join(strips)}</ol></nav>
</header>

<main>
{''.join(render_section(s, sections[i - 1] if i else None, sections[i + 1] if i + 1 < len(sections) else None) for i, s in enumerate(sections))}
</main>

<footer class="end">
  <span>© Roger Avellana</span>
  <a href="../trabajo/manual-vercel/">Ficha del manual</a>
  <a href="../">Portada</a>
</footer>

<dialog class="finder" id="finder" aria-label="Índice y búsqueda">
  <form method="dialog" class="finder__head">
    <label for="finder-input">Buscar en el manual</label>
    <input id="finder-input" type="search" autocomplete="off" placeholder="Por ejemplo: rollback, ISR, límites">
    <button type="submit">Cerrar</button>
  </form>
  <div class="finder__results" id="finder-results" aria-live="polite"></div>
</dialog>
<script src="app.js"></script>
</body>
</html>
"""
    return template


def words(text):
    return Counter(re.findall(r"\w+", text.lower()))


def check(body, page):
    """Comprueba que todo el texto del documento ha llegado a la página."""
    source = Counter()
    in_index = False
    for el in body:
        if el.tag == f"{W}p":
            style = el.find(f"{W}pPr/{W}pStyle")
            if style is not None and style.get(f"{W}val") == "Ttulo1":
                in_index = plain(el).strip() == "Índice"
            if in_index:
                continue
        if el.tag in (f"{W}p", f"{W}tbl"):
            for par in el.iter(f"{W}p"):
                source.update(words(plain(par)))
    rendered = words(html.unescape(re.sub(r"<[^>]+>", " ", page)))
    missing = source - rendered
    return sum(source.values()), missing


def main():
    archive = zipfile.ZipFile(SOURCE)
    body = ET.fromstring(archive.read("word/document.xml")).find(f"{W}body")
    cover, sections = parse(body)
    page = render_page(cover, sections)
    OUTPUT.write_text(page, encoding="utf-8")
    total, missing = check(body, page)
    print(f"{len(sections)} secciones, {total} palabras en origen, {sum(missing.values())} sin encontrar")
    if missing:
        print(missing.most_common(40))
        sys.exit(1)


if __name__ == "__main__":
    main()
