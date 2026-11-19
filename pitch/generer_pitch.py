#!/usr/bin/env python3
"""Génère le support de présentation de Probant (PowerPoint modifiable).
Usage : python3 pitch/generer_pitch.py   →  pitch/Probant-pitch.pptx
Conversion PDF : soffice --headless --convert-to pdf --outdir pitch pitch/Probant-pitch.pptx
Police : Inter (gratuite). Sans Inter installée, PowerPoint utilise une police de substitution.
"""
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION

ICI = Path(__file__).resolve().parent
IMG = ICI / 'images'
POLICE = 'Inter'
ENCRE, ENCRE3, GRIS, LIGNE, FOND = '14213d', '3c4a66', '5b6475', 'dfe3eb', 'f5f7fb'
OR, OR_FONCE, BLANC = 'f3c969', '9a6b12', 'ffffff'
ACCENT, CONTEXTE = '2a78d6', '8a93a6'  # graphiques : accent validé (palette de référence) + gris de contexte
VERT, VERT_F, AMBRE, AMBRE_F, ROUGE, ROUGE_F = '1b5e34', 'e3f2e8', '7a4f00', 'fff1cc', '9b1c14', 'fde0de'
NNBSP, NBSP = ' ', ' '

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
VIDE = prs.slide_layouts[6]
W, H = 13.333, 7.5
M = 0.6  # marge


def rgb(h):
    return RGBColor.from_string(h)


def rect(s, x, y, w, h, fond=None, bord=None, arrondi=None, epaisseur=0.75):
    forme = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if arrondi else MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    if arrondi:
        forme.adjustments[0] = arrondi
    if fond:
        forme.fill.solid(); forme.fill.fore_color.rgb = rgb(fond)
    else:
        forme.fill.background()
    if bord:
        forme.line.color.rgb = rgb(bord); forme.line.width = Pt(epaisseur)
    else:
        forme.line.fill.background()
    forme.shadow.inherit = False
    forme.text_frame.text = ''
    return forme


def texte(s, x, y, w, h, contenu, taille=16, gras=False, couleur=ENCRE, aligne='g', ancre='h', interligne=1.15, italique=False):
    """contenu : str, ou liste de paragraphes ; un paragraphe = str ou liste de (texte, {options})."""
    zone = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = zone.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = {'h': MSO_ANCHOR.TOP, 'm': MSO_ANCHOR.MIDDLE, 'b': MSO_ANCHOR.BOTTOM}[ancre]
    paragraphes = contenu if isinstance(contenu, list) else [contenu]
    for i, para in enumerate(paragraphes):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {'g': PP_ALIGN.LEFT, 'c': PP_ALIGN.CENTER, 'd': PP_ALIGN.RIGHT}[aligne]
        p.line_spacing = interligne
        morceaux = para if isinstance(para, list) else [(para, {})]
        for t, opt in morceaux:
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = POLICE
            f.size = Pt(opt.get('taille', taille))
            f.bold = opt.get('gras', gras)
            f.italic = opt.get('italique', italique)
            f.color.rgb = rgb(opt.get('couleur', couleur))
        if 'espace' in (morceaux[0][1] if morceaux else {}):
            p.space_before = Pt(morceaux[0][1]['espace'])
    return zone


def puces(s, x, y, w, h, items, taille=15, couleur=ENCRE, puce='•', couleur_puce=OR_FONCE, espace=8):
    zone = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = zone.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(espace); p.line_spacing = 1.15
        r = p.add_run(); r.text = f'{puce}  '; r.font.name = POLICE; r.font.size = Pt(taille); r.font.bold = True; r.font.color.rgb = rgb(couleur_puce)
        morceaux = it if isinstance(it, list) else [(it, {})]
        for t, opt in morceaux:
            r = p.add_run(); r.text = t; r.font.name = POLICE; r.font.size = Pt(opt.get('taille', taille)); r.font.bold = opt.get('gras', False); r.font.color.rgb = rgb(opt.get('couleur', couleur))
    return zone


NUM = [0]


def diapo(fond=BLANC, notes=''):
    s = prs.slides.add_slide(VIDE)
    NUM[0] += 1
    if fond != BLANC:
        rect(s, 0, 0, W, H, fond=fond)
    if notes:
        s.notes_slide.notes_text_frame.text = notes
    return s


def entete(s, surtitre, titre, sombre=False):
    texte(s, M, 0.48, W - 2 * M, 0.3, surtitre.upper(), taille=11, gras=True, couleur=OR if sombre else OR_FONCE)
    texte(s, M, 0.8, W - 2 * M, 1.2, titre, taille=28, gras=True, couleur=BLANC if sombre else ENCRE, interligne=1.05)


def pied(s, sombre=False, source=None):
    c = 'aeb8cc' if sombre else GRIS
    if source:
        texte(s, M, H - 0.72, W - 2 * M - 1.2, 0.3, source, taille=9, couleur=c)
    texte(s, M, H - 0.42, 6, 0.25, 'Probant · Présentation · Novembre 2026', taille=9, couleur=c)
    texte(s, W - M - 1, H - 0.42, 1, 0.25, str(NUM[0]), taille=9, couleur=c, aligne='d')


