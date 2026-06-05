---
title: PoolDoz Design System
status: final
created: 2026-06-03
updated: 2026-06-03
themes:
  default: balnea
  alternate: brutale
colors:
  balnea:
    ink: "#1A0E2E"
    violet: "#2D1B69"
    violet-mid: "#3D2888"
    aqua: "#3DB8B8"
    aqua-deep: "#2A9090"
    peach: "#FF7E5F"
    cream: "#FFF4EE"
    surface: "#EDE3F8"
    muted: "#8B7BA8"
    faint: "rgba(26,14,46,0.07)"
    depth-shallow: "#B8E8E8"
    depth-mid: "#6ABABA"
    depth-slope: "#3D7AB8"
    depth-deep: "#1A3A60"
    calibration: "rgba(190,150,230,0.65)"
  brutale:
    black: "#0A0A0A"
    white: "#F5F5F5"
    acid: "#D4FF00"
    red: "#FF2D00"
    mid-gray: "#555555"
    dark-gray: "#1E1E1E"
    border: "#333333"
typography:
  balnea:
    display: "Lora"
    display-weights: "600, 700, italic 400, italic 700"
    ui: "Plus Jakarta Sans"
    ui-weights: "400, 500, 600, 700"
  brutale:
    display: "Barlow Condensed"
    display-weights: "700, 900, italic 900"
    ui: "IBM Plex Mono"
    ui-weights: "400, 700"
rounded:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "28px"
  card: "22px"
  sheet: "28px"
  phone: "40px"
  full: "9999px"
spacing:
  unit: "4px"
  scale: [4, 8, 10, 12, 14, 16, 20, 24, 28, 32, 48, 64]
  page-h: "20px"
  safe-top: "52px"
  safe-bottom: "28px"
components:
  balnea:
    cta-primary: "gradient aqua→aqua-deep, rounded-xl, shadow aqua 24px, breathe animation"
    card: "white bg, rounded-card, shadow violet 6%"
    card-dark: "violet-mid bg, rounded-card, blob deco animated"
    badge: "bg faint, color muted, rounded-full, uppercase 9px tracking-2"
    gauge-pebble: "flex row of rounded pills, colored by status"
    blob-deco: "position absolute, morphing border-radius 8–12s ease-in-out infinite"
  brutale:
    cta-primary: "acid bg, ink text, no radius, italic Barlow Condensed, arrow →"
    card: "black bg, 1px border dark-gray, no radius"
    badge: "acid bg, ink text, uppercase, letter-spacing 2px"
    gauge-fill: "repeating horizontal stripes red, 6px/2px"
---

## Brand & Style

PoolDoz est une application web mobile-first (puis native) pour propriétaires de piscines au sel. Son positionnement : **ultra-automatisation estivale** — l'app fait le travail à la place de l'utilisateur, sans friction, au bord de la piscine.

L'identité visuelle rompt délibérément avec l'esthétique des apps générées par IA. Aucun template recyclé. Deux personnalités visuelles complètes et opposées cohabitent dans le même code — l'utilisateur choisit la sienne lors de l'onboarding, et peut en changer par appui long sur le logo à tout moment.

### Balnéa — thème par défaut

**Ambiance : Méditerranée contemporaine.** Violet profond et aqua turquoise — combinaison inédite dans l'espace des apps piscine. Formes organiques vivantes, typographie serif éditoriale. L'app respire, ondule, célèbre.

- Chaud et estival sans être criard
- Sérieux sans être froid
- Premium sans être inaccessible

### Brutale — thème alternatif

**Ambiance : Anti-slop radical.** Fond noir, typographie condensée géante, accent jaune acide. Aucune rondeur, aucun compromis. Les chiffres dominent. Les couleurs tranchent.

- Pour les utilisateurs qui veulent que leur app reflète leur caractère
- Contraste maximal, lisibilité extrême en plein soleil
- Physique d'animation propre : accélérations fortes, arrêts brutaux

---

## Colors

### Balnéa

