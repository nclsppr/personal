#!/usr/bin/env python3
"""Build bilingual large-model guides and inventories from the current model.

python3 kirow/large-scale/generate-documents.py --csv-only
python3 kirow/large-scale/generate-documents.py

PDF creation requires the actual scene renders for every current step. No small
model files, placeholder images or fixed piece/step counts are used.
"""
import argparse
from collections import Counter
import csv
from hashlib import sha256
from html import escape
import json
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image, PageBreak, PageTemplate, Paragraph,
    Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parent
WIDTH, HEIGHT = A4
MARGIN = 18 * mm
CONTENT_WIDTH = WIDTH - 2 * MARGIN
CONTENT_HEIGHT = HEIGHT - 44 * mm
YELLOW = colors.HexColor("#f4c428")
INK = colors.HexColor("#242824")
MUTED = colors.HexColor("#50574f")
LINE = colors.HexColor("#d9ddd6")
TEXT = {
    "fr": {
        "title": "Kirow SNCF de Dijon",
        "subtitle": "Le grand modèle en briques",
        "guide": "Guide de la maquette numérique",
        "edition": "BRICK ATELIER / GRAND MODÈLE",
        "creator": "Une création de Nicolas Pieper",
        "footer": "Étude numérique · Assemblages à valider sur prototype",
        "elements": "éléments", "steps": "étapes", "variants": "variantes de pièce et couleur",
        "about": "Avant de commencer",
        "reading": "Chaque image montre le modèle à la fin de l’étape. Le tableau indique uniquement les pièces ajoutées à cette étape. Les couleurs sont aussi nommées dans le tableau. Utilisez la version 3D du site pour changer de point de vue.",
        "scope": "Cette notice décrit une maquette numérique. Elle ne certifie ni les liaisons, ni la résistance, ni les mouvements d’une construction physique. Les images du modèle sont des rendus de la scène 3D, pas des photographies d’un prototype assemblé.",
        "track": "La voie de présentation fait partie de l’inventaire. Le câble de simulation et les graphismes personnalisés ne constituent pas des références de pièces supplémentaires.",
        "brand": "Concept indépendant et non officiel. LEGO, SNCF et Kirow restent les marques de leurs titulaires respectifs ; aucune approbation de leur part n’est revendiquée.",
        "limits": "Références et limites",
        "step": "Étape", "added": "Pièces ajoutées", "none": "Aucune pièce supplémentaire.",
        "continued": "suite", "inventory": "Inventaire complet",
        "reference": "Référence exacte", "part": "Pièce et couleur", "quantity": "Qté",
        "proof": "Preuve catalogue", "catalogue_id": "ID catalogue",
        "checked": "Références et couleurs vérifiées le",
        "inventory_note": "Les quantités sont calculées depuis les pièces de cette version et incluent la voie. Les références de catalogue ne garantissent ni stock, ni prix, ni compatibilité mécanique. Cet inventaire n’est pas une liste d’achat validée.",
        "total_so_far": "éléments cumulés",
        "source_note": "Les sources documentaires ci-dessous servent de références. Les photographies et documents de tiers ne sont pas reproduits dans cette notice.",
        "geometry": "Les pièces conservent leur taille réelle. Les géométries importées proviennent de la bibliothèque officielle LDraw, sous licence CC BY 4.0. Les auteurs et les fichiers sources sont listés dans le fichier d’attribution du site.",
        "scale": "L’échelle proche de 1:{scale} est indicative. Le châssis du modèle mesure {studs} tenons, soit {mm} mm. Le rapprochement avec les {meters} m communiqués par SNCF ne constitue pas un plan coté ni une calibration précise.",
        "mechanics": "À éprouver sur prototype : jonction roue 56908/plaque 11213, guidage ferroviaire, glissières télescopiques, ancrages et course des vérins, mouflage du câble, stabilité et verrouillage des appuis.",
        "links": "Ouvrir le modèle 3D et les fichiers à jour",
        "split": "Grue et voie de base : {crane} · Complément de transport : {transport}",
        "modes": "Deux modes, un seul inventaire",
        "crane_count": "Grue et voie de base",
        "transport_count": "Deux wagons et prolongements de voie",
        "total_count": "Inventaire complet",
        "mode_note": "Le mode travail montre la grue sur sa voie de base, avec ses mouvements de levage. Le mode transport montre la flèche repliée sur son wagon d’appui et les deux wagons d’accompagnement. Les étapes de transport commencent à l’étape {first}.",
        "reuse": "Le contrepoids de la grue est déplacé sur le wagon arrière en mode transport. Ses pièces restent comptées une seule fois, dans la partie grue. Les semelles, le cadre et les calages du wagon sont des éléments supplémentaires distincts.",
        "opaque": "Les panneaux sombres de cabine sont représentés par des tuiles noires 1 × 2 (3069). Ces pièces sont opaques. Leur aspect ne doit pas être interprété comme une variante de verre transparent.",
        "transport_start": "À partir d’ici, les étapes construisent le complément de transport. Le cumul inclut les pièces de la grue déjà montées ; le déplacement du contrepoids n’ajoute aucune copie de ses pièces.",
    },
    "en": {
        "title": "SNCF Dijon Kirow crane",
        "subtitle": "The large brick model",
        "guide": "Digital model guide",
        "edition": "BRICK ATELIER / LARGE MODEL",
        "creator": "Created by Nicolas Pieper",
        "footer": "Digital study · Connections require a physical prototype",
        "elements": "elements", "steps": "steps", "variants": "part and color variants",
        "about": "Before you begin",
        "reading": "Each image shows the model at the end of the step. Its table lists only the parts added during that step. Colors are also named in the table. Use the website’s 3D model to inspect other viewpoints.",
        "scope": "This guide describes a digital model. It does not certify connections, strength or movements in a physical build. Model images are renders of the 3D scene, not photographs of an assembled prototype.",
        "track": "The display track is included in the inventory. The simulation cable and custom graphics do not represent additional part references.",
        "brand": "Independent, unofficial concept. LEGO, SNCF and Kirow remain trademarks of their respective owners; no endorsement is claimed.",
        "limits": "References and limitations",
        "step": "Step", "added": "Added parts", "none": "No additional parts.",
        "continued": "continued", "inventory": "Complete inventory",
        "reference": "Exact reference", "part": "Part and color", "quantity": "Qty",
        "proof": "Catalogue evidence", "catalogue_id": "Catalogue ID",
        "checked": "References and colors checked on",
        "inventory_note": "Quantities are calculated from this version’s pieces and include the track. Catalogue references do not guarantee stock, price or mechanical compatibility. This inventory is not a validated shopping list.",
        "total_so_far": "cumulative elements",
        "source_note": "The documentary sources below are references. Third-party photographs and documents are not reproduced in this guide.",
        "geometry": "Parts retain their actual dimensions. Imported geometry comes from the official LDraw Parts Library under CC BY 4.0. Authors and source files are listed in the website’s attribution file.",
        "scale": "The scale of approximately 1:{scale} is indicative. The model chassis spans {studs} studs, or {mm} mm. Comparison with the {meters} m stated by SNCF does not constitute a dimensioned plan or precise calibration.",
        "mechanics": "Physical testing is needed for the wheel 56908/plate 11213 connection, rail guidance, telescopic slides, actuator anchors and travel, cable reeving, stability and outrigger locking.",
        "links": "Open the 3D model and current files",
        "split": "Crane and base track: {crane} · Transport additions: {transport}",
        "modes": "Two modes, one inventory",
        "crane_count": "Crane and base track",
        "transport_count": "Two wagons and track extensions",
        "total_count": "Complete inventory",
        "mode_note": "Working mode shows the crane on its base track, with lifting movements. Transport mode shows the folded boom resting on its support wagon and both accompanying wagons. Transport assembly starts at step {first}.",
        "reuse": "The crane’s counterweight moves onto the rear wagon in transport mode. Its pieces are counted only once, in the crane section. The wagon’s load beds, frame and chocks are separate additional elements.",
        "opaque": "The dark cab panels use black 1 × 2 tiles (3069). These parts are opaque. Their appearance does not represent a transparent glazing color variant.",
        "transport_start": "From here, the steps build the transport additions. The cumulative count includes the crane already assembled; moving the counterweight does not add copies of its pieces.",
    },
}


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def localized(value, field, lang):
    key = field + ("En" if lang == "en" else "")
    if not value.get(key):
        raise ValueError(f"Missing {key} translation")
    return str(value[key])


