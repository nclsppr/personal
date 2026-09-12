#!/usr/bin/env python3
"""Generate the independent large-scale Kirow pages from the actual model."""
from collections import Counter
from html import escape
from pathlib import Path
from urllib.parse import quote, urlencode, urlparse
import json

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent.parent
ORIGIN = 'https://nicolaspieper.com'
ASSETS = '/kirow/large-scale/assets/'
ROUTES = {'fr': '/kirow/grande-echelle/', 'en': '/kirow/en/large-scale/'}
SOURCE = 'https://www.sncf-reseau.com/medias-publics/2026-04/cp_bully_les_mines-vdiff_0.pdf?VersionId=qjcw0Mvq.2V4.dojOLVVHdMMeSVGyfDG'
VERSION = '1'

COPY = {
 'fr': {
  'title': 'Kirow SNCF à grande échelle en briques LEGO · Nicolas Pieper',
  'description': 'Une seconde Kirow SNCF en briques, plus détaillée, créée par Nicolas Pieper. Maquette 3D, inventaire documenté et fascicule illustré en français.',
  'skip': 'Aller au modèle', 'theme': 'Thème sombre', 'nav': ['Le modèle', 'Les détails', 'Le fascicule'],
  'versions': 'Choisir une version de la Kirow', 'mini': 'La miniature', 'large': 'La grande version',
  'heading': 'Kirow, à grande échelle.',
  'intro': 'La même passion du rail, davantage de place pour les détails. Une seconde interprétation de la grue SNCF, dessinée autour de sa cabine décalée, de ses huit essieux et de sa flèche télescopique.',
  'attribution': 'Une création de Nicolas Pieper', 'pieces': 'pièces inventoriées', 'steps': 'étapes grue et convoi', 'references': 'références de la grue',
  'preview': 'Grande maquette jaune en briques de la grue Kirow SNCF, avec cabine asymétrique, huit essieux, stabilisateurs et flèche télescopique.',
  'start': 'Explorer en 3D', 'stop': 'Quitter la 3D', 'status': 'Vue fixe du modèle complet',
  'controls': 'Aux commandes de la Kirow', 'controlIntro': 'Activez la 3D, puis réglez la grue ou choisissez une position.',
  'sliders': ['Élévation de la flèche', 'Rotation de la tourelle', 'Extension de la flèche', 'Déploiement des stabilisateurs', 'Descente du crochet', 'Vue éclatée'],
  'studs': ' tenons', 'views': ['Vue générale', 'Profil', 'Face', 'Dessus', 'Cabine'],
  'transport': 'Transport', 'working': 'En intervention', 'night': 'Heure dorée', 'auto': 'Rotation auto', 'reset': 'Réinitialiser', 'capture': 'Enregistrer une vue',
  'interaction': 'Souris ou doigt pour tourner, molette ou pincement pour zoomer. Les commandes restent aussi accessibles au clavier.',
  'simulation': 'Les mouvements montrent l’intention du modèle numérique. Ils ne valident ni ses liaisons ni sa capacité de levage.',
  'nojs': 'Les vues, étapes, références et téléchargements sont disponibles sans JavaScript. La 3D interactive nécessite JavaScript et un appareil compatible.',
  'details': 'La silhouette se joue dans les détails.',
  'detailsIntro': 'Une cabine d’un côté, les équipements de l’autre, un châssis bas sous une flèche longue : les proportions de la vraie machine guident cette version.',
  'detailTitles': ['La cabine, décalée', 'Huit essieux sur les rails', 'Trois sections pour la flèche'],
  'detailCopy': ['La cabine vitrée et le compartiment technique occupent des volumes distincts. Passerelles, mains courantes et contrepoids dessinent la superstructure.', 'Les deux bogies à quatre essieux reprennent la silhouette ferroviaire. Les tampons, traverses et stabilisateurs donnent sa largeur au châssis.', 'Le bras se prolonge par deux sections plus fines. Deux vérins de levage, la tête de flèche et le moufle rendent la mécanique plus lisible.'],
  'transportTitle': 'La Kirow reprend la voie.',
  'transportIntro': 'Un wagon sous la flèche, un second à l’arrière : la configuration de transport s’inspire du convoi visible sur les photographies fournies.',
  'transportCopy': 'En intervention, la grue se présente seule sur sa voie. Le mode transport replie la flèche et ajoute les deux wagons d’accompagnement. Ce convoi est une interprétation numérique ; ses attelages et son fonctionnement physique restent à valider.',
  'transportAlt': 'Interprétation en briques du convoi Kirow SNCF : grue repliée entre deux wagons sur une voie de présentation.',
  'transportAction': 'Voir le convoi en 3D', 'backControls': 'Revenir aux commandes',
  'countCaption': 'Ce que comprennent les inventaires', 'countHeader': ['Ensemble', 'Pièces'],
  'craneCountLabel': 'Grue et voie de présentation', 'transportCountLabel': 'Complément de transport : deux wagons et voie ajoutée', 'totalCountLabel': 'Inventaire complet des deux modes',
  'countNote': 'Le nombre mis en avant en haut de page est celui de la grue et de sa voie. Le CSV, le modèle LDraw et le fascicule couvrent l’ensemble du convoi ; leurs pièces communes ne sont comptées qu’une fois.',
  'realTitle': 'La vraie Kirow, venue de Dijon.',
  'realCopy': 'Dans son communiqué du 8 avril 2026, SNCF Réseau décrit une grue Kirow acheminée depuis Dijon pour une intervention ferroviaire. Les chiffres ci-dessous concernent cette machine réelle.',
  'realLabels': ['longueur annoncée', 'masse de la grue', 'levage maximal', 'rotation'],
  'source': 'Lire le communiqué SNCF Réseau (PDF)',
  'scaleNote': 'Le modèle est une interprétation visuelle. Ces données ne définissent pas une échelle certifiée ni les capacités de la maquette.',
  'manual': 'Le modèle, étape par étape.', 'manualIntro': 'Les illustrations, les références ajoutées à chaque étape et l’inventaire décrivent le même modèle numérique.',
  'stepLabel': 'Choisir une étape', 'of': 'sur', 'previous': 'Étape précédente', 'next': 'Étape suivante', 'stepParts': 'Pièces ajoutées à cette étape',
  'allSteps': 'Consulter toutes les étapes sans la 3D', 'emptyStep': 'Aucune pièce ajoutée à cette étape.',
  'pdf': 'Fascicule PDF · français', 'inventory': 'Toutes les pièces et leurs sources',
  'inventoryIntro': 'Cet inventaire complet comprend la grue, les deux wagons et la voie de présentation. Chaque ligne correspond à une référence et une couleur réellement présentes dans le modèle numérique. Les liens documentent les pièces, pas leur disponibilité à la vente.',
  'table': ['Référence', 'Pièce', 'Couleur', 'Quantité', 'Sources'], 'csv': 'Inventaire CSV · français', 'ldraw': 'Modèle LDraw',
    'share': 'Faites voyager la grande Kirow.', 'shareText': 'La grue SNCF Kirow à grande échelle en briques, une création de Nicolas Pieper. Découvrez la 3D, les étapes et les pièces documentées.',
  'native': 'Partager…', 'copy': 'Copier le lien', 'email': 'Email', 'sms': 'SMS', 'x': 'Partager sur X', 'newTab': 'nouvel onglet', 'address': 'Le lien à partager',
  'copyHelp': 'Sélectionnez cette adresse pour la copier dans un message ou une story.', 'socialDownload': 'Télécharger le visuel de partage',
  'socialAlt': 'La grande grue Kirow SNCF en briques jaunes, une création de Nicolas Pieper pour Brick Atelier.',
  'socialHelp': 'Un visuel JPG à joindre à un message ou à publier sur un réseau. Ajoutez le lien de la page à votre publication ou au sticker Lien de votre story Instagram.',
  'copyDone': 'Lien copié.', 'copyFailed': 'Sélectionnez et copiez l’adresse ci-dessous.', 'shareOpening': 'Ouverture du partage…', 'shareOpened': 'La fenêtre de partage est ouverte.', 'shareCancelled': 'Partage interrompu.', 'shareFailed': 'Le partage est indisponible ici. Utilisez les liens ou copiez l’adresse.',
  'legal': 'Création indépendante, sans affiliation à LEGO, KIROW ou SNCF. Les marques appartiennent à leurs propriétaires. Il ne s’agit pas d’un set officiel ni d’un kit dont le montage serait validé.',
  'loading': 'Chargement de la 3D…', 'unavailable': 'Vue fixe · 3D indisponible sur cet appareil', 'ready': 'Faites glisser pour tourner · pincez pour zoomer', 'activeNote': 'Les commandes agissent sur la vue 3D.', 'busy': 'Chargement…',
 },
 'en': {
  'title': 'Large-scale Kirow SNCF crane in LEGO bricks · Nicolas Pieper',
  'description': 'A second, more detailed SNCF Kirow brick crane by Nicolas Pieper. Explore the 3D model, documented inventory and illustrated English guide.',
  'skip': 'Skip to the model', 'theme': 'Dark theme', 'nav': ['The model', 'The details', 'The building guide'],
  'versions': 'Choose a Kirow version', 'mini': 'The miniature', 'large': 'The large version',
  'heading': 'Kirow, at large scale.',
  'intro': 'The same love of railways, more room for the details. A second interpretation of the SNCF crane, shaped around its offset cab, eight axles and telescopic boom.',
  'attribution': 'A creation by Nicolas Pieper', 'pieces': 'inventoried pieces', 'steps': 'crane and train steps', 'references': 'crane part references',
  'preview': 'Large yellow brick model of the SNCF Kirow crane, with an asymmetric cab, eight axles, outriggers and a telescopic boom.',
  'start': 'Explore in 3D', 'stop': 'Leave 3D', 'status': 'Still view of the complete model',
  'controls': 'At the Kirow controls', 'controlIntro': 'Activate 3D, then adjust the crane or choose a pose.',
  'sliders': ['Boom elevation', 'Turret rotation', 'Boom extension', 'Outrigger extension', 'Hook lowering', 'Exploded view'],
  'studs': ' studs', 'views': ['Overview', 'Side', 'Front', 'Top', 'Cab'],
  'transport': 'Transport', 'working': 'Working', 'night': 'Golden hour', 'auto': 'Auto rotation', 'reset': 'Reset', 'capture': 'Save a view',
  'interaction': 'Drag with a mouse or finger to orbit, scroll or pinch to zoom. The controls are also available with a keyboard.',
  'simulation': 'The movements illustrate the digital model’s intended operation. They do not validate its connections or lifting capacity.',
  'nojs': 'Views, steps, references and downloads remain available without JavaScript. Interactive 3D requires JavaScript and a compatible device.',
  'details': 'The details define the silhouette.',
  'detailsIntro': 'A cab on one side, equipment on the other, a low chassis beneath a long boom: the real machine’s proportions guide this version.',
  'detailTitles': ['The offset cab', 'Eight axles on the rails', 'A three-section boom'],
  'detailCopy': ['The glazed cab and equipment compartment occupy distinct volumes. Walkways, handrails and the counterweight define the superstructure.', 'Two four-axle bogies recreate the railway silhouette. Buffers, end beams and outriggers give the underframe its width.', 'Two slimmer sections extend the main boom. Twin lifting actuators, the boom head and hook block make the mechanism easier to read.'],
  'transportTitle': 'The Kirow heads back along the line.',
  'transportIntro': 'One wagon beneath the boom, another behind the crane: the transport configuration takes its cue from the train in the supplied photographs.',
  'transportCopy': 'Working mode shows the crane alone on its track. Transport mode lowers the boom and adds two accompanying wagons. This train is a digital interpretation; its couplings and physical operation still need validation.',
  'transportAlt': 'Brick interpretation of the SNCF Kirow train: a lowered crane between two wagons on a display track.',
  'transportAction': 'View the train in 3D', 'backControls': 'Back to the controls',
  'countCaption': 'What the inventories include', 'countHeader': ['Assembly', 'Pieces'],
  'craneCountLabel': 'Crane and display track', 'transportCountLabel': 'Transport additions: two wagons and extra track', 'totalCountLabel': 'Complete inventory for both modes',
  'countNote': 'The headline count covers the crane and its track. The CSV, LDraw model and illustrated guide cover the complete train; shared pieces are counted only once.',
  'realTitle': 'The real Kirow, brought from Dijon.',
  'realCopy': 'In its 8 April 2026 press release, SNCF Réseau describes a Kirow crane brought from Dijon for a railway operation. The figures below refer to that real machine.',
  'realLabels': ['stated length', 'crane mass', 'maximum lift', 'rotation'],
  'source': 'Read the SNCF Réseau press release (PDF)',
  'scaleNote': 'This model is a visual interpretation. Those figures do not define a certified scale or the model’s capabilities.',
  'manual': 'The model, step by step.', 'manualIntro': 'The illustrations, parts added at each step and complete inventory describe the same digital model.',
  'stepLabel': 'Choose a step', 'of': 'of', 'previous': 'Previous step', 'next': 'Next step', 'stepParts': 'Parts added at this step',
  'allSteps': 'Read every step without 3D', 'emptyStep': 'No parts are added at this step.',
  'pdf': 'Illustrated PDF guide · English', 'inventory': 'Every part and its sources',
  'inventoryIntro': 'This complete inventory includes the crane, both wagons and the display track. Each row represents a part and colour actually present in the digital model. The links document catalogue pieces, not their current availability for purchase.',
  'table': ['Reference', 'Part', 'Colour', 'Quantity', 'Sources'], 'csv': 'Inventory CSV · English', 'ldraw': 'LDraw model',
    'share': 'Let the large Kirow travel.', 'shareText': 'The SNCF Kirow crane at large scale in bricks, a creation by Nicolas Pieper. Explore its 3D model, steps and documented parts.',
  'native': 'Share…', 'copy': 'Copy link', 'email': 'Email', 'sms': 'SMS', 'x': 'Share on X', 'newTab': 'new tab', 'address': 'The link to share',
  'copyHelp': 'Select this address to copy it into a message or story.', 'socialDownload': 'Download the sharing image',
  'socialAlt': 'The large yellow SNCF Kirow brick crane, a creation by Nicolas Pieper for Brick Atelier.',
  'socialHelp': 'A JPG image to attach to a message or post on a social network. Add this page’s link to your post or to a Link sticker in your Instagram story.',
  'copyDone': 'Link copied.', 'copyFailed': 'Select and copy the address below.', 'shareOpening': 'Opening sharing…', 'shareOpened': 'The sharing window is open.', 'shareCancelled': 'Sharing stopped.', 'shareFailed': 'Sharing is unavailable here. Use the links or copy the address.',
  'legal': 'An independent creation, with no affiliation to LEGO, KIROW or SNCF. Brands belong to their owners. This is not an official set or a kit whose assembly has been validated.',
  'loading': 'Loading 3D…', 'unavailable': 'Still view · 3D unavailable on this device', 'ready': 'Drag to orbit · pinch to zoom', 'activeNote': 'The controls affect the 3D view.', 'busy': 'Loading…',
 },
}