def logo(s, x, y, taille=0.5, sombre=True):
    carre = rect(s, x, y, taille, taille, fond=ENCRE if not sombre else OR, arrondi=0.22)
    texte(s, x, y - 0.01, taille, taille, 'P', taille=int(taille * 40), gras=True, couleur=OR if not sombre else ENCRE, aligne='c', ancre='m')
    return carre


def tuile(s, x, y, w, h, chiffre, libelle, detail=None, couleur_chiffre=ENCRE, fond=BLANC, bord=LIGNE, taille_chiffre=40):
    rect(s, x, y, w, h, fond=fond, bord=bord, arrondi=0.08)
    texte(s, x + 0.25, y + 0.22, w - 0.5, 0.75, chiffre, taille=taille_chiffre, gras=True, couleur=couleur_chiffre)
    texte(s, x + 0.25, y + 0.22 + taille_chiffre / 72 * 1.25, w - 0.5, h - 1.2, libelle, taille=14, couleur=ENCRE3)
    if detail:
        texte(s, x + 0.25, y + h - 0.45, w - 0.5, 0.35, detail, taille=9.5, couleur=GRIS)


def image(s, nom, x, y, w=None, h=None, bord=True):
    pic = s.shapes.add_picture(str(IMG / nom), Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)
    if bord:
        pic.line.color.rgb = rgb(LIGNE); pic.line.width = Pt(0.75)
    return pic


# ── 1. Couverture ───────────────────────────────────────────────────────────
s = diapo(ENCRE, notes="Probant : le dossier anti-blanchiment des agences immobilières indépendantes. En 30 minutes, une agence obtient sa classification des risques, ses procédures, sa désignation Tracfin, une formation adaptée à chaque collaborateur avec attestations, et des fiches de vigilance par opération. Licence de 290 € HT par an.")
rect(s, 0, 0, 0.18, H, fond=OR)
logo(s, M + 0.2, 0.9, 0.62)
texte(s, M + 1.0, 0.96, 5, 0.55, 'Probant', taille=26, gras=True, couleur=BLANC)
texte(s, M + 0.2, 2.15, 7.6, 2.7, 'Le dossier anti-blanchiment des agences immobilières, prêt pour le contrôle.', taille=40, gras=True, couleur=BLANC, interligne=1.02)
texte(s, M + 0.2, 4.95, 7.6, 1.0, 'Classification des risques, procédures, formation adaptée au décret n° 2026-310 et fiches de vigilance, en 30 minutes, pour 290 € HT par an et par agence.', taille=17, couleur='d6deef')
texte(s, M + 0.2, H - 0.9, 8, 0.3, 'Présentation · 19 novembre 2026 · chiffres sourcés en annexe', taille=11, couleur='aeb8cc')
image(s, '01-tableau-de-bord.png', 8.75, 2.2, w=4.3, bord=False)