def register_fonts():
    candidates = [
        (Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
         Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")),
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
         Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("Guide", str(regular)))
            pdfmetrics.registerFont(TTFont("GuideBold", str(bold)))
            pdfmetrics.registerFontFamily("Guide", normal="Guide", bold="GuideBold")
            return "Guide", "GuideBold"
    return "Helvetica", "Helvetica-Bold"


FONT, BOLD = register_fonts()
STYLES = {
    "cover": ParagraphStyle("cover", fontName=BOLD, fontSize=38, leading=42, textColor=INK, spaceAfter=8),
    "title": ParagraphStyle("title", fontName=BOLD, fontSize=24, leading=28, textColor=INK, spaceAfter=9),
    "sub": ParagraphStyle("sub", fontName=BOLD, fontSize=12, leading=16, textColor=INK, spaceAfter=7),
    "body": ParagraphStyle("body", fontName=FONT, fontSize=10, leading=14, textColor=INK, spaceAfter=9),
    "small": ParagraphStyle("small", fontName=FONT, fontSize=8.5, leading=11.5, textColor=MUTED, spaceAfter=6),
    "cell": ParagraphStyle("cell", fontName=FONT, fontSize=8.4, leading=11.2, textColor=INK),
    "head": ParagraphStyle("head", fontName=BOLD, fontSize=8.4, leading=11.2, textColor=INK),
}


def p(text, style="body"):
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), STYLES[style])