| Token | Valeur | Usage |
|---|---|---|
| `ink` | `#1A0E2E` | Texte principal |
| `violet` | `#2D1B69` | Header, surfaces primaires, nav active |
| `violet-mid` | `#3D2888` | Cards sombres (prescription, roue) |
| `aqua` | `#3DB8B8` | Accent principal, CTA, indicateurs actifs |
| `aqua-deep` | `#2A9090` | Gradient de fin des CTA, états focus |
| `peach` | `#FF7E5F` | Alertes, statut "taux bas/haut", badges |
| `cream` | `#FFF4EE` | Background principal |
| `surface` | `#EDE3F8` | Background ambient hors-app |
| `muted` | `#8B7BA8` | Textes secondaires, labels, placeholders |
| `faint` | `rgba(26,14,46,0.07)` | Surfaces légères, séparateurs |

#### Palette de profondeur (canvas uniquement)

| Token | Valeur | Profondeur |
|---|---|---|
| `depth-shallow` | `#B8E8E8` | < 1,2 m — zone peu profonde |
| `depth-mid` | `#6ABABA` | Intermédiaire |
| `depth-slope` | `#3D7AB8` | Zone en pente |
| `depth-deep` | `#1A3A60` | > 1,8 m — grand bain |
| `calibration` | `rgba(190,150,230,0.65)` | Ligne de calibrage uniquement — lilas pastel semi-transparent, intentionnellement ambigu visuellement |

### Brutale

| Token | Valeur | Usage |
|---|---|---|
| `black` | `#0A0A0A` | Background principal |
| `white` | `#F5F5F5` | Texte principal, surfaces |
| `acid` | `#D4FF00` | Accent unique — CTA, sélection active, données clés |
| `red` | `#FF2D00` | Verdict négatif, chiffre central de statut |
| `mid-gray` | `#555555` | Textes secondaires |
| `dark-gray` | `#1E1E1E` | Surfaces de séparation |
| `border` | `#333333` | Toutes les bordures |

---

## Typography

### Balnéa

**Lora** (Google Fonts) — Serif contemporain. Letterforms clairs et lisibles. Les italiques sont expressives et constituent la signature visuelle des grands nombres et des titres.

| Usage | Style | Taille | Poids |
|---|---|---|---|
| Hero chiffres (volume, dosage) | Lora italic | 44–72px | 700 |
| Titres d'écran | Lora | 22–30px | 700 |
| Logo — "Doz" | Lora italic | 20–28px | 700 |
| Phrases-clés, taglines | Lora italic | 16–18px | 400 |

**Plus Jakarta Sans** — Sans-serif géométrique pour toute l'UI opérationnelle.

| Usage | Taille | Poids |
|---|---|---|
| Labels uppercase | 9–11px | 600–700, letter-spacing 1.5–3px |
| Corps, descriptions | 12–13px | 400 |
| Boutons | 14–16px | 700 |
| Valeurs numériques UI | 20–32px | 700 |

### Brutale

**Barlow Condensed** — Condensée musclée, toujours uppercase en affichage, italic pour les CTA.

| Usage | Taille | Poids |
|---|---|---|
| Chiffre central (statut, volume) | 72–96px | 900 |
| Titres, verdicts | 22–32px | 900 italic |
| CTA | 24–28px | 700 italic |

**IBM Plex Mono** — Métadonnées, labels techniques.

| Usage | Taille | Poids |
|---|---|---|
| Labels uppercase | 8–10px | 700, letter-spacing 2–3px |
| Valeurs numériques | 12–14px | 400 |

---

## Layout & Spacing

Mobile-first. Pas de breakpoints définis. Le canvas et les surfaces exploitent naturellement l'espace supplémentaire sur tablette.

| Paramètre | Valeur |
|---|---|
| Marges horizontales | 20px |
| Safe area top | 52px |
| Safe area bottom | 24–32px |
| Gap entre cards | 10–14px |
| Padding interne card | 16–22px |
| Hauteur CTA | 52–56px |
| Hauteur nav bar | 60px + safe area |

**Scale de spacing (base 4px) :** `4 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 48 · 64`

---

## Elevation & Depth

### Balnéa — ombres teintées violet/aqua

| Token | Valeur | Usage |
|---|---|---|
| `shadow-xs` | `0 2px 8px rgba(45,27,105,0.07)` | Cards repos |
| `shadow-sm` | `0 2px 14px rgba(45,27,105,0.07)` | Cards interactives |
| `shadow-md` | `0 4px 20px rgba(45,27,105,0.12)` | Cards survol |
| `shadow-cta` | `0 8px 24px rgba(61,184,184,0.30)` | CTA button |
| `shadow-xl` | `0 20px 60px rgba(45,27,105,0.22)` | Phone shell, modals |
| `shadow-glow` | `0 0 0 3px rgba(61,184,184,0.2)` | Focus, éléments actifs |

