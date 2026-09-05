#!/usr/bin/env python3
"""Render the bilingual collection from its reviewed, versioned catalog."""
from pathlib import Path
from html import escape
import json
import sys

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'data/objects.json').read_text())
ORIGIN = 'https://nicolaspieper.com'
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10"/></svg>'
PLUS = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2v12M2 8h12"/></svg>'
COPY = {
 'fr': dict(title='Objets choisis.',seo='Objets choisis et envies · Nicolas Pieper',description='Les objets que Nicolas Pieper possède et adore, et ceux qu’il aimerait acheter. Design, musique, cuisine et technologie dans une collection personnelle.',intro='Des objets que j’ai, d’autres que j’aimerais avoir. Tous ont quelque chose qui m’inspire.',signature='Une collection personnelle de Nicolas Pieper',all='Tout voir',owned='Chez moi',wishlist='Mes envies',owned_note='Les objets que j’ai et que j’adore.',wishlist_note='Ceux que j’aimerais m’offrir.',objects='objets',nav='Navigation principale',overview='Présentation',work='Réalisations',projects='Projets',blog='Blog',contact='Contact',page='Objets',skip='Aller au contenu',close='Fermer',afftitle='Quelques mots sur les liens.',aff='En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.',affshort='Liens affiliés Amazon.fr. Je peux percevoir une commission sur les achats éligibles.',affnote='Les fiches proposent le modèle recherché ou des pistes proches, clairement indiquées. Prix, disponibilité et variantes sont à vérifier sur Amazon.fr.',about_title='Une affaire de goût.',about='Cette page réunit mes objets et mes envies. Les alternatives permettent de prolonger la découverte ; elles ne constituent pas des objets que je possède ou que j’ai testés.',source='Voir la référence chez la marque',links='À retrouver sur Amazon.fr',exact='Le modèle · vérifier la configuration',alternative='Alternative · modèle différent',search='Recherche Amazon · vérifier les résultats',newtab=' (nouvel onglet)',wish='Un jour, peut-être.',wish_caption='Un souhait, sans visuel officiel confirmé.',photo='Photographie',illustration='Visuel du modèle. La configuration photographiée peut différer de la mienne.',collection='Collection personnelle',filter='Filtrer la collection',breadcrumb='Fil d’Ariane'),
 'en': dict(title='Objects, chosen.',seo='Favourite objects and wishlist · Nicolas Pieper',description='Objects Nicolas Pieper owns and loves, and the ones he would like to buy. Design, music, cooking and technology in a personal collection.',intro='Some I own. Some I would like to. All of them have something that inspires me.',signature='A personal collection by Nicolas Pieper',all='View all',owned='At home',wishlist='My wishlist',owned_note='The things I own and love.',wishlist_note='The things I would like to own.',objects='objects',nav='Main navigation',overview='Overview',work='Work',projects='Projects',blog='Blog',contact='Contact',page='Objects',skip='Skip to content',close='Close',afftitle='A word about the links.',aff='As an Amazon Associate I earn from qualifying purchases.',affshort='Amazon.fr affiliate links. I may earn a commission on qualifying purchases.',affnote='Product details link to the model or clearly identified related options. Check prices, availability and configurations on Amazon.fr.',about_title='A matter of taste.',about='This page brings together my belongings and my wishlist. The alternatives are a way to explore further; they are not things I own or have tested.',source='View the reference on the brand’s website',links='Explore on Amazon.fr',exact='The model · check the configuration',alternative='Alternative · a different model',search='Amazon search · check the results',newtab=' (opens in a new tab)',wish='One day, perhaps.',wish_caption='A wish, with no confirmed official image.',photo='Photography',illustration='Model photograph. The pictured configuration may differ from mine.',collection='Personal collection',filter='Filter the collection',breadcrumb='Breadcrumb')
}

def e(value): return escape(str(value), quote=True)

def photo(obj,lang,index=9):
 t=COPY[lang]
 if obj['image'].get('src'):
  img=obj['image']
  return f'<div class="object-photo"><img src="{e(img["src"])}" width="{img["width"]}" height="{img["height"]}" alt="{e(img["alt"][lang])}" loading="{"eager" if index < 3 else "lazy"}" decoding="async"><span class="object-open">{PLUS}</span></div>'
 return f'<div class="object-photo object-photo--wish"><span class="wish-word">{t["wish"]}</span><span class="wish-rule" aria-hidden="true"></span><span class="wish-caption">{t["wish_caption"]}</span><span class="object-open">{PLUS}</span></div>'