def linked(text, url, style="small"):
    return Paragraph(
        '<link href="' + escape(url, quote=True) + '" color="#255345">'
        + escape(text) + "</link>", STYLES[style],
    )


def load_model():
    data = json.loads((ROOT / "src/model-data.json").read_text())
    for key in ("pieces", "catalog", "colors", "steps", "inventory", "dimensions", "evidence", "note", "noteEn",
                "cranePieceCount", "transportPieceCount", "totalPieceCount", "transportFirstStep"):
        if key not in data:
            raise ValueError("Missing model field: " + key)
    numbers = [step["number"] for step in data["steps"]]
    if numbers != list(range(1, len(numbers) + 1)) or not numbers:
        raise ValueError("Steps must be non-empty and consecutively numbered from 1")
    counts = Counter()
    by_step = {number: Counter() for number in numbers}
    for piece in data["pieces"]:
        quantity = piece.get("quantity", 1)
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
            raise ValueError("Invalid piece quantity")
        if piece["part"] not in data["catalog"] or piece["color"] not in data["colors"]:
            raise ValueError("Unknown piece or color")
        if piece["step"] not in by_step:
            raise ValueError("Piece belongs to an unknown step")
        key = piece["part"] + "-" + piece["color"]
        counts[key] += quantity
        by_step[piece["step"]][key] += quantity
    rows = {}
    for row in data["inventory"]:
        if row["key"] in rows:
            raise ValueError("Duplicate inventory variant: " + row["key"])
        rows[row["key"]] = row
    if counts != Counter({key: row["count"] for key, row in rows.items()}):
        raise ValueError("Inventory quantities do not match model pieces")
    first = data["transportFirstStep"]
    if first not in numbers:
        raise ValueError("Transport transition does not match an assembly step")
    crane_count = sum(sum(variants.values()) for number, variants in by_step.items() if number < first)
    transport_count = sum(counts.values()) - crane_count
    if (crane_count != data["cranePieceCount"] or transport_count != data["transportPieceCount"]
            or sum(counts.values()) != data["totalPieceCount"]):
        raise ValueError("Crane/transport split does not match actual piece steps")
    evidence = {}
    for row in data["evidence"]["variants"]:
        if row["key"] in evidence and evidence[row["key"]] != row:
            raise ValueError("Conflicting evidence: " + row["key"])
        evidence[row["key"]] = row
    for key, row in rows.items():
        if key not in evidence or not evidence[key].get("sources"):
            raise ValueError("Missing evidence: " + key)
        if evidence[key]["catalogueId"] != row["part"]["id"]:
            raise ValueError("Evidence/catalogue reference mismatch: " + key)
        for lang in ("fr", "en"):
            localized(row["part"], "name", lang)
            localized(data["colors"][row["color"]], "name", lang)
    for step in data["steps"]:
        for lang in ("fr", "en"):
            localized(step, "title", lang)
            localized(step, "description", lang)
    return data, rows, by_step, evidence


