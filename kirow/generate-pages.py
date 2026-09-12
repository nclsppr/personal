"""Generate both static Kirow pages. No framework or runtime translation."""
from pathlib import Path
from share_page import render_share
from editorial_page import render_guide, render_packaging
import json, html, csv
from collections import Counter
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/'src/blueprint-data.json').read_text())
escape=html.escape
EVIDENCE=DATA['evidence']
VARIANTS={v['key']:v for v in EVIDENCE['variants']}
PARTS=DATA['bricks']+DATA['specials']
TOTAL=len(PARTS)
REFERENCE_COUNT=len({r['part']['id'] for r in DATA['inventory']})
assert TOTAL==sum(r['count'] for r in DATA['inventory']), 'Inventory differs from the model'
assert all(r['key'] in VARIANTS for r in DATA['inventory']), 'An inventory variant has no source'

def part_name(part,lang):
 if lang=='fr':return part['name']
 return part.get('nameEn',part['name'].replace('Brique ronde','Round brick').replace('Brique','Brick').replace('Plaque','Plate').replace('Tuile','Tile'))

def color_name(key,lang):
 return DATA['colors'][key]['name'] if lang=='fr' else DATA['colors'][key].get('nameEn',{'yellow':'Yellow','black':'Black','dark':'Dark bluish grey','gray':'Light bluish grey','white':'White','red':'Red','glass':'Transparent light blue'}.get(key,DATA['colors'][key]['name']))

def source_label(source):
 host=urlparse(source['url']).netloc.removeprefix('www.')
 return {'toypro.com':'ToyPro','briquestore.fr':'Briquestore','bricklink.com':'BrickLink','rebrickable.com':'Rebrickable','lego.com':'LEGO','library.ldraw.org':'LDraw'}.get(host,host)

def reference_text(variant,lang):
 design=variant.get('designId')
 if design:return 'LEGO '+str(design)
 return ('Réf. catalogue ' if lang=='fr' else 'Catalogue ref. ')+str(DATA['catalog'][variant['part']]['id'])

def step_references(step,lang):
 counts=Counter(b['part']+'-'+b['color'] for b in PARTS if b['step']==step)
 result=[]
 for key,count in counts.items():
  variant=VARIANTS[key];part=DATA['catalog'][variant['part']]
  label=f'{part_name(part,lang)} · {reference_text(variant,lang)} · {color_name(variant["color"],lang)} × {count}'
  result.append(f'<li><a href="#piece-{escape(key)}">{escape(label)}</a></li>')
 if not result:
  label='Aucune pièce ajoutée au modèle à cette étape.' if lang=='fr' else 'No parts added to the model at this step.'
  return f'<p class="step-empty">{label}</p>'
 return '<ul class="part-chips">'+''.join(result)+'</ul>'