def product(obj,lang,index):
 t=COPY[lang]; links=[]
 for link in obj['links']:
  label=link.get('label',{}).get(lang,link['name'])
  extra=link.get('note',{}).get(lang,'')
  relation=link.get('relation','')
  kind_label=t[link['kind']]
  if relation.startswith('same_') and link['kind']!='exact':
   kind_label='Même modèle ou famille · variante à vérifier' if lang=='fr' else 'Same model or family · check the variant'
  elif link['kind']=='search' and relation.startswith('related'):
   kind_label='Alternative · recherche Amazon' if lang=='fr' else 'Alternative · Amazon search'
  elif link['kind']=='search':
   kind_label='Modèle recherché · résultats à vérifier' if lang=='fr' else 'Requested model · check the results'
  links.append(f'<a class="object-link" href="{e(link["url"])}" target="_blank" rel="sponsored external noopener" data-affiliate="amazon" data-link-kind="{e(link["kind"])}"><strong>{e(label)}</strong><span>{kind_label}{": "+e(extra) if extra else ""}</span>{ARROW}<span class="sr-only">{t["newtab"]}</span></a>')
 img=obj['image']; credit=''
 if img.get('src'):
  credit=f'<p class="object-credit">{t["photo"]} : {e(img["credit"])}.'
  if img.get('match')!='exact': credit+=' '+e(img.get('caption',{}).get(lang,t['illustration']))
  credit+='</p>'
 return f'''<article class="object-card" id="{obj['id']}" data-object-id="{obj['id']}">
 <details><summary>{photo(obj,lang,index)}<span class="object-brand">{e(obj['brand'])}</span><h3>{e(obj['name'])}</h3><span class="object-variant">{e(obj['variant'][lang])}</span></summary>
 <div class="object-detail"><div class="object-detail-media">{photo(obj,lang)}{credit}</div><div class="object-detail-copy"><span class="object-state">{t[obj['status']]}</span><p class="object-brand">{e(obj['brand'])}</p><h2>{e(obj['name'])}</h2><p>{e(obj['variant'][lang])}</p><p>{e(obj['note'][lang])}</p><div class="object-inline-credit">{credit}</div><a class="object-source" href="{e(obj['source'])}" target="_blank" rel="external noopener">{t['source']}<span class="sr-only">{t['newtab']}</span></a><div class="object-links"><h3>{t['links']}</h3>{''.join(links)}</div><p class="object-disclosure">{t['affshort']}</p></div></div>
 </details></article>'''