def asset(name):
 return ASSETS + name + '?v=' + VERSION


def localized(obj, key, lang):
 return obj[key if lang == 'fr' else key + 'En']


def render(data, lang):
 d = COPY[lang]
 pieces, inventory, steps = data['pieces'], data['inventory'], data['steps']
 counts = Counter()
 step_counts = {}
 for piece in pieces:
  key = piece['part'] + '-' + piece['color']
  counts[key] += piece.get('quantity', 1)
  step_counts.setdefault(piece['step'], Counter())[key] += piece.get('quantity', 1)
 assert counts == Counter({row['key']: row['count'] for row in inventory}), 'Inventory differs from the model'
 assert [step['number'] for step in steps] == list(range(1, len(steps) + 1)), 'Steps must be consecutive'
 assert steps, 'The complete model must contain assembly steps'
 total = sum(counts.values())
 crane_total, transport_total = data['cranePieceCount'], data['transportPieceCount']
 assert total == data['totalPieceCount'] == crane_total + transport_total, 'Crane and transport counts differ from the full inventory'
 transport_first_step = data['transportFirstStep']
 crane_pieces = [piece for piece in pieces if piece['step'] < transport_first_step]
 assert sum(piece.get('quantity', 1) for piece in crane_pieces) == crane_total, 'Crane count differs from the model stages'
 assert 1 < transport_first_step <= len(steps) and transport_total > 0, 'Transport stages and pieces must exist'
 reference_count = len({str(data['catalog'][piece['part']]['id']) for piece in crane_pieces})
 rows_by_key = {row['key']: row for row in inventory}
 variants = {variant['key']: variant for variant in data['evidence']['variants']}
 assert set(counts) == set(variants), 'Every used part and colour must have evidence'
 route, url = ROUTES[lang], ORIGIN + ROUTES[lang]
 mini = '/kirow/' if lang == 'fr' else '/kirow/en/'
 other_lang = 'en' if lang == 'fr' else 'fr'
 social = ORIGIN + asset(f'social-{lang}.jpg')
 pdf = asset(f'building-guide-{lang}.pdf')
 def formatted_count(value):
  return f'{value:,}'.replace(',', ' ' if lang == 'fr' else ',')
 formatted_total = formatted_count(total)
 formatted_crane = formatted_count(crane_total)

 def part_label(row):
  return localized(row['part'], 'name', lang)

 def colour(key):
  return localized(data['colors'][key], 'name', lang)

 def references(number):
  rows = []
  for key, count in step_counts.get(number, {}).items():
   row = rows_by_key[key]
   label = f'{part_label(row)} · {row["part"]["id"]} · {colour(row["color"])} × {count}'
   rows.append(f'<li><a href="#piece-{escape(key)}">{escape(label)}</a></li>')
  return '<ul class="part-chips">' + ''.join(rows) + '</ul>' if rows else f'<p>{d["emptyStep"]}</p>'

 def reference_sources(key):
  links = []
  for source in variants[key]['sources']:
   host = urlparse(source['url']).netloc.removeprefix('www.')
   label = f'{host} · {source["checkedAt"]}'
   links.append(f'<a href="{escape(source["url"], quote=True)}">{escape(label)}</a>')
  return '<br>'.join(links)

 controls = []
 for index, (key, low, high, value, unit) in enumerate([
  ('elevation', 0, 65, 12, '°'), ('slew', -180, 180, 0, '°'),
  ('extension', 0, 100, 35, '%'), ('outriggers', 0, 100, 100, '%'),
  ('hook', 3, 30, 12, d['studs']), ('explode', 0, 100, 0, '%'),
 ]):
  controls.append(f'<div class="control"><label for="{key}">{d["sliders"][index]}<output id="{key}-value" for="{key}">{value}{unit}</output></label><input class="pose-input" type="range" id="{key}" min="{low}" max="{high}" value="{value}" data-unit="{unit}" disabled></div>')
 views = ''.join(f'<button type="button" data-view="{key}" aria-pressed="{"true" if key == "hero" else "false"}" disabled>{label}</button>' for key, label in zip(('hero', 'side', 'front', 'top', 'detail'), d['views']))
 options, all_steps = [], []
 for step in steps:
  number = step['number']
  title, description = localized(step, 'title', lang), localized(step, 'description', lang)
  options.append(f'<option value="{number}" data-description="{escape(description, quote=True)}"{" selected" if number == len(steps) else ""}>{number:02d} · {escape(title)}</option>')
  all_steps.append(f'<article class="static-step" id="step-{number}"><img src="{asset(f"manual/step-{number:02d}.jpg")}" alt="{escape(title, quote=True)}" width="1200" height="900" loading="lazy"><div><h3>{number:02d} · {escape(title)}</h3><p>{escape(description)}</p><div id="all-step-parts-{number}">{references(number)}</div></div></article>')
 inventory_rows = ''.join(f'<tr id="piece-{escape(row["key"])}"><th scope="row">{escape(str(row["part"]["id"]))}</th><td>{escape(part_label(row))}</td><td>{escape(colour(row["color"]))}</td><td class="quantity">{row["count"]}</td><td>{reference_sources(row["key"])}</td></tr>' for row in inventory)
 detail_figures = ''.join(f'<figure><img src="{asset(f"detail-{name}.jpg")}" width="1200" height="900" loading="lazy" alt="{escape(d["detailTitles"][index], quote=True)}"><figcaption><h3>{d["detailTitles"][index]}</h3><p>{d["detailCopy"][index]}</p></figcaption></figure>' for index, name in enumerate(('cab', 'bogies', 'boom')))
 schema = {'@context': 'https://schema.org', '@graph': [
  {'@type': 'Person', '@id': ORIGIN + '/#person', 'name': 'Nicolas Pieper', 'url': ORIGIN + '/'},
  {'@type': 'ImageObject', '@id': url + '#image', 'contentUrl': social, 'url': social, 'width': 1200, 'height': 630, 'caption': d['socialAlt'], 'creator': {'@id': ORIGIN + '/#person'}},
  {'@type': 'CreativeWork', '@id': url + '#model', 'name': d['title'], 'description': d['description'], 'url': url, 'inLanguage': lang, 'creator': {'@id': ORIGIN + '/#person'}, 'image': {'@id': url + '#image'}, 'isAccessibleForFree': True, 'citation': SOURCE},
  {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': d['title'], 'description': d['description'], 'inLanguage': lang, 'author': {'@id': ORIGIN + '/#person'}, 'mainEntity': {'@id': url + '#model'}, 'primaryImageOfPage': {'@id': url + '#image'}},
 ]}
 alternates = ''.join(f'<link rel="alternate" hreflang="{key}" href="{ORIGIN + value}">' for key, value in {**ROUTES, 'x-default': ROUTES['fr']}.items())
 last = steps[-1]
 email = 'mailto:?' + urlencode({'subject': d['title'], 'body': d['shareText'] + '\n\n' + url}, quote_via=quote)
 sms = 'sms:?body=' + quote(url, safe='')
 x_url = 'https://x.com/intent/tweet?' + urlencode({'text': d['shareText'], 'url': url, 'lang': lang}, quote_via=quote)
 share_messages = ' '.join(f'data-{html_key}="{escape(d[key], quote=True)}"' for html_key, key in [('copy-done', 'copyDone'), ('copy-failed', 'copyFailed'), ('share-opening', 'shareOpening'), ('share-opened', 'shareOpened'), ('share-cancelled', 'shareCancelled'), ('share-failed', 'shareFailed')])
 ui_messages = {key: d[key] for key in ('loading', 'unavailable', 'ready', 'activeNote', 'busy', 'start', 'status')}
 return f'''<!doctype html>
<html lang="{lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{d['title']}</title><meta name="description" content="{escape(d['description'], quote=True)}"><meta name="author" content="Nicolas Pieper"><meta name="robots" content="index, follow, max-image-preview:large"><meta name="theme-color" content="#ffcf00"><meta name="color-scheme" content="light dark">
<link rel="canonical" href="{url}">{alternates}<link rel="icon" type="image/svg+xml" href="/kirow/assets/favicon.svg?v=2"><link rel="preload" href="/assets/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website"><meta property="og:site_name" content="Nicolas Pieper"><meta property="og:title" content="{d['title']}"><meta property="og:description" content="{escape(d['description'], quote=True)}"><meta property="og:url" content="{url}"><meta property="og:locale" content="{'fr_FR' if lang == 'fr' else 'en_US'}"><meta property="og:locale:alternate" content="{'en_US' if lang == 'fr' else 'fr_FR'}"><meta property="og:image" content="{social}"><meta property="og:image:secure_url" content="{social}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{d['socialAlt']}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{d['title']}"><meta name="twitter:description" content="{escape(d['description'], quote=True)}"><meta name="twitter:image" content="{social}"><meta name="twitter:image:alt" content="{d['socialAlt']}">
<link rel="stylesheet" href="{asset('large-scale.css')}"><script type="module" src="{asset('app.js')}"></script><script defer src="/kirow/assets/share.js?v=1"></script><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head><body><a class="skip-link" href="#modele">{d['skip']}</a>
<header class="site-header"><a class="brand" href="{mini}" aria-label="Brick Atelier"><img src="/kirow/assets/brick-atelier-mark.svg?v=2" width="52" height="42" alt=""><span>BRICK<br>ATELIER</span></a><nav class="main-nav" aria-label="{'Navigation principale' if lang == 'fr' else 'Main navigation'}"><a href="#modele">{d['nav'][0]}</a><a href="#details">{d['nav'][1]}</a><a href="#fascicule">{d['nav'][2]}</a></nav><div class="header-tools"><a href="{ROUTES[other_lang]}" hreflang="{other_lang}" lang="{other_lang}" aria-label="{'Read in English' if lang == 'fr' else 'Lire en français'}">{other_lang.upper()}</a><button id="theme" type="button" aria-pressed="false" hidden>{d['theme']}</button></div></header>
<main><nav class="model-versions" aria-label="{d['versions']}"><a href="{mini}">{d['mini']}</a><a href="{route}" aria-current="page">{d['large']}</a></nav>
<section class="model-section" id="modele" aria-labelledby="model-title"><div class="model-intro"><div><h1 id="model-title">{d['heading']}</h1><p class="intro">{d['intro']}</p><p class="creator">{d['attribution']}</p></div><dl class="model-stats"><div><dt>{formatted_crane}</dt><dd>{d['pieces']}</dd></div><div><dt>{len(steps)}</dt><dd>{d['steps']}</dd></div><div><dt>{reference_count}</dt><dd>{d['references']}</dd></div></dl></div>
<div class="workspace"><div class="model-visual"><div class="viewer" id="viewer"><img class="preview" id="preview" src="{asset('preview.jpg')}" width="1600" height="1100" alt="{d['preview']}" fetchpriority="high"><div class="scene-host" id="scene-host"></div><button class="start-3d" id="start-3d" type="button" hidden>{d['start']} <span aria-hidden="true">↗</span></button><button class="touch-exit" id="touch-exit" type="button" hidden>{d['stop']}</button></div><div class="view-toolbar" aria-label="{'Vues du modèle' if lang == 'fr' else 'Model views'}">{views}<button type="button" id="capture" disabled>{d['capture']}</button></div><p class="render-status" id="render-status" role="status">{d['status']}</p></div>
<div class="control-panel" aria-labelledby="control-title"><h2 id="control-title">{d['controls']}</h2><p>{d['controlIntro']}</p><div class="pose-toolbar"><button type="button" data-pose="transport" aria-pressed="false" disabled>{d['transport']}</button><button type="button" data-pose="working" aria-pressed="true" disabled>{d['working']}</button></div><div class="control-grid">{''.join(controls)}</div><div class="switches"><button type="button" data-toggle="night" aria-pressed="false" disabled>{d['night']}</button><button type="button" data-toggle="auto" aria-pressed="false" disabled>{d['auto']}</button><button type="button" id="reset" disabled>{d['reset']}</button></div><p class="interaction-note">{d['interaction']}</p></div></div>
<noscript><p class="notice">{d['nojs']}</p></noscript><div class="model-beneath"><p>{d['simulation']}</p><div class="download-links"><a href="{pdf}">{d['pdf']} <span aria-hidden="true">↗</span></a><a id="download-ldraw" href="{ASSETS}kirow-large-scale.ldr" download>{d['ldraw']} <span aria-hidden="true">↓</span></a></div></div></section>
<section class="details-section section" id="details" aria-labelledby="details-title"><div class="section-heading"><h2 id="details-title">{d['details']}</h2><p>{d['detailsIntro']}</p></div><div class="detail-gallery">{detail_figures}</div></section>
<section class="transport-section section" id="transport" aria-labelledby="transport-title"><div class="section-heading"><h2 id="transport-title">{d['transportTitle']}</h2><p>{d['transportIntro']}</p></div><figure class="transport-visual"><img src="{asset('transport.jpg')}" width="1600" height="900" alt="{d['transportAlt']}" loading="lazy"><figcaption><p>{d['transportCopy']}</p><div class="transport-actions"><button type="button" data-pose="transport" aria-pressed="false" disabled>{d['transportAction']}</button><a href="#modele">{d['backControls']}</a></div></figcaption></figure><div class="inventory-breakdown"><table><caption>{d['countCaption']}</caption><thead><tr><th scope="col">{d['countHeader'][0]}</th><th scope="col">{d['countHeader'][1]}</th></tr></thead><tbody><tr><th scope="row">{d['craneCountLabel']}</th><td data-count="crane">{formatted_crane}</td></tr><tr><th scope="row">{d['transportCountLabel']}</th><td data-count="transport">{formatted_count(transport_total)}</td></tr><tr><th scope="row">{d['totalCountLabel']}</th><td data-count="total">{formatted_total}</td></tr></tbody></table><p>{d['countNote']}</p></div></section>
<section class="real-crane section" id="inspiration" aria-labelledby="real-title"><div><h2 id="real-title">{d['realTitle']}</h2><p>{d['realCopy']}</p><a href="{escape(SOURCE, quote=True)}">{d['source']} <span aria-hidden="true">↗</span></a></div><div><dl class="real-stats">{''.join(f'<div><dt>{value}</dt><dd>{label}</dd></div>' for value, label in zip(('14 m', '108 t', '150 t', '360°'), d['realLabels']))}</dl><p class="scale-note">{d['scaleNote']}</p></div></section>
<section class="manual-section section" id="fascicule" aria-labelledby="manual-title"><div class="section-heading"><h2 id="manual-title">{d['manual']}</h2><p>{d['manualIntro']}</p></div><div class="manual-layout"><div class="manual-image"><img id="step-image" src="{asset(f'manual/step-{last["number"]:02d}.jpg')}" width="1200" height="900" alt="{escape(localized(last, 'title', lang), quote=True)}" loading="lazy"><span class="step-counter"><b id="step-number">{last['number']}</b> {d['of']} {len(steps)}</span></div><div class="manual-copy"><label for="step-select">{d['stepLabel']}</label><select id="step-select" disabled>{''.join(options)}</select><h3 id="step-title">{escape(localized(last, 'title', lang))}</h3><p id="step-description">{escape(localized(last, 'description', lang))}</p><p class="parts-label">{d['stepParts']}</p><div id="step-parts">{references(last['number'])}</div><div class="step-actions"><button type="button" id="previous-step" aria-label="{d['previous']}" disabled>←</button><button type="button" id="next-step" aria-label="{d['next']}" disabled>→</button><a href="{pdf}">{d['pdf']}</a></div></div></div><p class="notice">{escape(localized(data, 'note', lang))}</p>
<details class="complete-guide"><summary>{d['allSteps']} · {len(steps)}</summary>{''.join(all_steps)}</details>
<details class="inventory" id="inventory"><summary>{d['inventory']} · {formatted_total}</summary><p>{d['inventoryIntro']}</p><div class="table-scroll" role="region" aria-label="{d['inventory']}" tabindex="0"><table id="inventory-table"><thead><tr>{''.join(f'<th scope="col">{label}</th>' for label in d['table'])}</tr></thead><tbody>{inventory_rows}</tbody></table></div><div class="download-links"><a href="{ASSETS}inventory-{lang}.csv" download>{d['csv']}</a><a href="{ASSETS}kirow-large-scale.ldr" download>{d['ldraw']}</a></div></details></section>
<section class="share-section section" id="partager" aria-labelledby="share-title" data-share-section data-share-url="{url}" data-share-title="{d['title']}" data-share-text="{escape(d['shareText'], quote=True)}" {share_messages}><div><h2 id="share-title">{d['share']}</h2><div class="share-actions"><button type="button" data-share-native hidden>{d['native']}</button><a href="{sms}" data-share-sms>{d['sms']}</a><a href="{escape(email, quote=True)}">{d['email']}</a><a href="{escape(x_url, quote=True)}" target="_blank" rel="noopener noreferrer">{d['x']} <span aria-hidden="true">↗</span><span class="sr-only"> · {d['newTab']}</span></a></div><p role="status" aria-live="polite" aria-atomic="true" data-share-status></p><label for="share-address">{d['address']}</label><div class="share-address-row"><input type="url" id="share-address" value="{url}" readonly spellcheck="false" autocomplete="off" aria-describedby="share-help" data-share-address><button type="button" data-share-copy hidden>{d['copy']}</button></div><p id="share-help">{d['copyHelp']}</p></div><figure><img src="{asset(f'social-{lang}.jpg')}" width="1200" height="630" alt="{d['socialAlt']}" loading="lazy"><figcaption><a href="{asset(f'social-{lang}.jpg')}" download>{d['socialDownload']} <span aria-hidden="true">↓</span></a><p>{d['socialHelp']}</p></figcaption></figure></section>
</main><footer><div><strong>BRICK ATELIER · KIROW</strong><p>{d['attribution']} · <a href="https://nicolaspieper.com/" rel="author">NicolasPieper.com</a></p><p>{d['legal']}</p></div><a href="{mini}">{d['mini']} <span aria-hidden="true">↗</span></a></footer><script type="application/json" id="ui-messages">{json.dumps(ui_messages, ensure_ascii=False)}</script></body></html>
'''


def main():
 data = json.loads((ROOT / 'src/model-data.json').read_text(encoding='utf-8'))
 for lang, route in ROUTES.items():
  target = SITE / route.lstrip('/') / 'index.html'
  target.parent.mkdir(parents=True, exist_ok=True)
  target.write_text(render(data, lang), encoding='utf-8')
  print(f'Generated {target.relative_to(SITE)}')


if __name__ == '__main__':
 main()
