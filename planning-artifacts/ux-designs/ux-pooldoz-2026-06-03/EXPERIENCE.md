---
title: PoolDoz Experience Spec
status: final
created: 2026-06-03
updated: 2026-06-03
design-ref: DESIGN.md
---

## Foundation

**Forme** : Application web mobile-first (puis native). Une seule surface. Le layout s'adapte silencieusement à l'espace disponible — le canvas profite naturellement d'un écran plus grand, sans breakpoints définis.

**Système UI** : Custom. Aucun framework UI hérité. Tokens visuels dans `{DESIGN.md}`, deux thèmes complets (Balnéa défaut, Brutale alternatif).

**Modèle de données** : Local-first. Les profils piscine et l'historique de dosage vivent sur l'appareil. Le compte utilisateur est optionnel — il sert exclusivement à synchroniser les données vers le cloud pour les récupérer en cas de perte (cache vidé, changement d'appareil). L'app est pleinement fonctionnelle sans compte.

**Principes directeurs** :
1. **Ultra-automatisation** — l'app fait le maximum à la place de l'utilisateur. Zéro calcul manuel, zéro saisie inutile.
2. **Zéro cul-de-sac** — chaque état est récupérable. Toute correction est possible à tout moment.
3. **Bord de piscine d'abord** — toute interaction est pensée pour quelqu'un debout, en plein soleil, avec un testeur chimique dans la main.

---

## Information Architecture

### Navigation principale (4 onglets)

```
Dosage | Piscine | Journal | Réglages
```

| Onglet | Contenu |
|---|---|
| **Dosage** | Écran principal quotidien. Roue de sélection produit + saisie mesure + résultat + CTA validation |
| **Piscine** | Liste des piscines configurées. Accès au canvas de configuration. Ajout d'une nouvelle piscine. |
| **Journal** | Historique chronologique des sessions de dosage par piscine. Filtrable par produit. |
| **Réglages** | Valeurs cibles par produit (modifiables), unités, thème visuel, compte utilisateur, données. |

### Hiérarchie des données

```
Compte (optionnel)
└── Piscine (1..n)
    ├── Profil : plan + zones de profondeur + volume calculé + cote de calibrage
    └── Sessions de dosage (1..n)
        ├── Produit
        ├── Taux mesuré (si applicable)
        ├── Dose calculée
        └── Validation (CTA confirmé)
```

### Surfaces et leurs entrées

| Surface | Entrée principale | Journey associé |
|---|---|---|
| Onboarding configuration | Choix de méthode (photo/maps/dessin) | UJ-1 Marc |
| Canvas de configuration | Dessiner/corriger plan + zones + calibrage | UJ-1 Marc |
| Écran climax volume | Volume calculé + prompt compte | UJ-1 Marc (climax) |
| Dosage (écran principal) | Sélection produit via roue + saisie mesure | UJ-2 Marc |
| Historique (Journal) | Lecture et filtrage des sessions passées | — |
| Réglages | Modification des valeurs cibles, thème | — |

---

## Voice and Tone

**Registre** : chaleureux et complice. L'app parle à Marc comme un guide de confiance qui sait de quoi il parle — jamais condescendant, jamais froid. Pas de jargon non expliqué.

**Contrainte de longueur** : phrases courtes. Toujours. Une phrase = une idée. Maximum deux phrases consécutives dans un même composant.

**Exemples canoniques :**

| Contexte | Bon | Mauvais |
|---|---|---|
| Volume calculé | "Votre piscine n'a plus de secrets !" | "Le calcul volumétrique de votre bassin est terminé." |
| Taux bas | "Taux bas, mais rien de grave." | "Attention : la concentration en NaCl est inférieure au seuil optimal." |
| Prescription | "Ajoutez 14,2 kg de sel. Un sac de 10 + un de 5." | "La dose recommandée à administrer est de 14,2 kg." |
| Suggestion produit | "Sel suggéré — taux bas depuis votre dernière mesure" | "Nous vous recommandons de vérifier votre taux de sel." |
| CTA post-ajout | "J'ai ajouté le sel" | "Confirmer l'ajout du produit" |
| Validation silencieuse | "C'est noté !" | "Votre session a bien été enregistrée dans la base de données." |

**Noms des produits** : Sel, Chlore, pH+, pH−, TAC, Algicide, Stabilisant. Toujours avec majuscule initiale dans le contexte de sélection.

---

## Component Patterns

Les comportements décrits ici sont indépendants du thème visuel. Les tokens visuels sont dans `{DESIGN.md.Components}`.

### Roue de sélection produit

**7 produits** en rotation : Sel, Chlore, pH+, pH−, TAC, Algicide, Stabilisant.

**Sélection par suggestion (état par défaut)** : au chargement, la roue se positionne sur le produit dont la dernière mesure est la plus éloignée de sa valeur cible. Si aucune mesure historique, la roue démarre sur Sel.

**Interactions** :
- *Drag* : rotation libre. Au relâchement, snap animé vers le produit le plus proche de la fenêtre.
- *Tap sur segment* : animation directe vers le produit tapé, sans drag.
- *Snap Balnéa* : 320–420ms, easeOutCubic.
- *Snap Brutale* : ~300ms, easeInQuart puis arrêt instantané.
- *`prefers-reduced-motion`* : snap instantané, aucune animation.

**Fenêtre de sélection** : fixe à 12h (zénith). Le produit en fenêtre est le produit actif. Le panneau de saisie en dessous se met à jour en temps réel pendant la rotation.

**Indicateur de suggestion** : point `{DESIGN.md.colors.balnea.aqua}` / pixel `{DESIGN.md.colors.brutale.acid}` sur le segment suggéré. Accompagné d'une bannière contextuelle au-dessus de la roue : "Sel suggéré — taux bas depuis votre dernière mesure".

### Panneau de saisie (sous la roue)

Deux modes selon le type de produit :

**Mode mesure** (Sel, Chlore, pH+, pH−, TAC) :
- Champ numérique + unité (ppm ou pH)
- Jauge à galets colorée par statut
- Valeur cible affichée (modifiable dans Réglages)
- Card de résultat : dose calculée + décomposition en conditionnements (sacs, litres, grammes)

**Mode préventif** (Algicide, Stabilisant) :
- Pas de saisie — la dose est calculée directement sur le volume du profil piscine
- Card de résultat directement visible
- Note contextuelle expliquant la base de calcul

### Canvas de configuration

Zone de dessin plein écran avec SVG superposé au-dessus d'une grille de repère.

**États du canvas** :
1. *Vide* — grille visible, invite à importer ou dessiner
2. *Contour placé* — polygone éditable, vertices déplaçables
3. *Zones de profondeur* — contour figé, séparateurs de zones déplaçables, zones colorées par profondeur
4. *Calibrage* — ligne de calibrage lilas pastel semi-transparente avec deux endpoints, champ de saisie de distance réelle

**Barre d'étapes** (Step pills) : toujours visible. Étapes : Contour → Forme → Profondeurs → Calibrage. Cliquable pour naviguer entre les étapes déjà complétées.

**Loupe** : se déclenche automatiquement quand l'utilisateur maintient un doigt sur un point de contour ou un endpoint de calibrage (après 150ms de pression). Elle s'affiche au-dessus du doigt, montre un zoom ×3. La loupe suit le mouvement du doigt en temps réel. Disparaît au relâchement.

**Magnets** : actifs en mode "dessin manuel" uniquement. Force douce (~8px d'attraction) vers les bords de la forme détectée (si une photo/capture est disponible en fond). Pas de snap dur — l'utilisateur garde le contrôle.

**Toolbar flottante** (droite, centrée verticalement) : Sélection · Ajouter zone · Mode calibrage · Annuler · Ajuster zoom. Icônes thème-spécifiques (`{DESIGN.md.components.balnea}` vs `{DESIGN.md.components.brutale}`).

### Panneau contextuel bas (canvas)

Sheet arrondie `{DESIGN.md.rounded.sheet}` qui émerge du bas de l'écran. Son contenu change selon l'étape active :
- **Contour** : aide textuelle + bouton "Contour validé →"
- **Zones** : liste des zones avec swatches de profondeur + champs de valeur + "Ajouter zone"
- **Calibrage** : champ de saisie de distance réelle + confirmation

---

## State Patterns

### État vide (première ouverture)

L'onglet Dosage affiche un état vide invitant à configurer une première piscine. Call-to-action centré : "Configurer ma piscine". Pas d'illustration complexe — une phrase et un bouton.

### État "mesure non saisie"

Le panneau de saisie affiche le champ vide avec un placeholder discret (ex: "ex: 2800"). La card de résultat montre "—" à la place du calcul. Le CTA est désactivé (opacity 40%) tant que le champ est vide.

### État de succès (validation dosage)

Après tap sur "J'ai ajouté le sel" : micro-animation de confirmation (checkmark aqua qui pulse 1×, 300ms), la session est enregistrée en arrière-plan, le panneau se remet en état "non mesuré". Pas de toast, pas de modal — la confirmation est intégrée au geste.

### État hors-ligne

Aucun blocage. L'app fonctionne entièrement hors-ligne. Si un compte est connecté, une icône discrète dans le header indique que la synchronisation est en attente. Elle disparaît dès que la connexion revient, sans interaction requise.

### État de détection échouée (canvas)

Quand la détection automatique de contour (photo ou Maps) échoue à identifier une piscine : message court centré sur le canvas — "Détection impossible sur cette image — placez les 4 coins manuellement". Quatre points apparaissent aux coins du canvas, déplaçables. La forme en L détectée (partielle) est proposée comme point de départ si une détection partielle existe.

### État multi-piscines

Si l'utilisateur a plusieurs piscines configurées, un sélecteur pill apparaît dans le header de l'écran Dosage. Tap pour ouvrir une liste déroulante (bottom sheet). La dernière piscine utilisée est mémorisée entre les sessions.

---

## Interaction Primitives

| Primitive | Déclencheur | Comportement |
|---|---|---|
| **Pinch-to-zoom** | Deux doigts, canvas uniquement | Zoom natif, activé uniquement si l'appareil supporte les events multi-touch. Détection silencieuse, aucun fallback UI. |
| **Pan** | Drag sur zone vide du canvas | Déplacement du viewport. Limité aux bounds du contenu dessiné + 20% de marge. |
| **Drag de point** | Pression longue (150ms) + glissement | Déplace un vertex. Déclenche la loupe automatiquement. Magnets actifs si en mode dessin. |
| **Drag de séparateur de zone** | Drag sur ligne de séparation | Redécoupe les zones. Les valeurs de profondeur des zones adjacentes sont préservées. |
| **Tap sur segment de roue** | Tap simple (< 8px de déplacement) | Animation eased vers le produit tapé. Ignore les taps sur le centre (zone inactive). |
| **Drag de roue** | Glissement angulaire | Rotation libre. Snap animé au relâchement. |
| **Appui long sur logo** | 600ms sur le logo PoolDoz | Déclenche le morphing de transition inter-thème. Bloqué pendant la transition (~800ms). |
| **Double-tap sur canvas** | Double-tap zone vide | Reset zoom au viewport de départ (fit-to-content). |

### Morphing de thème (Balnéa ↔ Brutale)

Durée totale : 700–900ms. Séquence :
1. Les blobs Balnéa ralentissent leur morphing et se figent (200ms)
2. La palette chromatique effectue un fondu enchaîné global (400ms)
3. La typographie switche (instantané, dans le fondu)
4. Les icônes thème-spécifiques swappent (instantané)
5. Les blobs disparaissent / les angles de Brutale émergent (300ms)

`prefers-reduced-motion` : fondu simple de toute l'UI, 200ms, aucune animation intermédiaire.

---

## Accessibility Floor

### Contraste
Les ratios de contraste sont définis dans `{DESIGN.md.Colors}`. Les textes primaires (`ink` sur `cream`) atteignent ≥ 7:1. Les textes muted (`muted` sur `cream`) atteignent ≥ 4.5:1. En thème Brutale, les textes `white` sur `black` atteignent 19:1.

### Tailles de zones tactiles
- CTA principal : 52px minimum de hauteur, pleine largeur
- Boutons secondaires : 44px minimum
- Vertices du canvas : zone tactile 44×44px même si le point visuel est plus petit (hitbox étendue invisible)
- Segments de roue : la zone de tap s'étend sur toute la largeur du segment, pas seulement le texte

### Réduction de mouvement
`prefers-reduced-motion: reduce` désactive :
- Les animations de blobs (remplacées par formes statiques)
- Les animations de transition inter-thème (fondu simple)
- Le snap animé de la roue (snap instantané)
- Le count-up du volume (valeur finale affichée directement)
- Les vagues de l'écran climax

Les animations utilitaires (indicateur de chargement, pulse du dot de statut) sont preservées à vitesse réduite.

### Focus et navigation clavier
Les éléments interactifs principaux (cards, boutons, onglets de nav, champs) sont navigables au clavier avec focus visible (`shadow-glow` aqua sur Balnéa, border acid 2px sur Brutale). Le canvas n'est pas navigable au clavier dans cette version.

### Langue
Interface exclusivement en français. Les valeurs numériques utilisent le format français (virgule décimale : "47,3 m³", espace insécable comme séparateur de milliers : "3 200 ppm").

---

## Key Flows

### UJ-1 · Marc configure sa piscine pour la première fois

**Protagoniste** : Marc, propriétaire d'un pavillon avec piscine au sel. A hérité de la piscine avec la maison. Ne connaît pas son volume.

**Entrée** : App ouverte pour la première fois, aucun compte, aucun profil.

**Séquence** :

1. **Accueil onboarding** — Écran violet Balnéa. "Configurons votre piscine." Trois cards de méthode. Marc choisit "Depuis une photo" (recommandé).

2. **Capture** — L'app ouvre l'appareil photo natif. Marc recule jusqu'à la terrasse, cadre sa piscine. L'app reçoit la photo.

3. **Détection automatique** — Loader discret pendant l'analyse. Le contour détecté apparaît sur le canvas (polygone aqua). Marc voit sa piscine délimitée.

4. **Correction du contour (si besoin)** — Marc ajuste 1–2 vertices en glissant. La loupe se déclenche automatiquement. "Contour validé →".

5. **Zones de profondeur** — L'app propose 2 zones par défaut (petite plage + grand bain). Marc voit la piscine colorée du clair au foncé. Il ajuste le séparateur, entre 1,2 m puis 1,8 m. Il ajoute une troisième zone (pente) en faisant glisser le séparateur et en spécifiant les deux valeurs extrêmes.

6. **Calibrage** — L'app place une ligne lilas pastel sur le canvas. Marc la déplace entre les deux bords les plus longs qu'il connaît : 8,50 m. Il pince pour zoomer sur chaque endpoint, la loupe s'active pour la précision centimétrique. Il entre "8,50 m". L'app met à l'échelle instantanément.

7. **Climax** ← *Le moment le plus fort.*
   Marc voit l'écran climax. Le compteur monte de 0 à **47,3 m³** en 1,6 secondes. Les vagues elliptiques pulsent autour de la silhouette de sa piscine. La phrase apparaît : "Votre piscine n'a plus de secrets !" Le détail des zones confirme le calcul. Marc sait enfin.

8. **Prompt de compte** — Sous le volume : "Protégez ce profil — créez un compte pour ne jamais le perdre." Marc tape "Créer" (ou "Plus tard"). Si création : flux email rapide, les données sont synchronisées silencieusement.

9. **Résolution** — "Commencer à doser →". Marc arrive sur l'écran Dosage, roue positionnée sur Sel (suggestion par défaut au premier usage).

---

### UJ-2 · Marc vérifie et corrige son sel en début de saison

**Protagoniste** : Marc, mai, ouverture de saison. Testeur à la main.

**Entrée** : App ouverte. Profil piscine "Terrasse" déjà configuré. Bannière de suggestion : "Sel suggéré — taux bas depuis votre dernière mesure."

**Séquence** :

1. **Reconnaissance** — Marc ouvre l'onglet Dosage. La roue est pré-positionnée sur Sel (suggestion basée sur l'historique). La bannière confirme le contexte.

2. **Saisie** — Marc entre 2800 dans le champ ppm. La jauge à galets s'anime — les galets peach montrent le déficit. La card de résultat s'affiche immédiatement : **14,2 kg**.

3. **Lecture** — Marc lit : "1 sac 10 kg + 1 sac 5 kg." Il n'a pas besoin de calculer. Il sait ce qu'il achète.

4. **Action** — Marc verse les sacs. Il tape le CTA : "J'ai ajouté le sel." Micro-animation de confirmation. La session est enregistrée.

**Climax** : Marc sort de l'app sans avoir fait aucun calcul. Une seule session. Pas d'itération.

---

## Responsive & Platform

L'app ne définit pas de breakpoints. Elle est conçue pour l'écran de téléphone (375–430px de large) et s'étend naturellement sur tablette. Sur tablette :
- Le canvas bénéficie de plus d'espace — les zones de profondeur sont plus lisibles, les vertices plus faciles à placer
- Les panneaux de saisie restent en bas comme sur mobile
- Aucune mise en page à deux colonnes n'est définie dans cette version

Le pinch-to-zoom est activé si et seulement si l'appareil supporte les événements multi-touch. Aucun fallback, aucune UI de remplacement — la détection est silencieuse.

---

## Système de thèmes

Le double thème est une fonctionnalité produit différenciante, pas un dark mode. Les deux thèmes sont des personnalités visuelles complètes avec leurs propres couleurs, typographies, icônes et physiques d'animation.

### Révélation à l'onboarding

Lors du premier lancement, après la sélection de la méthode de configuration, l'app affiche un beat dédié : le logo PoolDoz s'anime brièvement (scale 1.05, 400ms), un hint textuel apparaît sous lui — "Appui long sur le logo pour changer d'ambiance" — et disparaît après 3 secondes. Ce beat n'est affiché qu'une seule fois.

### Déclenchement

Appui long (600ms) sur le logo PoolDoz, présent dans le header de chaque écran principal. Disponible en permanence après l'onboarding, sans rappel.

### Stockage

Le thème sélectionné est stocké localement (localStorage / AsyncStorage). Il n'est pas lié au compte — c'est un choix par appareil.

### Icônes thème-spécifiques

Chaque thème a son propre jeu d'icônes SVG :
- **Balnéa** : traits doux, style filled, coins arrondis, légèrement plus épais en bas (profondeur)
- **Brutale** : monoline épaisse (2–3px), angles droits ou à 45°, style outline agressif

Les icônes swappent pendant la transition de thème, dans la fenêtre du fondu.