def render(lang):
 t=COPY[lang]; base='/fr/' if lang=='fr' else '/'; route=base+'objects/'; url=ORIGIN+route
 objs=DATA['objects']
 schema={'@context':'https://schema.org','@graph':[
 {'@type':'CollectionPage','@id':url+'#page','url':url,'name':t['seo'],'description':t['description'],'inLanguage':lang,'about':{'@id':ORIGIN+'/#person'},'isPartOf':{'@id':ORIGIN+'/#website'},'mainEntity':{'@id':url+'#objects-list'}},
 {'@type':'ItemList','@id':url+'#objects-list','name':t['collection'],'numberOfItems':len(objs),'itemListElement':[{'@type':'ListItem','position':i+1,'name':x['brand']+' '+x['name'],'url':url+'#'+x['id']} for i,x in enumerate(objs)]},
 {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':t['overview'],'item':ORIGIN+base},{'@type':'ListItem','position':2,'name':t['page'],'item':url}]}]}
 head=f'''<!doctype html>
<!-- Generated by scripts/generate-objects.py from data/objects.json. -->
<html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t['seo']}</title><meta name="description" content="{e(t['description'])}"><meta name="author" content="Nicolas Pieper"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}"><link rel="alternate" hreflang="en" href="{ORIGIN}/objects/"><link rel="alternate" hreflang="fr" href="{ORIGIN}/fr/objects/"><link rel="alternate" hreflang="x-default" href="{ORIGIN}/objects/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Nicolas Pieper"><meta property="og:locale" content="{'fr_FR' if lang=='fr' else 'en_US'}"><meta property="og:locale:alternate" content="{'en_US' if lang=='fr' else 'fr_FR'}"><meta property="og:title" content="{t['seo']}"><meta property="og:description" content="{e(t['description'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{ORIGIN}/assets/img/objects/og-objects-{lang}.png?v=1"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="{t['title']} {t['signature']}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t['seo']}"><meta name="twitter:description" content="{e(t['description'])}"><meta name="twitter:image" content="{ORIGIN}/assets/img/objects/og-objects-{lang}.png?v=1"><meta name="twitter:image:alt" content="{t['title']} {t['signature']}">
<link rel="icon" type="image/png" href="/assets/img/favicon.png"><link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png"><meta name="theme-color" content="#FAF9F5">
<link rel="preload" href="/assets/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/sourceserif4-var-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=20260905-objects"><link rel="stylesheet" href="/assets/css/objects.css?v=1">
<script>(function(){{try{{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='dark'?'#262624':'#FAF9F5';}}catch(e){{}}}})()</script>
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False,separators=(',',':'))}</script>
</head><body class="page-objects"><a class="skip-link" href="#main">{t['skip']}</a>
'''
 nav=''.join(f'<li><a href="{base+path}"'+(' aria-current="page"' if path=='objects/' else '')+f'>{t[label]}</a></li>' for path,label in [('', 'overview'),('work/','work'),('projects/','projects'),('objects/','page'),('blog/','blog'),('cv/','cv')] if label!='cv')
 nav+=f'<li><a href="{base}cv/">CV</a></li>'
 # CV uses the literal label in both languages.
 body=f'''<div class="backdrop" id="backdrop"></div><aside class="sidebar" id="sidebar" aria-label="{t['nav']}"><nav aria-label="{t['nav']}"><div class="side-group"><p class="side-title">Pages</p><ul>{nav}</ul></div></nav></aside>
<main class="collection" id="main"><nav class="breadcrumb sr-only" aria-label="{t['breadcrumb']}"><a href="{base}">nicolaspieper.com</a><span class="sep">/</span><span aria-current="page">objects</span></nav>
<header class="collection-intro"><h1>{t['title']}</h1><p>{t['intro']}</p><p class="collection-signature">{t['signature']}</p></header>
<div class="collection-controls"><div class="collection-filters" role="group" aria-label="{t['filter']}" hidden>{''.join(f'<button type="button" data-filter="{key}" aria-pressed="{str(key=="all").lower()}">{t[key]}</button>' for key in ['all','owned','wishlist'])}</div><span class="collection-count" role="status" aria-live="polite" data-label="{t['objects']}">{len(objs)} {t['objects']}</span></div>'''
 for status in ['owned','wishlist']:
  selected=[(i,x) for i,x in enumerate(objs) if x['status']==status]
  body+=f'<section class="collection-section" id="{status}" data-collection="{status}" aria-labelledby="{status}-title"><header><h2 id="{status}-title">{t[status]}</h2><p>{t[status+"_note"]}</p></header><div class="object-grid">'+''.join(product(x,lang,i) for i,x in selected)+'</div></section>'
 body+=f'''<section class="collection-note" id="about-collection" aria-label="{t['collection']}"><div><h2>{t['about_title']}</h2><p>{t['about']}</p></div><div><h2>{t['afftitle']}</h2><p>{t['aff']}</p><p>{t['affnote']}</p></div></section></main>
<dialog class="object-dialog" id="objectDialog"><button class="object-close" type="button" autofocus>{t['close']}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13"/></svg></button><div id="objectDialogContent"></div></dialog>'''
 header_fragment, _, footer_fragment = (ROOT/f'scripts/templates/objects-{lang}.html').read_text().partition('{{BODY}}')
 body = body.replace('</main>', footer_fragment + '</main>')
 shell = header_fragment + body
 return head+shell+'\n<script src="/assets/js/site.js?v=20260905-objects" defer></script><script src="/assets/js/objects.js?v=1" defer></script>\n</body></html>\n'

failed=False
for lang,path in [('en','objects/index.html'),('fr','fr/objects/index.html')]:
 html=render(lang); target=ROOT/path
 if '--check' in sys.argv:
  if not target.exists() or target.read_text()!=html:
   print(f'Out of date: {path}'); failed=True
 else:
  target.parent.mkdir(parents=True,exist_ok=True);target.write_text(html);print(f'Generated {path}')
if failed: sys.exit(1)