ICONS={
'play':'<path d="m8 5 11 7-11 7Z"/>','download':'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
'arrow':'<path d="M5 12h14m-5-5 5 5-5 5"/>','moon':'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
'rotate':'<path d="M20 7v5h-5M4 17v-5h5m-4-3a7.5 7.5 0 0 1 12.5-4L20 8M4 16l2.5 3A7.5 7.5 0 0 0 19 15"/>',
'camera':'<path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/>',
'cube':'<path d="m12 3 9 5v9l-9 5-9-5V8Zm0 10L3 8m9 5 9-5m-9 5v9m-4.5-16.5 9 5"/>',
'book':'<path d="M12 5v16M3 4h5l4 2 4-2h5v15h-5l-4 2-4-2H3Z"/>',
'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
'spark':'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>'}
def icon(key):return '<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[key]+'</svg>'
EN_TITLES=['The track', 'Bogies', 'Bogie sides', 'Underframe', 'Longitudinal beams', 'Yellow band', 'Deck', 'Buffer beams', 'Outriggers', 'Slewing bearing', 'Turret floor', 'Engine hood · 1', 'Engine hood · 2', 'Prepare the grilles', 'Roof and grilles', 'Counterweight · 1', 'Counterweight · 2', 'Cab floor', 'Cab pillars', 'Windows and controls', 'Cab roof', 'Pivot and actuator', 'Boom · base', 'Boom · lower walls', 'Boom · upper walls', 'Boom · closing plates', 'Inner boom · base', 'Inner boom · body', 'Boom head', 'Hook block', 'Finishing touches', 'Final assembly']
EN_DESCS=[
 'Join five dark bluish grey LEGO 53401 straight tracks. Their sleepers are part of the moulding: no custom rail bars.',
 'Prepare eight LEGO 2878 holders, sixteen LEGO 57878 wheels and eight metal axles, BrickLink ref. x1687. Each axle is 5 studs long.',
 'Add the dark bluish grey LEGO 3010 bricks. Each bogie pivot combines a black LEGO 3680 base with a light bluish grey LEGO 3679 top.',
 'Line up the black LEGO 3035 plates over a length of 40 studs.',
 'Stagger the black LEGO 3001 brick joints to connect the chassis plates.',
 'Add a row of yellow LEGO 3010 bricks to both sides of the chassis.',
 'Close the chassis with dark bluish grey LEGO 3035 plates. Keep the central surface accessible.',
 'Add LEGO 3035 plates, LEGO 3008 bricks and LEGO 3024 lights. The real LEGO 4022 buffers receive LEGO 2920 holders and LEGO 73092 magnets.',
 'Assemble the arms and feet with LEGO 3001, 3003, 3031 and 3034. LEGO 2429 and 2430 hinges are proposed for the joints; their attachment and strength still need testing.',
 'The real turntable combines light bluish grey LEGO 18939 and black LEGO 18938 on LEGO 3031 plates. Check the attachments before rotating a physical model.',
 'Build the yellow superstructure floor with LEGO 3020 plates, centred on the LEGO 18939 / 18938 turntable.',
 'Build the lower yellow compartment walls with LEGO 3001 and 3003 bricks, staggering the joints.',
 'Continue the walls with LEGO 3001 and 3003. The black band consists of LEGO 3001 bricks.',
 'Prepare eight black LEGO 2412 grilles, catalogue variant 2412b. They will attach to the roof studs in the next step.',
 'Close the compartment with yellow LEGO 3031 plates and add the eight black LEGO 2412 (2412b) grilles. The KIROW marking is a custom graphic.',
 'Build the base with dark bluish grey LEGO 3031 plates. Its mass and attachment still need checking before any lifting test.',
 'Stack yellow and black LEGO 3001 bricks, then yellow LEGO 3031 plates. The 150 t inscription is a custom graphic on the model.',
 'Assemble the platform with LEGO 3031 and the lower walls with LEGO 3001, in yellow.',
 'Build the yellow LEGO 3005 pillars. The openings receive LEGO 60592 frames in the next step.',
 'Fit ten yellow LEGO 60592 frames with ten clear LEGO 60601 panes. Add the black LEGO 4079 seat, LEGO 4592 lever base and LEGO 4593 lever on LEGO 3710 plates.',
 'Close the cab with yellow LEGO 3031 plates. LEGO 60592 frames keep their actual dimensions.',
 'The LEGO 3010 supports end with two LEGO 3701 Technic bricks. Add the LEGO 3707 axle, LEGO 3713 bushes and LEGO 2780 pins. The real actuator is assembly BrickLink ref. 61927c01. Its stroke, attachment points and boom strength still need validation.',
 'Line up the yellow LEGO 3031 plates of the first boom section.',
 'Stagger the yellow LEGO 3010 brick joints on both side walls.',
 'Continue the walls with yellow LEGO 3010 and LEGO 3004 bricks.',
 'Fit the yellow LEGO 3031 top plates. The SNCF marking is a custom graphic, not a printed LEGO piece.',
 'Build the narrower section with yellow LEGO 3020 plates.',
 'Reinforce the inner boom with yellow LEGO 3001 bricks. Physical telescoping has not been validated.',
 'Add yellow and black LEGO 3020 plates, then two black 24 mm LEGO 4185 pulleys. Their axles and supports still need development.',
 'Assemble yellow and black LEGO 3001, two LEGO 4185 pulleys, the black metal LEGO 70644 hook and one thin 50 cm LEGO string, BrickLink ref. x77ac50. Both visible strands belong to that string; its routing and attachment still need testing.',
 'Fit yellow LEGO 2486 handrails on LEGO 3062 uprights. The white lights and transparent orange beacon use LEGO 4073.',
 'All part and colour references have sources. Check collisions, connections and stability in building software, then with a prototype. Sky, grass and ballast are scenery; markings are custom graphics. This study does not certify a functional crane.',
]
COPY={
'fr':dict(title='Grue Kirow SNCF en briques LEGO · Nicolas Pieper',description='La grue Kirow SNCF en briques LEGO, une création de Nicolas Pieper. Explorez la maquette 3D, ses 32 étapes illustrées et les références de pièces documentées.',skip='Aller au modèle',nav=['Le modèle','Les commandes','Le fascicule'],theme='Changer le thème de la page',crumb='Les constructions extraordinaires',edition='Étude de construction · Kirow',heading=['KIROW','SUR RAILS.'],subtitle='La grue ferroviaire SNCF, réimaginée en briques.',stage='COLLECTION FERROVIAIRE',stageTitle='La puissance, brique par brique.',start='Explorer en 3D',stop='Quitter la 3D',status='Vue extérieure · références LEGO documentées',preview='Maquette en briques jaunes de la grue ferroviaire Kirow, avec huit essieux, stabilisateurs et flèche de levage.',stats=['éléments inventoriés','étapes','références de pièces'],intro='Un géant du rail, à portée de main. Sa silhouette jaune, ses huit essieux et sa longue flèche deviennent une maquette à explorer sous tous les angles.',primary='Prendre les commandes',pdf='Ouvrir le fascicule',small='Étude personnelle avec des références LEGO documentées. Le montage physique et les liaisons mécaniques restent à valider.',features=['Pièces et couleurs sourcées','Vue 3D à 360°','Fascicule illustré inclus'],dedication='Pour ceux qui remettent tout sur les rails.',dedicationSmall='La précision, brique après brique.',atelierEye='01 / À vous de jouer',atelierTitle='Prenez de la hauteur.',atelierText='Levez la flèche, faites pivoter la tourelle et approchez-vous des détails. Chaque tenon compte.',sliders=['Flèche','Tourelle','Descente simulée','Vue éclatée'],sliderNotes=['Inclinaison du bras de levage','Rotation autour du châssis','Crochet LEGO 70644 · ficelle réf. x77ac50','Séparer les principaux assemblages'],switches=['Rotation auto','Crépuscule','Réinitialiser'],liveNote='Activez la 3D sur le modèle pour utiliser les commandes.',manualEye='02 / Brique après brique',manualTitle='Le plaisir commence au montage.',manualText='32 étapes illustrées, les références des pièces et le modèle à ouvrir dans un logiciel de construction.',stepLabel='Choisir une étape de construction',prev='Étape précédente',next='Étape suivante',stepOf='sur 32',manualPDF='Fascicule PDF · français',note='Chaque pièce du modèle possède une référence de catalogue documentée, y compris les rails, roues, vitrages et mécanismes. Le rendu simplifie leur géométrie : les assemblages, débattements et la stabilité ne sont pas validés physiquement. Le ciel, l’herbe et le ballast sont du décor. Les marquages sont des graphismes personnalisés, pas des pièces imprimées LEGO.',inventory='Voir toutes les pièces et leurs sources',table=['Référence LEGO','Pièce','Couleur','Quantité','Vérification'],csv='Télécharger l’inventaire CSV',ldraw='Télécharger le modèle LDraw',storyEye='03 / Une machine à part',storyTitle='Une vraie grue.<br>Une sacrée source d’inspiration.',story='Basée à Dijon-Perrigny, la grue Kirow de SNCF Réseau peut lever jusqu’à 150 tonnes. Cette interprétation en briques reprend sa livrée jaune, son châssis sur rail et sa silhouette caractéristique.',story2='Une façon de rendre hommage à celles et ceux qui veillent sur le réseau, une brique après l’autre.',source='Découvrir la vraie grue chez SNCF Réseau',real=['levage maximal','portée maximale','rotation réelle'],footer='KIROW SUR RAILS · ÉTUDE DE CONSTRUCTION',attribution='Une création de Nicolas Pieper',socialAlt='Kirow sur rails : la grue jaune en briques de Nicolas Pieper, dans l’univers Brick Atelier.',legal='Création indépendante. LEGO, KIROW et SNCF sont les marques de leurs propriétaires respectifs. Il ne s’agit pas d’un set officiel ni d’un modèle de levage certifié.',nojs='Le modèle et les documents restent accessibles. Activez JavaScript pour les commandes 3D.',downloadShot='Photographier la grue',viewHero='Vue générale',viewDetail='Détails de la cabine',viewSide='Vue de côté',initialStep='Assemblage d’ensemble',loading='Chargement de la 3D…',unavailable='Vue fixe · 3D indisponible sur cet appareil',ready='Faites glisser pour tourner · pincez pour zoomer',activeNote='Les commandes agissent sur la vue 3D ci-dessus.',busy='Chargement…'),
'en':dict(title='Kirow SNCF crane in LEGO bricks · Nicolas Pieper',description='The Kirow SNCF crane in LEGO bricks, a creation by Nicolas Pieper. Explore the 3D model, 32 illustrated building steps and documented part references.',skip='Skip to the model',nav=['The model','The controls','The building guide'],theme='Change page theme',crumb='Extraordinary builds',edition='Construction study · Kirow',heading=['KIROW','ON RAILS.'],subtitle='The SNCF railway crane, reimagined in bricks.',stage='RAILWAY COLLECTION',stageTitle='Power, one brick at a time.',start='Explore in 3D',stop='Leave 3D',status='Outdoor view · documented LEGO references',preview='Yellow brick model of the Kirow railway crane, with eight axles, outriggers and a long lifting boom.',stats=['inventoried elements','steps','part references'],intro='A railway giant, within reach. Its yellow silhouette, eight axles and long boom become a model you can explore from every angle.',primary='Take the controls',pdf='Open the building guide',small='A personal study with documented LEGO part references. Physical assembly and mechanical connections still need validation.',features=['Sourced parts and colours','360° 3D view','Illustrated guide included'],dedication='For those who get everything back on track.',dedicationSmall='Precision, one brick at a time.',atelierEye='01 / Your turn',atelierTitle='Reach a little higher.',atelierText='Raise the boom, rotate the turret and get closer to the details. Every stud counts.',sliders=['Boom','Turret','Simulated drop','Exploded view'],sliderNotes=['Lifting boom elevation','Rotation around the chassis','LEGO 70644 hook · string ref. x77ac50','Separate the main assemblies'],switches=['Auto rotation','Evening light','Reset'],liveNote='Activate 3D on the model to use the controls.',manualEye='02 / Brick by brick',manualTitle='The pleasure starts with the build.',manualText='32 illustrated steps, part references and a model to open in brick building software.',stepLabel='Choose an assembly step',prev='Previous step',next='Next step',stepOf='of 32',manualPDF='PDF guide · in French',note='Every model part has a documented catalogue reference, including tracks, wheels, glazing and mechanisms. The rendering simplifies their geometry: connections, motion ranges and stability have not been physically validated. Sky, grass and ballast are scenery. Markings are custom graphics, not printed LEGO pieces.',inventory='View all parts and their sources',table=['LEGO part ID','Piece','Colour','Quantity','Verification'],csv='Download inventory CSV',ldraw='Download LDraw model',storyEye='03 / A remarkable machine',storyTitle='A real crane.<br>A powerful inspiration.',story='Based at Dijon-Perrigny, the SNCF Réseau Kirow crane can lift up to 150 tonnes. This brick interpretation captures its yellow livery, rail chassis and distinctive silhouette.',story2='A tribute to the people who look after the railway, one brick at a time.',source='Discover the real crane at SNCF Réseau',real=['maximum lift','maximum reach','actual rotation'],footer='KIROW ON RAILS · CONSTRUCTION STUDY',attribution='A creation by Nicolas Pieper',socialAlt='Kirow on rails: Nicolas Pieper’s yellow brick crane, in the Brick Atelier world.',legal='An independent creation. LEGO, KIROW and SNCF are trademarks of their respective owners. This is neither an official set nor a certified lifting model.',nojs='The model and documents remain accessible. Enable JavaScript to use the 3D controls.',downloadShot='Take a picture of the crane',viewHero='Overall view',viewDetail='Cab details',viewSide='Side view',initialStep='Final assembly',loading='Loading 3D…',unavailable='Still view · 3D unavailable on this device',ready='Drag to rotate · pinch to zoom',activeNote='The controls change the 3D view above.',busy='Loading…')}
def metadata(lang, d, route):
 canonical='https://nicolaspieper.com'+route
 social='https://nicolaspieper.com/kirow/assets/kirow-social-'+lang+'.jpg?v=1'
 locale='fr_FR' if lang=='fr' else 'en_US'
 other_locale='en_US' if lang=='fr' else 'fr_FR'
 author={'@id':'https://nicolaspieper.com/#person'}
 image_id=canonical+'#primaryimage'
 model_id='https://nicolaspieper.com/kirow/#model'
 graph={'@context':'https://schema.org','@graph':[
  {'@type':'Person','@id':author['@id'],'name':'Nicolas Pieper','url':'https://nicolaspieper.com/'},
  {'@type':'ImageObject','@id':image_id,'url':social,'contentUrl':social,'width':1200,'height':630,'caption':d['socialAlt']},
  {'@type':'CreativeWork','@id':model_id,'name':'Kirow sur rails' if lang=='fr' else 'Kirow on rails','description':d['description']+' '+d['legal'],'creator':author,'author':author,'creditText':d['attribution'],'url':canonical,'image':{'@id':image_id},'inLanguage':lang,'isAccessibleForFree':True},
  {'@type':'WebPage','@id':canonical+'#webpage','url':canonical,'name':d['title'],'description':d['description'],'inLanguage':lang,'author':author,'mainEntity':{'@id':model_id},'primaryImageOfPage':{'@id':image_id},'isPartOf':{'@id':'https://nicolaspieper.com/#website'}}
 ]}
 tags=[
  ('name','robots','index, follow, max-image-preview:large'),
  ('name','description',d['description']),('name','author','Nicolas Pieper'),
  ('property','og:type','website'),('property','og:site_name','Nicolas Pieper'),
  ('property','og:title',d['title']),('property','og:description',d['description']),
  ('property','og:url',canonical),('property','og:image',social),('property','og:image:secure_url',social),
  ('property','og:image:type','image/jpeg'),('property','og:image:width','1200'),('property','og:image:height','630'),
  ('property','og:image:alt',d['socialAlt']),('property','og:locale',locale),('property','og:locale:alternate',other_locale),
  ('name','twitter:card','summary_large_image'),('name','twitter:title',d['title']),
  ('name','twitter:description',d['description']),('name','twitter:image',social),('name','twitter:image:alt',d['socialAlt'])
 ]
 rendered='\n'.join(f'<meta {attribute}="{key}" content="{escape(value,quote=True)}">' for attribute,key,value in tags)
 return f'<title>{escape(d["title"])}</title>\n'+rendered+'\n<script type="application/ld+json">'+json.dumps(graph,ensure_ascii=False).replace('<','\\u003c')+'</script>'