# ── 2. En bref ───────────────────────────────────────────────────────────────
s = diapo(notes="Résumé en quatre blocs. Le problème est réglementaire et daté : depuis le 26 avril 2026, la formation LCB-FT doit être adaptée aux risques de chaque agence et prouvée. La solution est un outil forfaitaire qui produit tout le dossier. Le modèle est une licence annuelle, avec des coûts quasi nuls. L'état d'avancement : le produit est terminé et testé, le lancement attend la validation juridique et l'ouverture du compte de paiement.")
entete(s, 'En bref', 'Une obligation datée, un marché identifiable, un produit déjà prêt')
blocs = [
    ('Le problème', "Les agences immobilières sont assujetties à la LCB-FT. Les contrôles DGCCRF relèvent des manquements chez presque toutes, et les sanctions sont publiques. Depuis le 26/04/2026, il faut former chaque collaborateur selon les risques de l'agence et le prouver."),
    ('La solution', "Probant produit le dossier complet en 30 minutes : classification, procédures, désignation Tracfin, formation et attestations, fiches de vigilance, auto-contrôle. Tout reste sur le poste de l'agence."),
    ('Le modèle', "Licence annuelle de 290 € HT par agence (190 € pour les 50 fondateurs), collaborateurs illimités. Coûts fixes quasi nuls et marge brute supérieure à 95 %. Vente et livraison automatisées."),
    ('Où on en est', "Produit terminé et testé (40 tests automatisés), page de vente et diagnostic gratuit prêts, 10 prospects identifiés. Reste à faire avant le lancement : relecture juridique, compte Stripe, nom de domaine."),
]
for i, (t, d) in enumerate(blocs):
    x = M + (i % 2) * 6.1
    y = 1.95 + (i // 2) * 2.45
    rect(s, x, y, 5.9, 2.25, fond=FOND, arrondi=0.06)
    rect(s, x, y, 0.08, 2.25, fond=OR)
    texte(s, x + 0.35, y + 0.25, 5.3, 0.4, t, taille=17, gras=True)
    texte(s, x + 0.35, y + 0.72, 5.3, 1.5, d, taille=13.5, couleur=ENCRE3)
pied(s)

# ── 3. Le problème ───────────────────────────────────────────────────────────
s = diapo(notes="Les agents immobiliers sont des professionnels assujettis au sens de l'article L. 561-2 du Code monétaire et financier. L'Analyse nationale des risques de 2023 classe l'immobilier à risque élevé. Sur le terrain, la DGCCRF constate qu'aucun professionnel contrôlé ne respectait la totalité des exigences, et qu'il n'existe quasiment aucun protocole interne écrit.")
entete(s, 'Le problème', 'Les agences sont assujetties à la LCB-FT… et presque aucune n’est en règle')
rect(s, M, 2.0, 6.4, 4.2, fond=ENCRE, arrondi=0.05)
rect(s, M + 0.45, 2.55, 0.08, 2.0, fond=OR)
texte(s, M + 0.8, 2.55, 5.3, 2.0, '« Aucun professionnel contrôlé ne respectait la totalité des exigences. »', taille=24, gras=True, couleur=BLANC, interligne=1.1, ancre='m')
texte(s, M + 0.45, 4.85, 5.6, 1.1, "DGCCRF, contrôles LCB-FT dans l'immobilier, qui relève aussi « quasiment aucun protocole interne écrit » et une formation insuffisante [1]", taille=12, couleur='c3cde3')
puces(s, 7.45, 2.05, 5.3, 4.3, [
    [('Risque élevé : ', {'gras': True}), ("l'Analyse nationale des risques classe l'immobilier parmi les secteurs les plus exposés au blanchiment [5].", {})],
    [('65 % ', {'gras': True}), ("des 1 739 professionnels de l'immobilier contrôlés étaient en anomalie, toutes réglementations confondues [3].", {})],
    [('Opérations ciblées : ', {'gras': True}), ("contrôles LCB-FT inopinés d'agences de prestige en 2025 (Saint-Tropez, ouest parisien) [1].", {})],
    [('Ce qui manque le plus : ', {'gras': True}), ('une classification des risques écrite, des procédures, la formation et la traçabilité des dossiers.', {})],
], taille=14.5, espace=12)
pied(s, source='Sources numérotées : voir la diapositive « Sources ».')

# ── 4. Pourquoi maintenant ───────────────────────────────────────────────────
s = diapo(notes="Trois déclencheurs datés. En février 2026, Tracfin et la DGCCRF publient des brochures sur l'immobilier. Le 26 avril 2026, le décret n° 2026-310 entre en vigueur : formation à l'embauche puis régulière, adaptée à la classification des risques et aux fonctions, volet sanctions obligatoire, justificatifs conservés 5 ans après le départ. Le 10 juillet 2027, le règlement européen AMLR s'applique et exige notamment la vérification des deux parties à la transaction.")
entete(s, 'Pourquoi maintenant', "Le décret du 24 avril 2026 rend la conformité prouvable… et l'Europe durcit encore en 2027")
y0 = 3.55
rect(s, M + 0.2, y0, W - 2 * M - 0.4, 0.06, fond=LIGNE)
jalons = [
    (1.0, 'Février 2026', 'Brochures Tracfin–DGCCRF', "6 obligations pour l'immobilier, la classification des risques en premier.", LIGNE, GRIS),
    (4.55, '26 avril 2026', 'Décret n° 2026-310 en vigueur', 'Formation adaptée aux risques et aux fonctions, volet sanctions, preuves conservées 5 ans après le départ.', OR, ENCRE),
    (8.1, '19 novembre 2026', "Aujourd'hui", "La plupart des agences n'ont ni classification écrite ni formation adaptée.", ACCENT, ACCENT),
    (11.0, '10 juillet 2027', 'Règlement UE AMLR', 'Vérification explicite des deux parties ; nouvelles mises à jour obligatoires.', LIGNE, GRIS),
]
for x, date, titre_j, detail, c_point, c_date in jalons:
    point = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x + 0.75), Inches(y0 - 0.17), Inches(0.4), Inches(0.4))
    point.fill.solid(); point.fill.fore_color.rgb = rgb(c_point if c_point != LIGNE else 'c9cfdb'); point.line.fill.background(); point.shadow.inherit = False
    texte(s, x, y0 - 1.35, 2.2, 0.35, date, taille=13, gras=True, couleur=c_date if c_date != GRIS else ENCRE3)
    texte(s, x, y0 + 0.45, 2.3, 0.75, titre_j, taille=14.5, gras=True)
    texte(s, x, y0 + 1.3, 2.3, 1.8, detail, taille=12, couleur=ENCRE3)
pied(s, source='Sources : décret n° 2026-310 du 24/04/2026 (art. D. 561-38-1-1 CMF) [4] ; règlement (UE) 2024/1624, art. 90.')

