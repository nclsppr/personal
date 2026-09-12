"""Original artwork and static, optional model-reading advice in both languages."""

def render_guide(lang):
    fr = lang == 'fr'
    title = 'Un coup de main à l’atelier ?' if fr else 'A helping hand in the workshop?'
    intro = ('Commencez par tourner autour de la grue, puis passez aux commandes. La vue éclatée permet de repérer les grands assemblages.' if fr else
             'Start by looking around the crane, then try the controls. The exploded view helps you identify the main assemblies.')
    label = 'Les conseils du guide' if fr else 'The guide’s tips'
    tips = ([
        'Sur mobile, touchez « Explorer en 3D », puis faites glisser un doigt pour tourner et pincez pour zoomer.',
        'Ramenez « Vue éclatée » à 0 % pour retrouver le modèle assemblé. « Réinitialiser » rétablit la pose de départ.',
        'Dans le fascicule, choisissez une étape et suivez ses références de pièces. Les 32 étapes sont aussi lisibles dans la liste complète.',
        'Avant un montage réel, vérifiez les connexions et la stabilité : cette maquette reste une étude numérique.'
    ] if fr else [
        'On mobile, tap “Explore in 3D”, then drag one finger to rotate and pinch to zoom.',
        'Return “Exploded view” to 0% for the assembled model. “Reset” restores the starting pose.',
        'In the building guide, choose a step and follow its part references. All 32 steps are also readable in the full list.',
        'Before a physical build, check connections and stability: this model remains a digital study.'
    ])
    caption = ('Personnage fictif de l’atelier, inspiré des agents SNCF. Illustration hors inventaire.' if fr else
               'Fictional workshop character inspired by SNCF railway staff. Illustration outside the parts inventory.')
    return f'''<aside class="atelier-guide" aria-labelledby="guide-title">
<img src="/kirow/assets/railway-guide.webp" width="320" height="320" alt="" loading="lazy">
<div><h3 id="guide-title">{title}</h3><p>{intro}</p><details><summary>{label}</summary><ul>{''.join('<li>'+tip+'</li>' for tip in tips)}</ul></details><p class="guide-caption">{caption}</p></div></aside>'''


def render_packaging(lang):
    fr = lang == 'fr'
    eye = '04 / L’imaginaire prend forme' if fr else '04 / Bringing the idea to life'
    title = 'Et si la grue avait son coffret ?' if fr else 'What if the crane had its own box?'
    copy = ('Une boîte de collection imaginée pour cette création de Nicolas Pieper. Un jaune lumineux, du bleu ciel, la brique rouge et blanche de Brick Atelier, les logos SNCF et KIROW et notre guide en gilet orange entourent la maquette.' if fr else
            'A collector’s box imagined for this creation by Nicolas Pieper. Bright yellow, sky blue, Brick Atelier’s red and white brick, the SNCF and KIROW logos and our guide in an orange vest frame the model.')
    note = ('Illustration de concept générée par IA à partir du rendu 3D. Le personnage en gilet orange est une illustration hors inventaire. Aucun coffret commercialisé, aucune affiliation à LEGO, KIROW ou SNCF.' if fr else
            'AI-generated concept illustration based on the 3D rendering. The character in an orange vest is an illustration outside the parts inventory. No box is offered for sale; no affiliation with LEGO, KIROW or SNCF.')
    label = 'Concept non officiel' if fr else 'Unofficial concept'
    alt = ('Concept de coffret jaune et bleu ciel avec la grue Kirow en briques, le logo Brick Atelier rouge et blanc, les logos SNCF et KIROW et un guide en gilet orange.' if fr else
           'Bright yellow and sky blue box concept with the Kirow brick crane, the red and white Brick Atelier logo, SNCF and KIROW logos and a guide in an orange vest.')
    link = 'Voir le coffret en grand' if fr else 'View the box in full size'
    return f'''<section class="section packaging" id="coffret" aria-labelledby="packaging-title"><figure><a href="/kirow/assets/kirow-box.jpg?v=2" aria-label="{link}"><img src="/kirow/assets/kirow-box.webp?v=2" width="1200" height="800" alt="{alt}" loading="lazy"></a><figcaption>{note}</figcaption></figure><div class="packaging-copy"><p class="eyebrow">{eye}</p><h2 id="packaging-title">{title}</h2><p>{copy}</p><p><span class="concept-label">{label}</span></p><a class="packaging-link" href="/kirow/assets/kirow-box.jpg?v=2">{link} ↗</a></div></section>'''