for lang,d in COPY.items():
 fr=lang=='fr';url='/kirow/' if fr else '/kirow/en/';other='/kirow/en/' if fr else '/kirow/';otherlang='en' if fr else 'fr'
 steps=DATA['steps'] if fr else [dict(number=i+1,title=t,description=EN_DESCS[i]) for i,t in enumerate(EN_TITLES)]
 references={s['number']:step_references(s['number'],lang) for s in steps}
 step_catalogue=''.join(f'<details class="assembly-step"><summary>{s["number"]:02d} · {escape(s["title"])}</summary><p>{escape(s["description"])}</p><div id="all-step-parts-{s["number"]}">{references[s["number"]]}</div></details>' for s in steps)
 static_title='Consulter les 32 étapes et leurs pièces' if fr else 'Read all 32 steps and their parts'
 refs_title='Pièces de cette étape' if fr else 'Parts for this step'
 catalogue_intro=('Les quantités incluent toutes les pièces du modèle, rails et mécanismes compris. Chaque lien documente la forme ou la couleur indiquée. Une référence LEGO est un identifiant de dessin ; un identifiant d’élément précise aussi sa couleur. Les suffixes de catalogue distinguent certaines variantes de moule. La présence en catalogue ne garantit ni le stock du vendeur ni la compatibilité du montage.' if fr else 'Quantities include all model parts, including tracks and mechanisms. Each link documents the stated shape or colour. A LEGO design ID identifies a part; an element ID also identifies its colour. Catalogue suffixes distinguish some mould variants. A catalogue listing does not guarantee seller stock or assembly compatibility.')
 verified_date=('Sources consultées le ' if fr else 'Sources checked on ')+EVIDENCE['checkedAt']+'.'
 search_label='Rechercher une référence, une pièce ou une couleur' if fr else 'Find a part ID, piece or colour'
 search_reset='Effacer' if fr else 'Clear'
 search_empty='Aucune référence ne correspond. Essayez un autre numéro, nom ou coloris.' if fr else 'No matching parts. Try another ID, name or colour.'
 options=''.join(f'<option value="{s["number"]}" data-description="{escape(s["description"],quote=True)}"'+(' selected' if s['number']==32 else '')+f'>{s["number"]:02d} · {escape(s["title"])}</option>' for s in steps)
 rows=[];csv_rows=[]
 for r in DATA['inventory']:
  variant=VARIANTS[r['key']];name=part_name(r['part'],lang);color=color_name(r['color'],lang)
  design=reference_text(variant,lang);catalogue=str(r['part']['id']);elements=', '.join(str(v) for v in variant.get('elementIds',[]))
  ids=f'<strong>{escape(design)}</strong>'
  if variant.get('designId') and catalogue!=str(variant['designId']):ids+=f'<small>Catalogue {escape(catalogue)}</small>'
  if not variant.get('designId'):ids+=f'<small>{"Identifiant de dessin non documenté" if fr else "Design ID not documented"}</small>'
  if elements:ids+=f'<small>{"Élément" if fr else "Element"} {escape(elements)}</small>'
  shape_ok=variant['shapeStatus']=='verified';color_ok=variant['colorStatus']=='verified'
  if shape_ok and color_ok:state='Pièce et couleur documentées' if fr else 'Part and colour documented'
  elif not shape_ok:state='Existence de la pièce à confirmer' if fr else 'Part existence unconfirmed'
  else:state='Couleur à confirmer' if fr else 'Colour unconfirmed'
  links=''.join(f'<a href="{escape(source["url"],quote=True)}" target="_blank" rel="noopener" title="{escape(source["title"],quote=True)}">{escape(source_label(source))}<span class="sr-only"> · {escape(design)} · {escape(color)}</span> ↗</a>' for source in variant['sources'])
  search=' '.join([design,catalogue,elements,name,color])
  rows.append(f'<tr id="piece-{escape(r["key"])}" data-search="{escape(search,quote=True)}"><th scope="row">{ids}</th><td>{escape(name)}</td><td>{escape(color)}</td><td class="part-quantity">{r["count"]}</td><td><span class="part-state{ " needs-check" if not (shape_ok and color_ok) else ""}">{state}</span><span class="part-sources">{links}</span></td></tr>')
  csv_rows.append([variant['designId'],catalogue,elements,name,color,r['count'],state,' | '.join(source['url'] for source in variant['sources']),EVIDENCE['checkedAt']])
 controls=''
 for i,(key,mini,maxi,value,unit) in enumerate([('elevation',8,65,24,'°'),('slew',-180,180,0,'°'),('hook',3,14,9,' tenons' if fr else ' studs'),('explode',0,100,0,'%')]):
  controls+=f'<div class="control"><label for="{key}">{d["sliders"][i]}<output id="{key}-value" for="{key}">{value}{unit}</output></label><input class="pose-input" id="{key}" type="range" min="{mini}" max="{maxi}" value="{value}" data-unit="{unit}" disabled><p>{d["sliderNotes"][i]}</p></div>'
 switches=''.join(f'<button type="button" data-toggle="{key}" aria-pressed="{str(False).lower()}" disabled>{icon(ic)}{d["switches"][i]}</button>' for i,(key,ic) in enumerate([('auto','rotate'),('night','moon')]))
 document=f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">{metadata(lang,d,url)}<meta name="theme-color" content="#ffcf00"><link rel="canonical" href="https://nicolaspieper.com{url}"><link rel="alternate" hreflang="fr" href="https://nicolaspieper.com/kirow/"><link rel="alternate" hreflang="en" href="https://nicolaspieper.com/kirow/en/"><link rel="alternate" hreflang="x-default" href="https://nicolaspieper.com/kirow/"><link rel="icon" href="/kirow/assets/favicon.svg"><link rel="stylesheet" href="/kirow/assets/kirow.css?v=3"><link rel="stylesheet" href="/kirow/assets/editorial.css?v=1"><link rel="stylesheet" href="/kirow/assets/share.css?v=1"><script defer src="/kirow/assets/share.js?v=1"></script><link rel="preload" as="font" href="/assets/fonts/inter-var-latin.woff2" type="font/woff2" crossorigin><link rel="preload" as="image" href="/kirow/assets/preview.jpg?v=3"><script type="module" src="/kirow/assets/app.js?v=3"></script></head>