### Brutale — aucune ombre portée diffuse

Pas de `box-shadow` flou dans Brutale. La profondeur est indiquée par les bordures et la couleur uniquement. Exception : `box-shadow: 4px 4px 0 var(--black)` (ombre décalée géométrique) pour les CTA.

---

## Shapes

### Balnéa — blobs organiques animés

Les blobs sont des `div` avec `border-radius` à 8 valeurs, animé entre 3 keyframes en boucle (`ease-in-out infinite`, 8–12s). Toujours en `position: absolute`, en fond de scène, `pointer-events: none`, opacity 0.18–0.25. Maximum 2 blobs par écran.

**Courbe de header** : SVG path Bézier cubique convexe vers le bas, `fill` = `{colors.balnea.cream}`.

```
M0,0 C90,50 285,50 375,0 L375,50 L0,50 Z
```

### Brutale — géométrie dure

`border-radius: 0` partout. Seule exception tolérée : pills de statut (2–4px). La rigueur géométrique est absolue.

---

## Components

### Roue de sélection produit

SVG circulaire rotatif. Produits disposés en cercle, espacement uniforme (360°/N). Fenêtre de sélection fixe à 12h, encadrée par des arcs `{colors.balnea.aqua}`. Le centre affiche l'icône et le nom du produit actif.

**Easing Balnéa :** `cubic-bezier(0.33, 1, 0.68, 1)` — départ rapide, arrêt doux. 320–420ms.
**Easing Brutale :** `cubic-bezier(0.7, 0, 1, 0.3)` puis snap instantané. ~300ms.

### Jauge à galets (pebble gauge)

Rangée de pilules horizontales `{rounded.full}`. Colorées de gauche à droite selon le remplissage. Marqueur vertical thin (2–3px) en `{colors.balnea.aqua}` indique la cible. Galets avant marqueur : colorés (peach = bas, aqua = optimal, rouge = excès). Galets après marqueur : `{colors.balnea.faint}`.

### Blob card (prescription)

Background `{colors.balnea.violet-mid}`. Blob de décoration `{colors.balnea.aqua}` en `position: absolute`, bottom-right, animé (`float` 6–7s). Utilisée exclusivement pour les informations de prescription à afficher en plein soleil — contraste élevé garanti.

### Step pills bar

Barre horizontale de 4 pills maximum sous le header. États : `done` (aqua 20% bg, aqua text), `active` (aqua solid, white text), `todo` (white 8% bg, white 40% text). Non scrollable. Hauteur fixe ~40px.

### Animation breathe (CTA principal)

```css
@keyframes breathe {
  0%, 100% { box-shadow: 0 8px 24px rgba(61,184,184,0.28); }
  50%       { box-shadow: 0 8px 32px rgba(61,184,184,0.52); }
}
animation: breathe 3s ease-in-out infinite;
```

Désactivée pendant l'interaction (`:hover`, `:active`). Supprimée si `prefers-reduced-motion`.

---

## Do's and Don'ts

### Do's

- **Lora italic pour les grands nombres** — c'est la signature Balnéa.
- **Blobs en animation continue** — l'app vit même quand l'utilisateur ne fait rien.
- **Profondeur = gradient du clair au foncé** — métaphore aquatique immédiatement compréhensible.
- **Chaque thème = système complet** — tokens, icônes, easing. Zéro mélange inter-thème.
- **Calibration line toujours en `calibration`** — jamais en orange vif, jamais en aqua.

### Don'ts

- **Ne jamais utiliser Fraunces** — letterforms trop décalées, illisibles (rejetée par le fondateur).
- **Ne jamais ajouter d'ombres diffuses dans Brutale** — contredit la philosophie du thème.
- **Ne jamais dépasser 2 blobs par écran** — au-delà, l'organique devient du bruit.
- **Ne jamais afficher le prompt compte avant l'écran climax** — il appartient exclusivement au moment du volume calculé.
- **Ne jamais bloquer l'accès sans compte** — l'app est local-first, "Plus tard" est toujours accessible.