def verify_images(data, images_dir):
    required = [images_dir / "preview.jpg"] + [
        images_dir / f"step-{step['number']:02d}.jpg" for step in data["steps"]
    ]
    for path in required:
        if not path.is_file():
            raise ValueError("Render the current model before creating PDFs: " + str(path))
        with PILImage.open(path) as image:
            if image.width < 800 or image.height < 500:
                raise ValueError("Manual image is too small: " + str(path))
            image.verify()
    render_manifest = ROOT / "assets/render-manifest.json"
    if render_manifest.exists():
        manifest = json.loads(render_manifest.read_text())
        for category in ("sources", "outputs"):
            for relative, expected in manifest.get(category, {}).items():
                path = ROOT / relative
                if not path.is_file() or digest(path) != expected:
                    raise ValueError("Scene renders are outdated: " + relative)
    return required


def inventory_csv(data, evidence, lang):
    from io import StringIO
    out = StringIO(newline="")
    writer = csv.writer(out)
    headers = (
        ["Clé variante", "Référence catalogue", "Numéro de dessin", "Type de référence",
         "Pièce", "Couleur", "Quantité", "ID couleur BrickLink", "ID couleur LDraw",
         "Vérifié le", "Preuve catalogue", "Statut"]
        if lang == "fr" else
        ["Variant key", "Catalogue reference", "Design ID", "Reference type",
         "Part", "Color", "Quantity", "BrickLink color ID", "LDraw color ID",
         "Checked on", "Catalogue evidence", "Status"]
    )
    headers += [TEXT[lang]["crane_count"], TEXT[lang]["transport_count"]]
    writer.writerow(headers)
    crane = Counter()
    transport = Counter()
    for piece in data["pieces"]:
        target = crane if piece["step"] < data["transportFirstStep"] else transport
        target[piece["part"] + "-" + piece["color"]] += piece.get("quantity", 1)
    for row in data["inventory"]:
        part, color = row["part"], data["colors"][row["color"]]
        proof = evidence[row["key"]]
        writer.writerow([
            row["key"], part["id"], part.get("designId") or "",
            part.get("referenceType") or "", localized(part, "name", lang),
            localized(color, "name", lang), row["count"],
            color.get("bricklink", ""), color["ldraw"],
            proof["sources"][0]["checkedAt"], proof["sources"][0]["url"],
            "Maquette numérique, liste d’achat non validée" if lang == "fr"
            else "Digital model, not a validated shopping list",
            crane[row["key"]], transport[row["key"]],
        ])
    return "\ufeff" + out.getvalue()


def inventory_table(rows, data, evidence, lang, step_number=None, with_sources=False):
    t = TEXT[lang]
    part_heading = t["part"]
    if step_number is not None:
        part_heading += f" · {t['step']} {step_number}"
    headers = [t["reference"], part_heading, t["quantity"]]
    if with_sources:
        headers.append(t["proof"])
    cells = [[p(header, "head") for header in headers]]
    for row in rows:
        part = row["part"]
        reference = part["id"]
        if part.get("referenceType") != "design":
            reference += "\n" + t["catalogue_id"]
        line = [
            p(reference, "cell"),
            p(localized(part, "name", lang) + "\n" +
              localized(data["colors"][row["color"]], "name", lang), "cell"),
            p(row["count"], "cell"),
        ]
        if with_sources:
            source = evidence[row["key"]]["sources"][0]
            host = urlparse(source["url"]).netloc.removeprefix("www.")
            publisher = {"bricklink.com": "BrickLink", "toypro.com": "ToyPro",
                         "rebrickable.com": "Rebrickable", "lego.com": "LEGO"}.get(host, host)
            line.append(linked(publisher + " · " + part["id"], source["url"], "cell"))
        cells.append(line)
    widths = [29*mm, CONTENT_WIDTH-45*mm, 16*mm]
    if with_sources:
        widths = [27*mm, CONTENT_WIDTH-70*mm, 14*mm, 29*mm]
    table = Table(cells, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), YELLOW),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 1), (-1, -1), .35, LINE),
        ("ALIGN", (2, 1), (2, -1), "RIGHT"),
    ]))
    return table