<body><a class="skip" href="#modele">{d['skip']}</a>
<header class="masthead"><a class="brand" href="#modele" aria-label="Brick Atelier"><img class="brick-mark" src="/kirow/assets/brick-atelier-mark.svg" width="49" height="49" alt=""><span>BRICK<br>ATELIER</span></a><nav aria-label="{'Navigation de la page' if fr else 'Page navigation'}">{''.join(f'<a href="#{anchor}">{label}</a>' for anchor,label in zip(['modele','commandes','fascicule'],d['nav']))}</nav><div class="header-tools"><a href="{other}" lang="{otherlang}" hreflang="{otherlang}" aria-label="{'Read in English' if fr else 'Lire en français'}">{otherlang.upper()}</a><button id="theme" type="button" aria-label="{d['theme']}" aria-pressed="false">{icon('moon')}</button></div></header>
<main><div class="breadcrumb"><span>BRICK ATELIER</span><span aria-hidden="true">/</span><span>{d['crumb']}</span><span aria-hidden="true">/</span><b>KIROW</b></div>
<section class="product" id="modele" aria-labelledby="product-title"><div class="showcase" id="showcase"><div class="stage-label"><span>{d['stage']}</span><strong>{d['stageTitle']}</strong></div><div class="set-watermark" aria-hidden="true">KIROW</div><div class="visual"><img class="preview" id="preview" src="/kirow/assets/preview.jpg?v=3" width="1600" height="1100" alt="{d['preview']}" fetchpriority="high"><div class="scene-host" id="scene-host"></div></div><button type="button" class="start-3d" id="start-3d" hidden>{icon('play')} {d['start']}</button><button type="button" class="touch-exit" id="touch-exit" hidden>{d['stop']}</button><div class="stage-bottom"><span class="stage-status" id="render-status" role="status">{d['status']}</span><div class="view-tools"><button type="button" data-view="hero" aria-label="{d['viewHero']}" title="{d['viewHero']}" disabled>{icon('cube')}</button><button type="button" data-view="detail" aria-label="{d['viewDetail']}" title="{d['viewDetail']}" disabled>{icon('camera')}</button><button type="button" id="capture" aria-label="{d['downloadShot']}" title="{d['downloadShot']}" disabled>{icon('download')}</button></div></div></div>
<div class="product-copy"><span class="edition-tag">{d['edition']}</span><h1 id="product-title">{''.join('<span>'+x+'</span>' for x in d['heading'])}</h1><p class="product-subtitle">{d['subtitle']}</p><div class="brand-pair"><img class="kirow-logo" src="/kirow/assets/kirow.svg" width="106" height="58" alt="KIROW"><i aria-hidden="true"></i><img class="sncf-logo" src="/kirow/assets/sncf.svg" width="69" height="36" alt="SNCF"></div><dl class="stats">{''.join(f'<div><dt>{n}</dt><dd>{label}</dd></div>' for n,label in zip([str(TOTAL),str(len(steps)),str(REFERENCE_COUNT)],d['stats']))}</dl><p class="intro">{d['intro']}</p><div class="product-actions"><a class="button button-primary" id="take-controls" href="#commandes">{d['primary']}{icon('arrow')}</a><a class="button button-outline" href="/kirow/assets/kirow-fascicule.pdf?v=3" target="_blank" rel="noopener">{icon('book')}{d['pdf']}</a><p class="smallprint">{d['small']}</p><a class="quick-share" href="#partager">{'Partager cette création' if fr else 'Share this creation'} ↗</a></div></div></section>
<div class="beneath">{''.join(f'<span>{icon(ic)}{label}</span>' for ic,label in zip(['cube','rotate','book'],d['features']))}</div><noscript><p class="noscript">{d['nojs']}</p></noscript><div class="divider-strip"><p>{d['dedication']}</p><span>{d['dedicationSmall']}</span></div>
<section class="section" id="commandes" aria-labelledby="control-title"><div class="section-header"><div><p class="eyebrow">{d['atelierEye']}</p><h2 id="control-title">{d['atelierTitle']}</h2></div><p>{d['atelierText']}</p></div><div class="control-workspace"><div id="control-view" class="control-view"><img class="preview" src="/kirow/assets/preview.jpg?v=3" alt="{d['preview']}" width="1600" height="1100" loading="lazy"><button type="button" id="activate-controls" class="start-3d" hidden>{icon('play')} {d['start']}</button></div><div class="control-grid">{controls}</div></div><p id="control-status" class="control-status" aria-live="polite">{d['status']}</p><div class="switches">{switches}<button id="reset" type="button" disabled>{d['switches'][2]}</button><span class="live-note" id="live-note">{d['liveNote']}</span></div>{render_guide(lang)}</section>
<div class="manual-wrap"><section class="section" id="fascicule" aria-labelledby="manual-title"><div class="section-header"><div><p class="eyebrow">{d['manualEye']}</p><h2 id="manual-title">{d['manualTitle']}</h2></div><p>{d['manualText']}</p></div><div class="manual-layout"><div class="manual-preview"><img id="step-image" src="/kirow/assets/manual/step-32.jpg?v=3" alt="{escape(steps[-1]['title'])}" width="1200" height="900" loading="lazy"><span class="step-chip"><b id="step-number">32</b>{d['stepOf']}</span></div><div class="manual-copy"><label class="eyebrow" for="step-select">{d['stepLabel']}</label><select class="step-select" id="step-select" disabled>{options}</select><h3 id="step-title">{steps[-1]['title']}</h3><p id="step-description">{steps[-1]['description']}</p><p class="parts-label">{refs_title}</p><div id="step-parts">{references[steps[-1]['number']]}</div><div class="step-actions"><button id="previous-step" type="button" disabled aria-label="{d['prev']}">←</button><button id="next-step" type="button" aria-label="{d['next']}" disabled>→</button><a class="button button-outline" href="/kirow/assets/kirow-fascicule.pdf?v=3" target="_blank" rel="noopener">{icon('download')}{d['manualPDF']}</a></div><p class="build-note">{d['note']}</p></div></div><details class="complete-guide"><summary>{static_title}</summary>{step_catalogue}</details><details class="inventory" id="inventory"><summary>{d['inventory']} · {TOTAL}</summary><p class="catalogue-note">{catalogue_intro}</p><p class="catalogue-date">{verified_date}</p><div class="inventory-search" id="inventory-search" hidden><label for="part-search">{search_label}</label><div><input id="part-search" type="search" autocomplete="off" aria-controls="inventory-table"><button id="clear-search" type="button">{search_reset}</button></div><p id="search-status" role="status"></p></div><div class="table-scroll" role="region" aria-label="{d['inventory']}" tabindex="0"><table id="inventory-table"><thead><tr>{''.join('<th scope="col">'+x+'</th>' for x in d['table'])}</tr></thead><tbody>{''.join(rows)}</tbody></table></div><p id="search-empty" class="search-empty" hidden>{search_empty}</p><div class="inventory-links"><a href="/kirow/assets/inventory-{lang}.csv" download>{d['csv']}</a><a href="/kirow/assets/kirow-etude.ldr" download>{d['ldraw']}</a></div></details></section></div>
<section class="section story" id="inspiration" aria-labelledby="story-title"><div><p class="eyebrow">{d['storyEye']}</p><h2 id="story-title">{d['storyTitle']}</h2></div><div><p>{d['story']}</p><p>{d['story2']}</p><p><a href="https://www.sncf-reseau.com/fr/cp/bourgogne-franche-comte/grue-kirow-unique-en-france-en-action-dijon" target="_blank" rel="noopener">{d['source']} ↗</a></p><div class="real-stats">{''.join(f'<div><strong>{n}</strong><span>{label}</span></div>' for n,label in zip(['150 t','23 m','360°'],d['real']))}</div></div></section>
{render_packaging(lang)}
{render_share(lang)}
</main><footer><div><strong>{d['footer']}</strong><p class="creator-credit">{d['attribution']} · <a href="https://nicolaspieper.com/" rel="author">NicolasPieper.com</a></p><p>{d['legal']}</p></div><span>BRICK ATELIER · 2026</span></footer><script type="application/json" id="ui-messages">{json.dumps({**{k:d[k] for k in ['loading','unavailable','ready','activeNote','busy','start','status']},'searchCount': '{visible} / {total} références affichées' if fr else '{visible} / {total} part variants shown'},ensure_ascii=False)}</script></body></html>'''
 (ROOT/('index.html' if fr else 'en/index.html')).write_text(document)
 with (ROOT/f'assets/inventory-{lang}.csv').open('w',newline='',encoding='utf-8-sig') as f:
  w=csv.writer(f,lineterminator="\n")
  w.writerow(['Référence LEGO','Référence catalogue','Identifiant élément','Pièce','Couleur','Quantité','Vérification','Sources','Date de vérification'] if fr else ['LEGO design ID','Catalogue ID','Element ID','Piece','Colour','Quantity','Verification','Sources','Checked on'])
  w.writerows(csv_rows)
print('Generated FR/EN Kirow pages and sourced inventories.')