# ── 5. Le coût de l'inaction ─────────────────────────────────────────────────
s = diapo(notes="Les décisions de la Commission nationale des sanctions sont publiques et souvent nominatives. Trois exemples récents. La sanction de février 2026 est la plus parlante : une seule vente à 290 000 euros, sans justification de l'origine des fonds. Plafond légal : interdiction d'exercer jusqu'à 5 ans, retrait de la carte, amende jusqu'à 5 millions d'euros.")
entete(s, "Le coût de l'inaction", 'Les sanctions sont publiques, personnelles… et tombent pour une seule vente')
cas = [
    ('Mars 2024', '4 000 €', "pour la société et pour son dirigeant, interdiction d'exercer 3 mois avec sursis, publication.", 'Pas de cartographie des risques, de formation ni de contrôle interne.'),
    ('Juin 2024', '15 000 € + 5 000 €', "pour la société et pour le dirigeant, interdiction de 2 ans avec sursis, publication obligatoire.", 'Manquements à la quasi-totalité des obligations.'),
    ('Février 2026', '10 000 €', "d'amende pour le dirigeant, interdiction d'exercer avec sursis.", 'Une seule vente à 290 000 € sans justification de l’origine des fonds.'),
]
for i, (date, montant, quoi, motif) in enumerate(cas):
    x = M + i * 4.1
    rect(s, x, 2.0, 3.9, 3.85, fond=BLANC, bord=LIGNE, arrondi=0.05)
    texte(s, x + 0.3, 2.25, 3.3, 0.3, f'Décision CNS · {date}', taille=11.5, gras=True, couleur=OR_FONCE)
    texte(s, x + 0.3, 2.62, 3.4, 0.7, montant, taille=25, gras=True)
    texte(s, x + 0.3, 3.45, 3.35, 1.2, quoi, taille=13, couleur=ENCRE3)
    rect(s, x + 0.3, 4.7, 3.3, 0.9, fond=ROUGE_F, arrondi=0.12)
    texte(s, x + 0.45, 4.78, 3.0, 0.8, motif, taille=11.5, couleur=ROUGE, ancre='m')
texte(s, M, 6.1, W - 2 * M, 0.5, [[('Plafond légal (art. L. 561-40 CMF) : ', {'gras': True}), ("avertissement, blâme, interdiction d'exercer jusqu'à 5 ans, retrait de la carte, amende jusqu'à 5 M€. Le dirigeant et les salariés peuvent être sanctionnés personnellement.", {})]], taille=13, couleur=ENCRE3)
pied(s, source='Sources : décisions CNS rapportées par Novlaw [7] et MySweetImmo [2] ; art. L. 561-40 CMF [6].')

# ── 6. Le marché ─────────────────────────────────────────────────────────────
s = diapo(notes="Dimensionnement établi avec l'API officielle de l'annuaire des entreprises (données INSEE/SIRENE), code NAF 68.31Z, entreprises actives, interrogée le 19 novembre 2026 : 7 113 agences de 3 à 49 salariés, et plus de 10 000 de 1 à 2 salariés (l'API plafonne ses totaux à 10 000). Une partie appartient à des réseaux déjà outillés : on estime le cœur de cible à environ 10 000 agences indépendantes employeuses. Le décret 2026-310 s'applique à tous les assujettis : le même moteur s'étend ensuite à la domiciliation, au courtage et au commerce de luxe.")
entete(s, 'Le marché', "Environ 10 000 agences indépendantes employeuses en cœur de cible, puis tous les assujettis")
tuile(s, M, 2.0, 3.85, 2.55, '7 113', 'agences actives de 3 à 49 salariés', 'API SIRENE, NAF 68.31Z, 19/11/2026')
tuile(s, M + 4.05, 2.0, 3.85, 2.55, f'>{NNBSP}10{NNBSP}000', 'agences actives de 1 à 2 salariés', 'Plafond technique de l’API : total réel supérieur')
tuile(s, M + 8.1, 2.0, 3.95, 2.55, f'≈{NNBSP}10{NNBSP}000', 'agences indépendantes employeuses (hors grandes franchises)', 'Estimation : cœur de cible', couleur_chiffre=ACCENT)
rect(s, M, 4.85, W - 2 * M, 1.55, fond=FOND, arrondi=0.06)
texte(s, M + 0.35, 5.02, 3.0, 0.4, 'Extension (2027)', taille=15, gras=True)
texte(s, M + 0.35, 5.45, 11.6, 0.9, "Le décret n° 2026-310 vise tous les professionnels assujettis de l'art. L. 561-2 CMF. Le même moteur s'applique avec de nouveaux référentiels : sociétés de domiciliation (souvent sanctionnées par la CNS), courtiers en assurance et en crédit, conseillers en gestion de patrimoine, commerce d'art et de luxe.", taille=13, couleur=ENCRE3)
pied(s, source='Source : API Recherche d’entreprises (DINUM, données INSEE/RNE) [8]. Estimation du cœur de cible : hypothèse à affiner.')

# ── 7. La solution ───────────────────────────────────────────────────────────
s = diapo(notes="Les 7 pièces qu'un inspecteur demande en premier, générées à partir de l'activité réelle de l'agence. Chaque document cite ses bases légales, porte le nom de l'agence et s'exporte en PDF et en Word. L'outil fonctionne dans le navigateur : aucune donnée client n'est envoyée sur un serveur.")
entete(s, 'La solution', 'Probant produit les 7 pièces du dossier, à partir de l’activité réelle de l’agence')
pieces = [
    ('Classification des risques', '22 facteurs, 5 axes légaux (L. 561-4-1)'),
    ('Procédures internes', '13 sections + 2 annexes (L. 561-32)'),
    ('Désignation Tracfin', 'Déclarant, correspondant, marche à suivre ERMES'),
    ('Plan de formation', 'Un parcours par fonction, périodicité selon le risque'),
    ('Formation et attestations', 'Modules adaptés, volet sanctions, quiz, registre'),
    ('Fiches de vigilance', 'Deux parties, BE, PPE, gel, origine des fonds'),
    ('Auto-contrôle annuel', '20 points, score, plan d’action'),
]
for i, (t, d) in enumerate(pieces):
    y = 1.95 + i * 0.68
    rect(s, M, y, 0.46, 0.46, fond=OR, arrondi=0.2)
    texte(s, M, y, 0.46, 0.46, str(i + 1), taille=14, gras=True, aligne='c', ancre='m')
    texte(s, M + 0.65, y - 0.02, 5.2, 0.3, t, taille=14.5, gras=True)
    texte(s, M + 0.65, y + 0.26, 5.2, 0.3, d, taille=11.5, couleur=GRIS)