def image_flowable(path, max_height):
    with PILImage.open(path) as im:
        width, height = im.size
    ratio = min(CONTENT_WIDTH / width, max_height / height)
    return Image(str(path), width=width * ratio, height=height * ratio, hAlign="CENTER")


class GuideDoc(BaseDocTemplate):
    def __init__(self, filename, lang, **kwargs):
        super().__init__(
            str(filename), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
            topMargin=22*mm, bottomMargin=22*mm, title=TEXT[lang]["title"] + " · " + TEXT[lang]["guide"],
            author="Nicolas Pieper", subject=TEXT[lang]["scope"], pageCompression=1,
            **kwargs,
        )
        self.lang = lang
        self.bookmarks = []
        frame = Frame(MARGIN, 22*mm, CONTENT_WIDTH, CONTENT_HEIGHT,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="guide", frames=frame, onPage=self.page_frame))

    def page_frame(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(YELLOW)
        canvas.rect(0, HEIGHT-5*mm, WIDTH, 5*mm, fill=1, stroke=0)
        canvas.setFont(BOLD, 8)
        canvas.setFillColor(INK)
        canvas.drawString(MARGIN, HEIGHT-14*mm, TEXT[self.lang]["edition"])
        canvas.setFont(FONT, 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, 12*mm, TEXT[self.lang]["footer"])
        canvas.drawRightString(WIDTH-MARGIN, 12*mm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark"):
            key, title = flowable.bookmark
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0)
            self.bookmarks.append({"key": key, "title": title, "page": self.page})


def heading(text, key, style="title"):
    flowable = p(text, style)
    flowable.bookmark = (key, text)
    return flowable


def table_chunks(rows, data, evidence, lang, max_height, step_number=None, with_sources=False):
    pending = list(rows)
    while pending:
        chunk = []
        while pending:
            candidate = chunk + [pending[0]]
            table = inventory_table(candidate, data, evidence, lang, step_number, with_sources)
            if table.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1] > max_height:
                if not chunk:
                    raise ValueError("A table row cannot fit on a page")
                break
            chunk.append(pending.pop(0))
        yield inventory_table(chunk, data, evidence, lang, step_number, with_sources)


