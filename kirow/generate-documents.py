"""Build the French PDF and record provenance of all published model assets."""
from pathlib import Path
from collections import Counter
from hashlib import sha256
from html import escape
import json
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / 'src/blueprint-data.json').read_text())
CATALOG = DATA['catalog']
EVIDENCE = {v['key']: v for v in DATA['evidence']['variants']}
render_manifest=json.loads((ROOT/'assets/render-manifest.json').read_text())
for category in ('sources','outputs'):
    for relative,expected in render_manifest[category].items():
        if sha256((ROOT/relative).read_bytes()).hexdigest()!=expected:
            raise ValueError('Regenerate scene assets before the PDF: '+relative)
TOTAL = sum(r['count'] for r in DATA['inventory'])
YELLOW, INK, MUTED = colors.HexColor('#f4c428'), colors.HexColor('#242824'), colors.HexColor('#555b55')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle('CoverTitle',fontName='Helvetica-Bold',fontSize=44,leading=47,textColor=INK,spaceAfter=8))
styles.add(ParagraphStyle('KirowTitle',fontName='Helvetica-Bold',fontSize=23,leading=27,textColor=INK,spaceAfter=9))
styles.add(ParagraphStyle('KirowBody',fontName='Helvetica',fontSize=10,leading=14,textColor=INK,spaceAfter=9))
styles.add(ParagraphStyle('KirowSmall',fontName='Helvetica',fontSize=8.3,leading=11,textColor=MUTED,spaceAfter=6))
styles.add(ParagraphStyle('KirowCell',fontName='Helvetica',fontSize=8.2,leading=10.7,textColor=INK))
styles.add(ParagraphStyle('KirowHead',fontName='Helvetica-Bold',fontSize=8.2,leading=10.7,textColor=INK))

def p(text, style='KirowBody'):
    return Paragraph(escape(str(text)).replace('\n','<br/>'), styles[style])

def rows_for_step(step):
    counts=Counter()
    for piece in DATA['bricks']+DATA['specials']:
        if piece['step']==step:
            counts[(piece['part'],piece['color'])]+=piece.get('quantity',1)
    return [{'key':part+'-'+color,'part':CATALOG[part],'color':color,'count':count}
            for (part,color),count in counts.items()]

def inventory_table(rows, with_sources=False):
    headers=['Référence exacte','Pièce et couleur','Qté']+(['Preuve catalogue'] if with_sources else [])
    cells=[[p(x,'KirowHead') for x in headers]]
    for row in rows:
        part=row['part']; evidence=EVIDENCE[row['key']]
        reference=part['id']
        if part.get('referenceType')!='design':
            reference+='\nID catalogue'
        label=part['name']+'\n'+DATA['colors'][row['color']]['name']
        line=[p(reference,'KirowCell'),p(label,'KirowCell'),p(row['count'],'KirowCell')]
        if with_sources:
            source=evidence['sources'][0]
            label=source['title']
            line.append(Paragraph('<link href="'+escape(source['url'],quote=True)+'" color="#315143">'+escape(label)+'</link>',styles['KirowCell']))
        cells.append(line)
    widths=[31*mm,124*mm,17*mm] if not with_sources else [29*mm,79*mm,12*mm,52*mm]
    table=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),YELLOW),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LINEBELOW',(0,1),(-1,-1),.35,colors.HexColor('#d8dbd6')),
    ]))
    return table

def page_frame(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(YELLOW);canvas.rect(0,A4[1]-5*mm,A4[0],5*mm,fill=1,stroke=0)
    canvas.setFont('Helvetica-Bold',8);canvas.setFillColor(INK)
    canvas.drawString(19*mm,A4[1]-14*mm,'KIROW / ATELIER EN BRIQUES')
    canvas.setFont('Helvetica',8);canvas.setFillColor(MUTED)
    canvas.drawString(19*mm,12*mm,'Étude numérique · Assemblages et stabilité à valider sur prototype')
    canvas.drawRightString(A4[0]-19*mm,12*mm,str(doc.page))
    canvas.restoreState()

story=[Spacer(1,5*mm),p('KIROW','CoverTitle'),p('Sur rails, brique par brique.','KirowTitle'),
       p(f'{TOTAL} éléments référencés · 32 étapes · Inventaire sourcé'),
       Image(str(ROOT/'assets/manual/preview.jpg'),width=172*mm,height=129*mm),Spacer(1,5*mm),
       p(DATA['note']),
       p('Les numéros de moule LEGO sont distingués des variantes et assemblages du catalogue BrickLink. La présence au catalogue ne garantit ni stock ni compatibilité de l’assemblage. Les couleurs sont vérifiées séparément.','KirowSmall'),
       p('Les marquages KIROW, SNCF et « 150 t » sont personnalisés, sans référence LEGO. Le ciel, l’herbe et le ballast sont le décor de la scène, hors inventaire.','KirowSmall'),
       p('Vérification des références : '+DATA['evidence']['checkedAt']+'. Les liens du tableau final ouvrent les preuves de chaque variante.','KirowSmall'),PageBreak()]

for step in DATA['steps']:
    number=step['number']
    rows=rows_for_step(number)
    image_height=(112 if len(rows)>6 else 129)*mm
    story += [p(f'{number:02d} / 32','KirowSmall'),p(step['title'],'KirowTitle'),p(step['description']),
              Image(str(ROOT/f'assets/manual/step-{number:02d}.jpg'),width=image_height*4/3,height=image_height),Spacer(1,3*mm)]
    if rows: story.append(inventory_table(rows))
    else: story.append(p('Aucune pièce supplémentaire à cette étape.','KirowSmall'))
    story.append(PageBreak())

story += [p('Inventaire complet','KirowTitle'),p(f'{TOTAL} éléments · {len(DATA["inventory"])} variantes de pièce et couleur'),
          p('Références et couleurs vérifiées le '+DATA['evidence']['checkedAt']+'. Les quantités décrivent cette maquette numérique.','KirowSmall'),
          inventory_table(DATA['inventory'],with_sources=True),Spacer(1,5*mm),p(DATA['note'],'KirowSmall')]

destination=ROOT/'assets/kirow-fascicule.pdf'
doc=SimpleDocTemplate(str(destination),pagesize=A4,rightMargin=19*mm,leftMargin=19*mm,topMargin=22*mm,bottomMargin=22*mm,
                      title='Kirow sur rails · Fascicule de construction',author='Nicolas Pieper')
doc.build(story,onFirstPage=page_frame,onLaterPages=page_frame)

# A source change must not silently leave an obsolete PDF, preview or LDraw file.
sources=list(render_manifest['sources'])+['src/parts-evidence.json','generate-documents.py','assets/render-manifest.json']
outputs=['assets/preview.jpg','assets/manual/preview.jpg','assets/kirow-fascicule.pdf','assets/kirow-etude.ldr',
         *[f'assets/manual/step-{n:02d}.jpg' for n in range(1,33)]]
manifest={'sources':{name:sha256((ROOT/name).read_bytes()).hexdigest() for name in sources},
          'outputs':{name:sha256((ROOT/name).read_bytes()).hexdigest() for name in outputs}}
(ROOT/'assets/model-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Generated French PDF: {TOTAL} elements, 32 steps, {len(DATA["inventory"])} sourced variants.')