image(s, '01-tableau-de-bord.png', 6.55, 1.95, w=6.2)
texte(s, 6.55, 5.95, 6.2, 0.6, "Tout s'exporte en PDF et en Word, au nom de l'agence. Aucune donnée client ne quitte son poste.", taille=12, couleur=ENCRE3)
pied(s)

# ── 8. Le produit ────────────────────────────────────────────────────────────
s = diapo(notes="Trois écrans clés. À gauche, la classification : chaque réponse produit un niveau motivé, ajustable avec justification. Au centre, la fiche de vigilance : le panneau de droite indique en direct le niveau (standard, renforcé ou bloqué), les motifs et les points manquants. À droite, le parcours de formation : socle, modules déclenchés par les risques de l'agence et module propre à la fonction. Démo possible en direct avec l'agence d'exemple.")
entete(s, 'Le produit', 'Guidé, explicable, traçable : chaque écran dit quoi faire et pourquoi')
for i, (nom, leg) in enumerate([('02-classification.png', 'Classification motivée et ajustable'), ('03-fiche-de-vigilance.png', 'Fiche de vigilance : niveau, motifs, manques'), ('04-formation.png', 'Formation adaptée par risque et par fonction')]):
    x = M + i * 4.1
    image(s, nom, x, 2.05, w=3.9)
    texte(s, x, 4.65, 3.9, 0.6, leg, taille=13.5, gras=True)
texte(s, M, 5.35, W - 2 * M, 0.9, "Application autonome de 230 Ko qui fonctionne hors ligne. Licence nominative vérifiée sur le poste, sauvegarde et restauration, journal de traçabilité. Testée par 40 tests automatisés, dont le parcours complet dans un vrai navigateur.", taille=13, couleur=ENCRE3)
pied(s)

# ── 9. La différence ─────────────────────────────────────────────────────────
s = diapo(notes="Pour une agence de 4 personnes, un dispositif équivalent coûte entre environ 800 et 1 270 euros par an : un logiciel de KYC d'entrée de gamme à environ 600 euros par an, plus un e-learning générique pour 4 personnes entre 196 et 672 euros. Probant coûte 290 euros HT, collaborateurs illimités, et couvre la formation adaptée qu'exige le décret. Les prix concurrents ont été relevés sur les pages publiques des éditeurs en novembre 2026.")
entete(s, 'La différence', 'De 2,7 à 4,4 fois moins cher qu’un dispositif équivalent, et pensé pour le décret')
donnees = CategoryChartData()
donnees.categories = ['Probant (Licence Agence)', 'Équivalent, hypothèse basse', 'Équivalent, hypothèse haute']
donnees.add_series('Coût annuel', (290, 796, 1272))
cadre = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Inches(M), Inches(2.25), Inches(7.1), Inches(3.6), donnees)
ch = cadre.chart
ch.has_legend = False
ch.has_title = False
ch.font.name = POLICE; ch.font.size = Pt(12); ch.font.color.rgb = rgb(ENCRE3)
plot = ch.plots[0]
plot.gap_width = 70
plot.vary_by_categories = False
plot.has_data_labels = True
serie = plot.series[0]
for i, (pt, valeur) in enumerate(zip(serie.points, (290, 796, 1272))):
    pt.format.fill.solid(); pt.format.fill.fore_color.rgb = rgb(ACCENT if i == 0 else CONTEXTE)
    lbl = pt.data_label
    lbl.has_text_frame = True
    lbl.text_frame.text = f'{valeur:,}'.replace(',', NNBSP) + f'{NBSP}€ HT/an'
    lbl.position = XL_LABEL_POSITION.OUTSIDE_END
    for r in lbl.text_frame.paragraphs[0].runs:
        r.font.size = Pt(13); r.font.bold = (i == 0); r.font.color.rgb = rgb(ENCRE); r.font.name = POLICE