def make_guide(destination, data, rows, by_step, evidence, lang, images_dir, reference_data):
    t = TEXT[lang]
    total = sum(row["count"] for row in data["inventory"])
    count_steps = len(data["steps"])
    site = "https://nicolaspieper.com" + (
        "/kirow/en/large-scale/" if lang == "en" else "/kirow/grande-echelle/")
    stats = f"{total:,} {t['elements']} · {count_steps} {t['steps']}"
    if lang == "fr":
        stats = stats.replace(",", " ")
    split = t["split"].format(crane=data["cranePieceCount"], transport=data["transportPieceCount"])
    story = [
        Spacer(1, 5*mm), heading(t["title"], "cover", "cover"),
        p(t["subtitle"], "sub"), p(stats), p(split, "small"),
        image_flowable(images_dir/"preview.jpg", 119*mm),
        Spacer(1, 4*mm), p(t["guide"], "sub"), p(t["scope"], "small"),
        linked(t["creator"] + " · NicolasPieper.com", "https://NicolasPieper.com/"),
        linked(t["links"], site), p(t["brand"], "small"), PageBreak(),
        heading(t["about"], "before-you-begin"), p(t["reading"]), p(t["scope"]),
        p(data["noteEn" if lang == "en" else "note"]), p(t["track"]),
        p(t["inventory_note"]),
        p(t["checked"] + " " + data["evidence"]["checkedAt"] + ".", "small"),
        p(t["brand"], "small"), PageBreak(),
        heading(t["modes"], "working-and-transport"),
        p(f"{t['crane_count']} : {data['cranePieceCount']} {t['elements']}", "sub"),
        p(f"{t['transport_count']} : {data['transportPieceCount']} {t['elements']}", "sub"),
        p(f"{t['total_count']} : {total} {t['elements']}", "sub"),
        Spacer(1, 4*mm), p(t["mode_note"].format(first=data["transportFirstStep"])),
        p(t["reuse"]), p(t["opaque"]), p(t["inventory_note"]),
        linked(t["links"], site), PageBreak(),
    ]
    cumulative = 0
    for step in data["steps"]:
        number = step["number"]
        step_rows = [dict(rows[key], count=quantity) for key, quantity in by_step[number].items()]
        cumulative += sum(by_step[number].values())
        title = f"{t['step']} {number:02d} / {count_steps} · " + localized(step, "title", lang)
        top = [
            heading(title, f"step-{number:02d}"),
            p(localized(step, "description", lang)),
            p(f"{sum(by_step[number].values())} {t['elements']} · {cumulative} {t['total_so_far']}", "small"),
        ]
        if number == data["transportFirstStep"]:
            top.insert(2, p(t["transport_start"], "small"))
        top_height = sum(flow.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1] +
                         flow.getSpaceBefore() + flow.getSpaceAfter() for flow in top)
        image = image_flowable(images_dir/f"step-{number:02d}.jpg", 116*mm)
        label = p(t["added"], "sub")
        table_room = CONTENT_HEIGHT - top_height - image.drawHeight - 10*mm - 29
        if step_rows:
            first_table = inventory_table(step_rows, data, evidence, lang, number)
            needed = first_table.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1]
            if needed > table_room and needed <= table_room + 18*mm:
                image = image_flowable(images_dir/f"step-{number:02d}.jpg", 98*mm)
                table_room = CONTENT_HEIGHT - top_height - image.drawHeight - 10*mm - 29
        story += [*top, image, Spacer(1, 3*mm), label]
        if not step_rows:
            story += [p(t["none"], "small"), PageBreak()]
            continue
        # Explicit page chunks keep every step identifiable when its table is long.
        chunks = list(table_chunks(step_rows, data, evidence, lang, table_room, number))
        for index, table in enumerate(chunks):
            if index:
                story += [PageBreak(), p(title + " (" + t["continued"] + ")"),
                          p(t["added"], "sub")]
            story.append(table)
        story.append(PageBreak())
    story += [
        heading(t["inventory"], "inventory"), p(
            f"{total} {t['elements']} · {len(data['inventory'])} {t['variants']}"),
        p(split, "small"), p(t["reuse"], "small"), p(t["inventory_note"]),
        p(t["checked"] + " " + data["evidence"]["checkedAt"] + ".", "small"),
        inventory_table(data["inventory"], data, evidence, lang, with_sources=True),
        PageBreak(), heading(t["limits"], "references"),
        p(t["scale"].format(
            scale=data["dimensions"]["scaleApprox"], studs=data["dimensions"]["chassisStuds"],
            mm=data["dimensions"]["chassisMm"], meters=data["dimensions"]["referenceLengthMeters"])),
        p(t["mechanics"]), p(t["geometry"]),
        linked("LDraw · CC BY 4.0 · " + ("Attribution" if lang == "en" else "Attribution"),
               "https://nicolaspieper.com/kirow/large-scale/assets/LDraw-LICENSES.txt"),
        p(t["source_note"], "small"),
    ]
    source_names = {
        "sncf-bully-2026": ("SNCF Réseau · Bully-les-Mines, communiqué du 8 avril 2026, p. 3",
                           "SNCF Réseau · Bully-les-Mines, press release of 8 April 2026, p. 3"),
        "sncf-dijon-2025": ("SNCF Réseau · Présentation de la grue à Dijon",
                           "SNCF Réseau · Crane presentation in Dijon"),
        "kleinspoor-830b": ("Kleinspoor · Notice 830 B, architecture de la reproduction",
                           "Kleinspoor · Instructions 830 B, reproduction architecture"),
        "ciry-photos-in-kleinspoor": ("Bernard Ciry / Kleinspoor · Photos de la grue réelle, p. 14",
                                    "Bernard Ciry / Kleinspoor · Real crane photographs, p. 14"),
        "beretta-sncf-2007": ("Oliver Beretta / STTX · Photographie en configuration de transport",
                            "Oliver Beretta / STTX · Photograph in transport configuration"),
        "kirow-multitasker-fr": ("Kirow · Brochure de la famille Multi Tasker",
                               "Kirow · Multi Tasker family brochure"),
    }
    for source in reference_data.get("sources", []):
        label = source_names.get(source["id"], (source["title"], source["title"]))[lang == "en"]
        story += [linked(label, source["url"]),
                  p(urlparse(source["url"]).netloc + " · " + source.get("accessedAt", ""), "small")]
    story += [Spacer(1, 3*mm), p(t["brand"], "small"),
              linked(t["creator"] + " · NicolasPieper.com", "https://NicolasPieper.com/")]
    doc = GuideDoc(destination, lang)
    doc.build(story)
    return {"pages": doc.page, "bookmarks": doc.bookmarks, "elements": total,
            "steps": count_steps, "variants": len(data["inventory"])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv-only", action="store_true")
    args = parser.parse_args()
    model_hash = digest(ROOT/"src/model-data.json")
    data, rows, by_step, evidence = load_model()
    if digest(ROOT/"src/model-data.json") != model_hash:
        raise ValueError("Model changed while reading; run the generator again")
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    outputs = {}
    for lang in ("fr", "en"):
        outputs[f"assets/inventory-{lang}.csv"] = inventory_csv(data, evidence, lang)
    if args.csv_only:
        for relative, content in outputs.items():
            (ROOT/relative).write_text(content, encoding="utf-8", newline="")
        csv_manifest = {
            "sources": {"src/model-data.json": model_hash,
                        "generate-documents.py": digest(Path(__file__))},
            "outputs": {name: digest(ROOT/name) for name in outputs},
        }
        (assets/"inventory-manifest.json").write_text(json.dumps(csv_manifest, indent=2)+"\n")
        print(f"Generated both CSV inventories: {sum(r['count'] for r in rows.values())} elements, {len(rows)} variants.")
        return
    images_dir = assets/"manual"
    image_paths = verify_images(data, images_dir)
    reference_path = ROOT/"data/real-crane-evidence.json"
    references = json.loads(reference_path.read_text())
    sources = ["src/model-data.json", "generate-documents.py", "data/real-crane-evidence.json"]
    sources += [str(path.relative_to(ROOT)) for path in image_paths]
    if (assets/"render-manifest.json").exists():
        sources.append("assets/render-manifest.json")
    source_hashes = {name: digest(ROOT/name) for name in sources}
    if source_hashes["src/model-data.json"] != model_hash:
        raise ValueError("Model changed before PDF creation; regenerate scene renders")
    pdf_metadata = {}
    temporary_files = []
    try:
        for lang in ("fr", "en"):
            relative = f"assets/building-guide-{lang}.pdf"
            temporary = (ROOT/relative).with_suffix(".tmp.pdf")
            temporary_files.append((temporary, ROOT/relative))
            pdf_metadata[lang] = make_guide(temporary, data, rows, by_step, evidence, lang, images_dir, references)
        if any(digest(ROOT/name) != expected for name, expected in source_hashes.items()):
            raise ValueError("An input changed during PDF creation; regenerate documents")
        for temporary, final in temporary_files:
            temporary.replace(final)
        for relative, content in outputs.items():
            (ROOT/relative).write_text(content, encoding="utf-8", newline="")
    finally:
        for temporary, final in temporary_files:
            temporary.unlink(missing_ok=True)
    output_names = list(outputs) + [f"assets/building-guide-{lang}.pdf" for lang in ("fr", "en")]
    manifest = {
        "sources": source_hashes,
        "outputs": {name: digest(ROOT/name) for name in output_names},
        "documents": pdf_metadata,
    }
    (assets/"documents-manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
    csv_manifest = {
        "sources": {name: source_hashes[name] for name in ("src/model-data.json", "generate-documents.py")},
        "outputs": {name: digest(ROOT/name) for name in outputs},
    }
    (assets/"inventory-manifest.json").write_text(json.dumps(csv_manifest, indent=2)+"\n")
    print(json.dumps({lang: {key: value for key, value in metadata.items() if key != "bookmarks"}
                      for lang, metadata in pdf_metadata.items()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
