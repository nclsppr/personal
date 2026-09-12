"""Static, bilingual sharing links with optional native browser enhancements."""

from html import escape
from urllib.parse import quote, urlencode


COPY = {
    "fr": {
        "eyebrow": "À faire circuler",
        "heading": "Les belles constructions se partagent.",
        "intro": "Un passionné de trains, une famille de bâtisseurs, un ami curieux : faites voyager la Kirow.",
        "title": "Kirow sur rails · Une création de Nicolas Pieper",
        "text": "La grue SNCF Kirow réimaginée en briques par Nicolas Pieper. Explorez le modèle 3D et le fascicule illustré.",
        "native": "Partager…",
        "copy": "Copier le lien",
        "email": "Email",
        "sms": "SMS",
        "x": "Partager sur X",
        "new_tab": "nouvel onglet",
        "address": "Le lien à partager",
        "manual": "Vous pouvez aussi sélectionner cette adresse et la copier.",
        "instagram": "Le visuel pour Instagram",
        "download": "Télécharger le visuel",
        "image_alt": "Visuel de la grue Kirow en briques, prêt à partager au format carré.",
        "instagram_help": "Ajoutez ce visuel à votre publication ou à votre story. Dans une story, collez cette adresse dans un sticker Lien pour ouvrir le modèle.",
        "image_format": "Image JPG · format carré",
        "copy_done": "Lien copié. Vous pouvez le coller dans votre message.",
        "copy_failed": "La copie automatique est indisponible. Sélectionnez et copiez l’adresse ci-dessous.",
        "share_opening": "Ouverture du partage…",
        "share_opened": "La fenêtre de partage a été ouverte.",
        "share_cancelled": "Partage interrompu. Les autres moyens de partage restent disponibles.",
        "share_failed": "Ce partage est indisponible ici. Utilisez les liens proposés ou copiez l’adresse ci-dessous.",
    },
    "en": {
        "eyebrow": "Pass it on",
        "heading": "Great builds are made to be shared.",
        "intro": "A train enthusiast, a family of builders, a curious friend: let the Kirow travel a little further.",
        "title": "Kirow on rails · A creation by Nicolas Pieper",
        "text": "The SNCF Kirow crane reimagined in bricks by Nicolas Pieper. Explore the 3D model and illustrated building guide.",
        "native": "Share…",
        "copy": "Copy link",
        "email": "Email",
        "sms": "SMS",
        "x": "Share on X",
        "new_tab": "new tab",
        "address": "The link to share",
        "manual": "You can also select this address and copy it.",
        "instagram": "The image for Instagram",
        "download": "Download the image",
        "image_alt": "Square sharing image of the Kirow brick crane.",
        "instagram_help": "Add this image to your post or story. In a story, paste this address into a Link sticker to open the model.",
        "image_format": "JPG image · square format",
        "copy_done": "Link copied. You can paste it into your message.",
        "copy_failed": "Automatic copying is unavailable. Select and copy the address below.",
        "share_opening": "Opening sharing…",
        "share_opened": "The sharing window has been opened.",
        "share_cancelled": "Sharing stopped. The other sharing options are still available.",
        "share_failed": "Sharing is unavailable here. Use the links provided or copy the address below.",
    },
}


def render_share(lang):
    """Return one complete share section for the French or English Kirow page."""
    d = COPY[lang]
    url = "https://nicolaspieper.com/kirow/" + ("en/" if lang == "en" else "")
    body = d["text"] + "\n\n" + url
    email = "mailto:?" + urlencode({"subject": d["title"], "body": body}, quote_via=quote)
    sms = "sms:?body=" + quote(url, safe="")
    x_url = "https://x.com/intent/tweet?" + urlencode({"text": d["text"], "url": url, "lang": lang}, quote_via=quote)
    asset = f"/kirow/assets/kirow-instagram-{lang}.jpg"
    messages = " ".join(
        f'data-{key.replace("_", "-")}="{escape(d[key], quote=True)}"'
        for key in (
            "copy_done", "copy_failed", "share_opening", "share_opened",
            "share_cancelled", "share_failed",
        )
    )
    return f'''<div class="share-wrap">
<section class="section share-section" id="partager" aria-labelledby="share-heading" data-share-section data-share-url="{url}" data-share-title="{escape(d['title'], quote=True)}" data-share-text="{escape(d['text'], quote=True)}" {messages}>
  <div class="share-copy">
    <p class="eyebrow">{d['eyebrow']}</p>
    <h2 id="share-heading">{d['heading']}</h2>
    <p class="share-intro">{d['intro']}</p>
    <div class="share-actions">
      <button type="button" class="share-action share-native" data-share-native hidden>{d['native']}</button>
      <a class="share-action" href="{escape(sms, quote=True)}" data-share-sms>{d['sms']}</a>
      <a class="share-action" href="{escape(email, quote=True)}">{d['email']}</a>
      <a class="share-action" href="{escape(x_url, quote=True)}" target="_blank" rel="noopener noreferrer">{d['x']} <span aria-hidden="true">↗</span><span class="sr-only"> · {d['new_tab']}</span></a>
    </div>
    <p class="share-status" role="status" aria-live="polite" aria-atomic="true" data-share-status></p>
    <div class="share-address">
      <label for="share-address">{d['address']}</label>
      <div class="share-address-row">
        <input id="share-address" type="url" value="{url}" readonly spellcheck="false" autocomplete="off" aria-describedby="share-manual" data-share-address>
        <button type="button" class="share-action" data-share-copy hidden>{d['copy']}</button>
      </div>
      <p id="share-manual">{d['manual']}</p>
    </div>
  </div>
  <figure class="share-instagram">
    <img src="{asset}" alt="{d['image_alt']}" width="1080" height="1080" loading="lazy" decoding="async">
    <figcaption>
      <h3>{d['instagram']}</h3>
      <p>{d['instagram_help']}</p>
      <a class="share-download" href="{asset}" download="kirow-instagram-{lang}.jpg">{d['download']} <span aria-hidden="true">↓</span></a>
      <span class="share-format">{d['image_format']}</span>
    </figcaption>
  </figure>
</section>
</div>'''