cat = ch.category_axis
cat.reverse_order = True
cat.format.line.color.rgb = rgb(LIGNE)
cat.tick_labels.font.size = Pt(12.5); cat.tick_labels.font.color.rgb = rgb(ENCRE)
val = ch.value_axis
val.visible = False
val.has_major_gridlines = False
val.maximum_scale = 1650
texte(s, M, 1.9, 7.1, 0.35, 'Coût annuel pour une agence de 4 personnes', taille=13, gras=True, couleur=ENCRE)
texte(s, M, 5.9, 7.1, 0.6, 'Équivalent : logiciel de KYC d’entrée de gamme (≈ 600 € par an), plus e-learning générique pour 4 personnes (49 à 168 € HT par personne).', taille=10.5, couleur=GRIS)
puces(s, 8.2, 2.0, 4.6, 4.5, [
    [('Formation adaptée : ', {'gras': True}), ('construite à partir de la classification et de chaque fonction, comme l’exige le décret. Un e-learning générique ne l’est pas.', {})],
    [('Collaborateurs illimités : ', {'gras': True}), ('un forfait par agence, pas un prix par personne.', {})],
    [('Aucune donnée dans le cloud : ', {'gras': True}), ('les pièces d’identité des clients restent sur le poste.', {})],
    [('Sans abonnement mensuel : ', {'gras': True}), ('une licence annuelle, sans reconduction tacite la première année.', {})],
], taille=13.5, espace=12)
pied(s, source='Prix publics relevés en novembre 2026 : Konforme, VigImmo, Conform-Immo, kyc.immo, Lefebvre Dalloz, Galian [9].')

# ── 10. Modèle économique ────────────────────────────────────────────────────
s = diapo(notes="Une licence annuelle simple. Le prix de 290 euros HT est sous le seuil de décision immédiate d'un gérant et représente environ la moitié de l'offre SaaS la moins chère. Les coûts fixes sont quasi nuls : hébergement statique gratuit, nom de domaine, frais Stripe d'environ 1,5 % plus 25 centimes par paiement. Le seul investissement recommandé est la relecture juridique, de 500 à 1 500 euros, amortie en 2 à 5 licences. Scénario central de première année : 120 agences, 29 800 euros.")
entete(s, 'Le modèle économique', 'Une licence annuelle, des coûts quasi nuls, une vente et une livraison automatisées')
offres = [('Fondateurs', f'190{NBSP}€', 'HT la 1re année · 50 premières agences', AMBRE_F), ('Licence Agence', f'290{NBSP}€', 'HT par an · collaborateurs illimités', BLANC), ('Multi-agences', f'590{NBSP}€', 'HT par an · jusqu’à 5 établissements', BLANC)]
for i, (t, p, d, f) in enumerate(offres):
    x = M + i * 2.75
    rect(s, x, 2.0, 2.6, 2.05, fond=f, bord=ENCRE if i == 1 else LIGNE, arrondi=0.07, epaisseur=1.75 if i == 1 else 0.75)
    texte(s, x + 0.22, 2.15, 2.2, 0.35, t, taille=13, gras=True, couleur=OR_FONCE if i == 0 else ENCRE3)
    texte(s, x + 0.22, 2.5, 2.2, 0.7, p, taille=32, gras=True)
    texte(s, x + 0.22, 3.25, 2.2, 0.7, d, taille=11, couleur=GRIS)
puces(s, 9.05, 2.0, 3.75, 2.2, ['Marge brute supérieure à 95 %', 'Hébergement statique : 0 €', 'Stripe : ~1,5 % + 0,25 € par vente', 'Point mort de la relecture juridique : 2 à 5 licences'], taille=13, espace=7)
texte(s, M, 4.35, 8, 0.35, 'Scénarios de première année (estimations)', taille=13, gras=True)
for i, (t, n, ca) in enumerate([('Prudent', '40 agences', f'7{NNBSP}600{NBSP}€'), ('Central', '120 agences', f'29{NNBSP}800{NBSP}€'), ('Ambitieux', '300 agences', f'82{NNBSP}000{NBSP}€')]):
    x = M + i * 4.1
    rect(s, x, 4.8, 3.9, 1.45, fond=FOND, arrondi=0.07)
    texte(s, x + 0.3, 4.92, 3.4, 0.3, f'{t} · {n}', taille=12, gras=True, couleur=ENCRE3)
    texte(s, x + 0.3, 5.28, 3.4, 0.7, ca, taille=28, gras=True, couleur=ACCENT if t == 'Central' else ENCRE)
    texte(s, x + 3.05, 5.62, 0.8, 0.3, 'HT', taille=10, couleur=GRIS)
pied(s, source='Hypothèse centrale : 3 000 agences contactées par an, 8 % de réponses intéressées, 50 % de conversion. À confirmer sur les 300 premiers envois.')

# ── 11. Acquisition ──────────────────────────────────────────────────────────
s = diapo(notes="Sans audience, on vend par la pertinence. Premier canal : une prospection B2B sobre et ciblée sur les agences indépendantes des marchés les plus exposés (prestige, frontalier, littoral). Chaque message s'appuie sur un fait daté et se termine par un lien de désinscription. Deuxième canal : le contenu sur le décret 2026-310, qui mène au diagnostic gratuit. Troisième canal : les prescripteurs, à savoir les formateurs ALUR, les experts-comptables et les assureurs RCP. Les garde-fous : jamais de ton menaçant, jamais d'imitation d'une administration.")
entete(s, 'Acquisition', 'Sans audience : la pertinence d’un fait daté, et un diagnostic gratuit qui fait le travail')
canaux = [
    ('J0 → J+90', 'Prospection B2B ciblée', 'Agences indépendantes des marchés exposés, repérées dans l’annuaire officiel. 20 à 30 messages personnalisés par jour, désinscription en un clic.'),
    ('J+15 → J+180', 'Contenu et référencement', '5 pages piliers (décret 2026-310, classification, procédures, origine des fonds, contrôle DGCCRF), qui mènent au diagnostic.'),
    ('À partir de J+30', 'Prescripteurs', 'Formateurs ALUR (couche d’adaptation, commission de 20 %), experts-comptables immobiliers, assureurs RCP, chambres FNAIM et UNIS.'),
    ('2027', 'Extension verticale', 'Même moteur, nouveaux référentiels : domiciliation, courtage, CGP, art et luxe.'),
]
for i, (quand, t, d) in enumerate(canaux):
    x = M + i * 3.07
    rect(s, x, 2.0, 2.9, 3.0, fond=BLANC, bord=LIGNE, arrondi=0.06)
    texte(s, x + 0.25, 2.18, 2.5, 0.3, quand, taille=11, gras=True, couleur=OR_FONCE)
    texte(s, x + 0.25, 2.52, 2.5, 0.65, t, taille=15, gras=True)
    texte(s, x + 0.25, 3.22, 2.45, 1.75, d, taille=11.5, couleur=ENCRE3)
texte(s, M, 5.25, 4, 0.35, 'Objectifs de l’entonnoir', taille=13, gras=True)
for i, (v, l) in enumerate([('≥ 5 %', 'de réponses aux messages'), ('≥ 60 %', 'de diagnostics terminés'), ('≥ 10 %', 'de conversion démo → licence'), ('≥ 75 %', 'de renouvellement à 12 mois')]):
    x = M + i * 3.07
    texte(s, x, 5.62, 1.4, 0.5, v, taille=22, gras=True, couleur=ENCRE)
    texte(s, x + 1.35, 5.72, 1.6, 0.5, l, taille=11, couleur=ENCRE3)
pied(s)

# ── 12. Déjà fait ───────────────────────────────────────────────────────────
s = diapo(notes="Ce n'est pas un projet sur papier. Le produit est terminé et testé, avec 32 tests unitaires et 8 tests de bout en bout dans Chromium. La chaîne de vente est automatisable de bout en bout : le paiement Stripe déclenche un Worker Cloudflare qui génère la licence signée et l'envoie par e-mail. La page de vente, le diagnostic gratuit et les projets de pages légales sont prêts. Dix prospects réels ont été identifiés, avec leurs sources, et les brouillons de messages sont rédigés.")
entete(s, 'Exécution', 'Ce qui est déjà construit et vérifié')
faits = [
    ('Produit complet', 'Application autonome : classification, procédures, Tracfin, formation, vigilance, auto-contrôle, 10 documents PDF et Word.'),
    ('40 tests automatisés', '32 unitaires et 8 de bout en bout dans un vrai navigateur : parcours complet, licences, PDF, sécurité, mobile.'),
    ('Licences et vente automatisées', 'Licence signée et vérifiée hors ligne, puis Worker Stripe → licence → e-mail Brevo, testé.'),
    ('Page de vente et diagnostic', 'Site statique sans cookie, diagnostic gratuit en 12 questions, exemples de documents, déploiement documenté.'),
    ('Prospection prête', '10 agences réelles identifiées dans l’annuaire officiel, brouillons personnalisés conformes aux règles de la CNIL.'),
    ('Décision documentée', '14 pistes comparées, prix justifié par des repères concurrents, risques et critères d’arrêt.'),
]
for i, (t, d) in enumerate(faits):
    x = M + (i % 3) * 4.1
    y = 2.0 + (i // 3) * 2.1
    rect(s, x, y, 3.9, 1.9, fond=VERT_F, arrondi=0.07)
    texte(s, x + 0.25, y + 0.18, 3.4, 0.35, f'✓  {t}', taille=14.5, gras=True, couleur=VERT)
    texte(s, x + 0.25, y + 0.6, 3.45, 1.25, d, taille=12, couleur=ENCRE)
pied(s)

# ── 13. Feuille de route et besoins ──────────────────────────────────────────
s = diapo(ENCRE, notes="Pour lancer, il faut environ 1 000 euros pour la relecture juridique et 3 à 5 heures par semaine. Dans les 7 jours : relecture des pages légales et des contenus, nom de domaine, compte Stripe, déploiement. À 30 jours : 50 agences fondatrices et 3 témoignages. Ensuite : la mise à jour après la plénière GAFI de février 2027, le module AMLR avant juillet 2027 et le référentiel domiciliation au second semestre 2027.")
entete(s, 'Feuille de route', 'Prêt à lancer : il reste la validation juridique et l’ouverture des comptes', sombre=True)
etapes = [('J+7', 'Relecture juridique, domaine, Stripe, déploiement'), ('J+30', '50 agences fondatrices, 3 témoignages'), ('Fév. 2027', 'Mise à jour post-GAFI, export Word enrichi'), ('Juin 2027', 'Module AMLR (application au 10/07/2027)'), ('S2 2027', 'Référentiel domiciliation, programme partenaires')]
for i, (q, t) in enumerate(etapes):
    x = M + i * 2.46
    rect(s, x, 2.15, 2.3, 2.2, fond='1f3058', arrondi=0.07)
    texte(s, x + 0.22, 2.32, 1.9, 0.4, q, taille=17, gras=True, couleur=OR)
    texte(s, x + 0.22, 2.85, 1.9, 1.4, t, taille=12.5, couleur='d6deef')
rect(s, M, 4.75, W - 2 * M, 1.6, fond=OR, arrondi=0.06)
texte(s, M + 0.4, 4.92, 3.6, 0.4, 'Ce qu’il faut pour lancer', taille=14, gras=True, couleur=ENCRE)
texte(s, M + 0.4, 5.35, 11.4, 0.95, [[('≈ 1 000 € ', {'gras': True}), ('de relecture juridique (estimation)  ·  ', {}), ('3 à 5 h ', {'gras': True}), ('par semaine après le lancement  ·  ', {}), ('0 € ', {'gras': True}), ('d’infrastructure (hébergement statique, offres gratuites)', {})]], taille=16, couleur=ENCRE)
pied(s, sombre=True)

# ── 14. Risques ──────────────────────────────────────────────────────────────
s = diapo(notes="Les principaux risques et leurs parades. Le plus important est l'exactitude juridique des contenus : c'est pourquoi la relecture par un avocat est la première étape avant tout lancement. La concurrence SaaS est réelle, mais notre angle est différent : forfait, décret 2026-310, aucune donnée stockée. Critère d'arrêt : moins de 3 ventes pour 300 prospects contactés en 90 jours.")
entete(s, 'Risques', 'Ce qui pourrait mal tourner, et ce qui est prévu')
lignes = [
    ('Exactitude juridique des contenus', 'Références explicites et datées, avertissement. Relecture par un avocat avant le lancement.'),
    ('Concurrence SaaS installée', 'Angle différent (forfait, décret, données locales), essai gratuit complet, prix bas.'),
    ('Évolutions réglementaires', 'Mises à jour incluses dans la licence, données centralisées, environ 2 h par trimestre.'),
    ('Méfiance envers un nouvel acteur', 'Sources citées, garantie de 30 jours, aucune imitation d’un organisme officiel.'),
    ('Données perdues côté client (stockage local)', 'Rappel mensuel de sauvegarde, export JSON, restauration testée.'),
    ('Pas de traction', 'Critère d’arrêt : moins de 3 ventes pour 300 contacts en 90 jours, puis passage à un autre segment ou aux partenaires.'),
]
for i, (r, p) in enumerate(lignes):
    y = 1.95 + i * 0.75
    rect(s, M, y, W - 2 * M, 0.66, fond=FOND if i % 2 == 0 else BLANC, arrondi=0.1)
    texte(s, M + 0.3, y, 4.4, 0.66, r, taille=13.5, gras=True, ancre='m')
    texte(s, M + 4.9, y, 7.0, 0.66, p, taille=12.5, couleur=ENCRE3, ancre='m')
pied(s)

# ── 15. Sources ──────────────────────────────────────────────────────────────
s = diapo(notes="Toutes les affirmations chiffrées sont sourcées. Certaines pages officielles n'ont pu être lues qu'à travers des extraits de moteur de recherche ; elles sont signalées dans docs/01-recherche-et-choix.md et à revérifier avant publication.")
entete(s, 'Annexe', 'Sources')
sources = [
    '[1] DGCCRF — LCB-FT : résultats des contrôles dans l’immobilier. economie.gouv.fr/dgccrf (enquêtes LCB-FT).',
    '[2] MySweetImmo, 05/05/2026 — décision CNS du 17/02/2026 et chiffres DGCCRF. mysweetimmo.com',
    '[3] DGCCRF, enquête publiée fin 2024 : 1 739 professionnels contrôlés, 65,1 % en anomalie (via [2]).',
    '[4] Décret n° 2026-310 du 24/04/2026, art. D. 561-38-1-1 CMF — MySweetImmo 30/04/2026 ; Kohen Avocats 12/06/2026.',
    '[5] Direction générale du Trésor — Analyse nationale des risques BC-FT, 2023 (immobilier : risque élevé).',
    '[6] Code monétaire et financier, art. L. 561-40 (sanctions de la Commission nationale des sanctions).',
    '[7] Novlaw Avocats — décisions CNS des 22/03/2024 et 28/06/2024. novlaw.fr/conformite-lcb-ft-agences-immobilieres',
    '[8] API Recherche d’entreprises (DINUM ; INSEE/RNE), NAF 68.31Z, interrogée le 19/11/2026.',
    '[9] Pages tarifs : konforme.eu, vigimmo.com, conform-immo.fr, kyc.immo, documan.fr, formation.lefebvre-dalloz.fr, catalogue Galian-SMABTP.',
    '[10] Règlement (UE) 2024/1624 (AMLR), art. 90 : application au 10/07/2027.',
]
puces(s, M, 1.95, W - 2 * M, 4.8, sources, taille=12, puce='', espace=6, couleur=ENCRE3)
pied(s)

prs.save(ICI / 'Probant-pitch.pptx')
print('✔ pitch/Probant-pitch.pptx —', NUM[0], 'diapositives')
