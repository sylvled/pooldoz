---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-06-04'
inputDocuments:
  - planning-artifacts/prds/prd-pooldoz-2026-06-03/prd.md
  - planning-artifacts/architecture.md
  - planning-artifacts/ux-designs/ux-pooldoz-2026-06-03/DESIGN.md
  - planning-artifacts/ux-designs/ux-pooldoz-2026-06-03/EXPERIENCE.md
---

# PoolDoz - Epic Breakdown

## Overview

Ce document fournit la décomposition complète en épics et stories pour PoolDoz, en décomposant les requirements du PRD, de l'UX Design et de l'Architecture en stories implémentables.

## Requirements Inventory

### Functional Requirements

FR-1: Mode sans compte — données profil dans IndexedDB/localStorage, accessibles à la réouverture du navigateur sur le même appareil
FR-2: Avertissement persistant visible sur toutes les pages principales pour utilisateur non connecté + bouton "Créer un compte" menant au formulaire
FR-3: Inscription email/mot de passe (≥ 8 caractères), email de confirmation, connexion, déconnexion — erreur explicite si identifiants incorrects
FR-4: Synchronisation cloud pour utilisateurs connectés — profils accessibles depuis n'importe quel appareil, suppression reflétée sur tous les appareils
FR-5: Liste des piscines à l'ouverture — nom et volume calculé. Si une seule piscine, sélection directe sans afficher la liste.
FR-6: Création et suppression de profil piscine avec confirmation explicite — suppression irréversible
FR-7: Mode dessin manuel — tracé du contour point par point, déplacement/suppression de points, fermeture automatique, snap aux angles droits optionnel
FR-8: Mode photo — accès caméra (input capture="environment"), correction de perspective, détection automatique de contours, LiDAR sur appareils compatibles (iPhone 12 Pro+)
FR-9: Mode capture d'écran Maps — import JPEG/PNG, détection automatique de contours, basculement vers FR-10 si échec
FR-10: Fallback placement manuel — message explicite, placement libre de points, forme partielle proposée si détection partielle existante
FR-11: Calibrage par cote unique — segment tracé sur le plan entre deux points connus, saisie de la distance réelle → mise à l'échelle de l'intégralité du plan, recalibrage possible à tout moment
FR-12: Zones de profondeur — délimitation de zones sur le plan, profondeur unique (fond plat) ou deux valeurs (bord A + bord B = pan incliné), couverture obligatoire 100% du plan avant validation
FR-13: Calcul automatique du volume en m³ avec deux décimales — interpolation linéaire pour pans inclinés, recalcul automatique à chaque modification du plan ou des zones
FR-14: Sélection du produit parmi 7 : Sel, Chlore, pH+, pH−, TAC, Algicide, Stabilisant — chaque produit affiche son unité appropriée
FR-15: Valeurs cibles par défaut par produit (sel 3200 PPM, pH 7.4, chlore 1.5 mg/L), modifiables et mémorisées par profil, bouton "Réinitialiser" disponible
FR-16: Calcul du dosage — résultat en kg/litres avec une décimale + décomposition en conditionnements courants (sacs 5/10/25 kg, flacons). "Aucun ajout nécessaire" si taux ≥ cible.
FR-17: Score visuel vert/orange/rouge affiché de façon proéminente avant le détail du calcul (vert ±5% cible, orange hors plage, rouge critique)
FR-18: Bannière de rappel saisonnier (mai ouverture, septembre hivernage) — affichée si aucune session depuis 6+ mois, dismissable, non-répétable avant le cycle suivant
FR-19: Détection automatique de la langue navigateur/système — FR/EN supportées en V1, fallback anglais si langue non supportée, changement manuel possible dans les réglages
FR-20: Toutes les mesures en unités métriques (m, m³, kg, mg/L) — aucune unité impériale en V1

### NonFunctional Requirements

NFR-1: Web responsive PWA — utilisable depuis navigateur mobile sans installation, interface optimisée usage extérieur (contraste élevé, boutons ≥ 44px)
NFR-2: Accès caméra demandé uniquement au moment où l'utilisateur choisit le mode photo (pas au lancement)
NFR-3: Performance — calculs de volume et dosage < 200ms côté client
NFR-4: Sécurité — toutes communications HTTPS (Nginx TLS), mots de passe hashés bcrypt via GoTrue, JWT en mémoire (pas localStorage)
NFR-5: RGPD — données personnelles hébergées en Union Européenne (serveur perso), politique de confidentialité accessible depuis l'app, suppression compte + toutes données possible (ON DELETE CASCADE)
NFR-6: i18n — architecture code supporte ajout de nouvelles langues sans modification structurelle (i18next namespaces)
NFR-7: Compatibilité — Safari iOS + Chrome Android obligatoires en V1
NFR-8: Offline — app 100% fonctionnelle sans réseau (calculs, canvas, consultation profil, saisie dosage)

### Additional Requirements

AR-1: Starter template — `npm create vite@latest pooldoz -- --template react-ts` (Epic 1, Story 1 obligatoire)
AR-2: Supabase self-hosted via Docker Compose — PostgreSQL + GoTrue Auth + PostgREST + Storage (region EU)
AR-3: Docker Compose global — services frontend (Nginx), cv-api (FastAPI+OpenCV), stack Supabase
AR-4: CI/CD GitHub Actions — lint (ESLint) + tests (Vitest) + déploiement SSH automatique sur push main (`docker compose pull && docker compose up -d`)
AR-5: Schéma PostgreSQL avec RLS activé sur toutes les tables (user_id = auth.uid())
AR-6: ON DELETE CASCADE sur toutes les relations user_id — suppression compte = suppression complète (RGPD)
AR-7: Sync local↔cloud : write-local-first → sync-background-async via lib/sync.ts — jamais bloquant, last-write-wins sur updatedAt
AR-8: CV API FastAPI — endpoint POST /detect-contours, timeout 8s côté client, fallback Canny JS Web Worker si inaccessible
AR-9: Fonts auto-hébergées woff2 — Lora, Plus Jakarta Sans, Barlow Condensed, IBM Plex Mono (aucun appel CDN en production)
AR-10: Route /privacy + PrivacyScreen.tsx — politique de confidentialité accessible depuis l'app (RGPD §7 PRD)

### UX Design Requirements

UX-DR1: Dual-theme system complet (Balnéa/Brutale) — swap via attribut data-theme="balnea|brutale" sur <html>, CSS variables uniquement, zéro mélange inter-thème
UX-DR2: Tokens CSS Balnéa — palette complète (ink, violet, violet-mid, aqua, aqua-deep, peach, cream, surface, muted, faint) + palette profondeur canvas (depth-shallow, depth-mid, depth-slope, depth-deep, calibration)
UX-DR3: Tokens CSS Brutale — palette complète (black, white, acid, red, mid-gray, dark-gray, border)
UX-DR4: Typographie Balnéa — Lora italic pour grands nombres (44–72px, 700), Plus Jakarta Sans pour UI (labels uppercase 9–11px tracking, corps 12–13px, boutons 14–16px 700)
UX-DR5: Typographie Brutale — Barlow Condensed 900 uppercase pour chiffres centraux (72–96px) et titres, IBM Plex Mono 700 uppercase pour labels
UX-DR6: Roue SVG circulaire rotative 7 produits — drag libre, snap animé au relâchement (Balnéa easeOutCubic 320–420ms, Brutale easeInQuart + snap instantané ~300ms), tap direct sur segment, suggestion auto basée sur historique, fenêtre fixe à 12h
UX-DR7: Jauge à galets PebbleGauge — rangée de pills horizontales rounded-full, colorées de gauche à droite par remplissage, marqueur vertical thin (2–3px) indique la cible
UX-DR8: Canvas SVG interactif — ContourLayer (polygone éditable, vertices déplaçables), DepthZonesLayer (séparateurs glissants, zones colorées par profondeur), CalibrationLayer (ligne lilas pastel semi-transparente, deux endpoints)
UX-DR9: Loupe ×3 — déclenchée après 150ms de pression sur vertex ou endpoint, suit le doigt en temps réel, disparaît au relâchement
UX-DR10: Magnets doux (~8px d'attraction) sur dessin manuel si image de fond disponible — force douce, pas de snap dur
UX-DR11: Toolbar flottante canvas (droite, centrée verticalement) — 5 actions : Sélection, Ajouter zone, Mode calibrage, Annuler, Ajuster zoom
UX-DR12: Animations Balnéa — breathe CTA (3s ease-in-out infinite, shadow aqua 28→52px), blob morphing animé (8–12s ease-in-out infinite, border-radius 8 valeurs, max 2 blobs/écran, opacity 0.18–0.25)
UX-DR13: Animations Brutale — ombre décalée géométrique CTA (4px 4px 0 var(--black)), aucune ombre diffuse
UX-DR14: Morphing inter-thème (700–900ms total) — séquence : blobs figent (200ms) → fondu palette (400ms) → typo swap (instantané dans fondu) → icônes swap (instantané) → géométrie Brutale émerge (300ms)
UX-DR15: prefers-reduced-motion — désactiver : animations blobs, morphing thème, snap animé roue, count-up volume, vagues climax. Conserver indicateurs utilitaires à vitesse réduite.
UX-DR16: Accessibilité — contraste ≥ 7:1 texte primaire (ink sur cream), ≥ 4.5:1 texte muted, 19:1 Brutale. Zones tactiles ≥ 44×44px, CTA hauteur min 52px pleine largeur. Focus visible (shadow-glow aqua Balnéa, border acid 2px Brutale).
UX-DR17: Écran climax volume — count-up 0→volume en 1,6s (désactivé si prefers-reduced-motion), vagues elliptiques pulsantes autour de la silhouette piscine, phrase "Votre piscine n'a plus de secrets !"
UX-DR18: Beat découverte thème — affiché une seule fois à l'onboarding (scale logo 1.05 400ms + hint textuel 3s), appui long 600ms sur logo permanent ensuite, bloqué ~800ms pendant transition
UX-DR19: Navigation bottom bar 4 onglets (Dosage | Piscine | Journal | Réglages) — hauteur 60px + safe area bottom, nav active = violet Balnéa / acid Brutale
UX-DR20: État offline — icône discrète sync-pending dans header si compte connecté, disparaît sans interaction au retour connexion
UX-DR21: Sélecteur multi-piscines — pill dans header écran Dosage si plusieurs piscines, bottom sheet au tap, dernière piscine mémorisée
UX-DR22: Step pills bar canvas — 4 pills horizontales (Contour→Forme→Profondeurs→Calibrage), états done/active/todo, hauteur ~40px, cliquable vers étapes déjà complétées
UX-DR23: Bottom sheet canvas (rounded-sheet 28px) — contenu contextuel par étape : Contour (aide + CTA), Zones (liste swatches + champs valeur), Calibrage (champ distance + confirmation)
UX-DR24: Panneau dosage mode mesure — champ numérique + unité, jauge galets colorée, valeur cible affichée, card résultat dose + conditionnements
UX-DR25: Panneau dosage mode préventif (Algicide, Stabilisant) — pas de saisie, dose calculée directement sur volume profil, note contextuelle base de calcul
UX-DR26: Confirmation dosage — micro-animation checkmark aqua pulse 1× (300ms), pas de toast ni modal, session enregistrée en arrière-plan, panneau revient en état "non mesuré"
UX-DR27: Icônes thème-spécifiques — deux jeux SVG distincts : Balnéa (traits doux filled coins arrondis), Brutale (monoline 2–3px outline angles droits/45°), swap pendant la transition de thème

### FR Coverage Map

FR-1 : Epic 4 — Mode sans compte (données locales Dexie)
FR-2 : Epic 4 — Avertissement persistant non-connecté
FR-3 : Epic 4 — Inscription / connexion / déconnexion
FR-4 : Epic 4 — Synchronisation cloud multi-appareils
FR-5 : Epic 2 (création profil) + Epic 5 (liste piscines complète)
FR-6 : Epic 2 — Suppression de profil avec confirmation
FR-7 : Epic 2 — Mode dessin manuel (polygone éditable)
FR-8 : Epic 2 — Mode photo (correction perspective + détection contours)
FR-9 : Epic 2 — Mode capture Maps (détection contours)
FR-10 : Epic 2 — Fallback placement manuel 4 points
FR-11 : Epic 2 — Calibrage par cote unique → mise à l'échelle
FR-12 : Epic 2 — Zones de profondeur (fond plat + pan incliné)
FR-13 : Epic 2 — Calcul automatique du volume en m³
FR-14 : Epic 3 — Sélection du produit (7 produits, roue rotative)
FR-15 : Epic 3 (valeurs par défaut) + Epic 5 (valeurs modifiables)
FR-16 : Epic 3 — Calcul dosage + décomposition conditionnements
FR-17 : Epic 3 — Score visuel vert/orange/rouge
FR-18 : Epic 3 — Bannière rappel saisonnier (mai/septembre)
FR-19 : Epic 5 — Détection langue + changement manuel
FR-20 : Epic 5 — Unités métriques exclusivement

## Epic List

### Epic 1 : Fondation & Infrastructure
L'application PoolDoz tourne sur le serveur perso, le pipeline de déploiement est actif, les deux thèmes (Balnéa/Brutale) sont fonctionnels avec leurs tokens CSS complets, et la navigation shell est en place.
**Requirements couverts :** NFR-1, NFR-4, NFR-7, AR-1, AR-2, AR-3, AR-4, AR-9, AR-10, UX-DR1–5, UX-DR12–16, UX-DR18–19, UX-DR27

### Epic 2 : Configurer ma piscine
Marc peut dessiner ou photographier sa piscine, définir ses zones de profondeur, calibrer les dimensions réelles, et obtenir son volume exact pour la première fois — c'est le climax du produit.
**FRs couverts :** FR-5 (création), FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13
**Requirements additionnels :** AR-8, UX-DR8–11, UX-DR17, UX-DR22–23

### Epic 3 : Doser mes produits
Marc peut sélectionner un produit chimique (suggéré automatiquement par l'historique), saisir son taux mesuré, obtenir son dosage exact avec décomposition en sacs/flacons, et être rappelé en début et fin de saison.
**FRs couverts :** FR-14, FR-15 (valeurs par défaut), FR-16, FR-17, FR-18
**Requirements additionnels :** NFR-3, UX-DR6–7, UX-DR21, UX-DR24–26

### Epic 4 : Mon compte & Synchronisation
Marc peut créer un compte email/mot de passe, protéger ses profils piscine dans le cloud, et les retrouver sur n'importe quel appareil — sans jamais bloquer l'usage hors ligne.
**FRs couverts :** FR-1, FR-2, FR-3, FR-4
**Requirements additionnels :** AR-5, AR-6, AR-7, NFR-5, NFR-8, UX-DR20

### Epic 5 : Journal, Réglages & Mise en production
Marc peut consulter son historique de sessions de dosage, personnaliser ses valeurs cibles par produit, changer la langue de l'interface, et l'app est conforme RGPD avec politique de confidentialité accessible.
**FRs couverts :** FR-5 (liste piscines), FR-15 (modification valeurs cibles), FR-19, FR-20
**Requirements additionnels :** NFR-6, AR-10

---

## Epic 1 : Fondation & Infrastructure

L'application PoolDoz tourne sur le serveur perso, le pipeline de déploiement est actif, les deux thèmes (Balnéa/Brutale) sont fonctionnels avec leurs tokens CSS complets, et la navigation shell est en place.

### Story 1.1 : Initialisation du projet & configuration PWA

En tant que développeur,
je veux initialiser le projet PoolDoz avec Vite + React + TypeScript et le configurer comme PWA,
afin d'avoir une base solide et déployable dès le départ.

**Acceptance Criteria:**

**Given** le répertoire projet est vide
**When** `npm create vite@latest pooldoz -- --template react-ts` est exécuté et les dépendances installées (`vite-plugin-pwa`, `zustand`, `dexie`, `dexie-react-hooks`, `react-router-dom`, `i18next`, `react-i18next`, `vitest`, `@testing-library/react`)
**Then** `npm run dev` démarre sans erreur
**And** `npm run build` produit un bundle optimisé dans `dist/`
**And** `vite.config.ts` inclut vite-plugin-pwa avec manifest (name: "PoolDoz", display: "standalone", theme_color: "#2D1B69")
**And** `public/manifest.webmanifest` est présent avec icônes PWA 192×192 et 512×512
**And** ESLint est configuré et `npm run lint` passe sans erreur
**And** `.env.example` documente `VITE_SUPABASE_URL` et `VITE_CV_API_URL`

---

### Story 1.2 : Tokens CSS dual-theme & typographie auto-hébergée

En tant que développeur,
je veux que les tokens CSS complets des thèmes Balnéa et Brutale soient définis et les fonts hébergées localement,
afin que tous les composants utilisent un styling cohérent sans dépendance CDN.

**Acceptance Criteria:**

**Given** `src/styles/tokens.css` est importé dans `main.tsx`
**When** le thème Balnéa est actif (défaut)
**Then** toutes les variables CSS sont disponibles : `--ink`, `--aqua`, `--cream`, `--violet`, `--violet-mid`, `--aqua-deep`, `--peach`, `--surface`, `--muted`, `--faint`, `--depth-shallow`, `--depth-mid`, `--depth-slope`, `--depth-deep`, `--calibration`

**Given** `data-theme="brutale"` est appliqué sur `<html>`
**When** les variables sont lues
**Then** les tokens Brutale surchargent les Balnéa (`--ink: #0A0A0A`, `--acid: #D4FF00`, etc.)
**And** aucune valeur de couleur hardcodée ne subsiste dans `global.css`

**Given** `assets/fonts/` contient Lora, Plus Jakarta Sans, Barlow Condensed, IBM Plex Mono en woff2
**When** l'app charge en production
**Then** aucune requête vers un CDN externe n'est émise pour les fonts

---

### Story 1.3 : Schéma Dexie & store settings

En tant qu'utilisateur,
je veux que mon choix de thème et de langue soit mémorisé entre les sessions,
afin de retrouver mon environnement visuel à chaque ouverture de l'app.

**Acceptance Criteria:**

**Given** `src/lib/db.ts` définit une instance Dexie avec la table `settings`
**When** l'app s'ouvre pour la première fois
**Then** la table `settings` est créée dans IndexedDB avec les champs `theme`, `langue`, `dernierePiscineId`

**Given** `src/store/settings.store.ts` expose `theme`, `langue`, `setTheme`, `setLangue`
**When** `setTheme('brutale')` est appelé
**Then** `data-theme="brutale"` est appliqué sur `<html>` immédiatement
**And** la valeur est persistée dans Dexie
**And** au rechargement de la page, le thème Brutale est restauré automatiquement

---

### Story 1.4 : Navigation shell & routing

En tant qu'utilisateur,
je veux naviguer entre les 4 sections principales (Dosage, Piscine, Journal, Réglages),
afin d'accéder à n'importe quelle fonctionnalité depuis n'importe où dans l'app.

**Acceptance Criteria:**

**Given** l'app est ouverte sur n'importe quel écran principal
**When** je regarde le bas de l'écran
**Then** la NavBar est visible avec 4 onglets : Dosage, Piscine, Journal, Réglages
**And** la hauteur est 60px + safe area bottom
**And** l'onglet actif est mis en évidence (fond violet Balnéa / acid Brutale)

**Given** `src/router.tsx` définit les routes `/`, `/piscine`, `/journal`, `/reglages`, `/onboarding`, `/privacy`
**When** je navigue entre les onglets
**Then** la transition est instantanée sans rechargement de page
**And** les écrans non encore implémentés affichent un placeholder vide sans erreur console

---

### Story 1.5 : Animations, icônes & morphing inter-thème

En tant qu'utilisateur,
je veux que l'app soit visuellement vivante et pouvoir changer de thème par appui long sur le logo,
afin de profiter d'une expérience visuelle cohérente et personnalisable.

**Acceptance Criteria:**

**Given** le thème Balnéa est actif et le CTA principal est visible
**When** aucune interaction n'a lieu
**Then** l'animation breathe est active (shadow aqua oscillant 28px→52px, 3s ease-in-out infinite)
**And** au maximum 2 blobs sont visibles par écran (opacity 0.18–0.25, morphing border-radius 8–12s)

**Given** `prefers-reduced-motion: reduce` est activé dans le système
**When** n'importe quelle animation serait déclenchée
**Then** les blobs sont statiques, le morphing de thème est un fondu simple 200ms, toutes les animations de transition sont désactivées

**Given** je fais un appui long (600ms) sur le logo PoolDoz
**When** la transition démarre
**Then** la séquence s'exécute en 700–900ms : blobs figent (200ms) → fondu palette (400ms) → typo + icônes swappent → géométrie émerge (300ms)
**And** le logo est non interactif pendant ~800ms (cooldown)
**And** les icônes de la NavBar swappent entre `assets/icons/balnea/` et `assets/icons/brutale/`

---

### Story 1.6 : Docker Compose & CI/CD GitHub Actions

En tant que développeur,
je veux que la stack Docker complète et le pipeline CI/CD soient configurés,
afin que chaque push sur `main` soit automatiquement testé et déployé sur le serveur perso.

**Acceptance Criteria:**

**Given** `docker-compose.yml` à la racine avec les Dockerfiles frontend et cv-api
**When** `docker compose up -d` est exécuté sur le serveur
**Then** les services `frontend` (Nginx), `cv-api` (FastAPI squelette), et la stack Supabase (db, auth, rest, storage, studio) démarrent sans erreur
**And** l'app est accessible via Nginx sur port 80/443

**Given** `.github/workflows/deploy.yml` est configuré avec les secrets SSH
**When** un push est fait sur `main`
**Then** ESLint + Vitest s'exécutent — le pipeline échoue si l'un est en erreur
**And** si les deux passent, `docker compose pull && docker compose up -d` s'exécute automatiquement sur le serveur

**Given** `supabase/migrations/001_init_schema.sql` est appliqué
**When** les migrations s'exécutent
**Then** les tables `piscines`, `sessions`, `profiles` sont créées avec RLS activé (`user_id = auth.uid()`) et `ON DELETE CASCADE`

---

### Story 1.7 : Accessibilité base & page /privacy

En tant qu'utilisateur,
je veux que l'app soit accessible au clavier avec des zones tactiles suffisantes et avoir accès à la politique de confidentialité,
afin que l'app soit utilisable par tous et conforme RGPD.

**Acceptance Criteria:**

**Given** n'importe quel bouton ou lien interactif
**When** il reçoit le focus clavier
**Then** un indicateur de focus visible apparaît (shadow-glow aqua Balnéa, border acid 2px Brutale)
**And** le CTA principal a une hauteur ≥ 52px pleine largeur
**And** tous les boutons secondaires ont une zone tactile ≥ 44×44px

**Given** le contraste est mesuré entre `--ink` (#1A0E2E) et `--cream` (#FFF4EE)
**Then** le ratio est ≥ 7:1
**And** le contraste `--muted` sur `--cream` est ≥ 4.5:1

**Given** la route `/privacy` avec `src/features/legal/PrivacyScreen.tsx`
**When** un utilisateur navigue vers cette page
**Then** la politique de confidentialité s'affiche en français
**And** un lien vers `/privacy` est présent dans l'écran Réglages (placeholder)

---

## Epic 2 : Configurer ma piscine

Marc peut dessiner ou photographier sa piscine, définir ses zones de profondeur, calibrer les dimensions réelles, et obtenir son volume exact pour la première fois.

### Story 2.1 : Écran Piscine & gestion des profils

En tant qu'utilisateur,
je veux voir la liste de mes piscines, en créer une nouvelle et en supprimer une existante,
afin de gérer mes profils piscine depuis un seul endroit.

**Acceptance Criteria:**

**Given** `src/features/piscine/PiscineScreen.tsx` et `piscine.store.ts` sont implémentés
**When** j'ouvre l'onglet Piscine et qu'aucun profil n'existe
**Then** un état vide s'affiche avec un CTA centré "Configurer ma piscine"

**Given** j'ai plusieurs piscines dans Dexie
**When** j'ouvre l'onglet Piscine
**Then** la liste affiche le nom et le volume calculé de chaque piscine

**Given** j'ai exactement une piscine configurée
**When** j'ouvre l'onglet Piscine
**Then** cette piscine est sélectionnée directement sans afficher la liste

**Given** je tape sur "Supprimer" sur un profil et je confirme
**When** la suppression s'exécute
**Then** le profil est supprimé définitivement de Dexie
**And** la table Dexie `piscines` contient les champs : `id`, `nom`, `plan`, `zones`, `volume`, `coteCalibrage`, `syncedAt`, `updatedAt`

---

### Story 2.2 : Canvas scaffold + dessin manuel du contour

En tant qu'utilisateur,
je veux choisir mon mode de configuration et dessiner manuellement le contour de ma piscine,
afin de démarrer la configuration même sans photo disponible.

**Acceptance Criteria:**

**Given** `OnboardingScreen.tsx` présente 3 cards méthode (photo, Maps, dessin)
**When** je choisis "Dessin manuel"
**Then** `CanvasEditor.tsx` s'ouvre en plein écran avec une grille de repère SVG
**And** `StepPills.tsx` affiche 4 étapes : Contour (active), Forme, Profondeurs, Calibrage

**Given** le canvas est en mode contour
**When** je tape pour placer des points
**Then** un polygone se forme point par point via `useCanvasPolygon.ts`
**And** chaque vertex est déplaçable par drag (PointerEvent API unifiée touch + mouse)
**And** un tap sur le premier point ou "Fermer" dans la `FloatingToolbar` ferme le polygone

**Given** l'option snap aux angles droits est activée
**When** je déplace un vertex proche d'un angle droit
**Then** il se snappe automatiquement si l'angle est à moins de 8°

**Given** je maintiens un doigt sur un vertex pendant 150ms
**When** la loupe s'active via `useMagnifier.ts`
**Then** une loupe ×3 apparaît au-dessus du doigt et suit le mouvement en temps réel
**And** elle disparaît au relâchement

---

### Story 2.3 : Modes photo & Maps + CV API + fallback

En tant qu'utilisateur,
je veux capturer ma piscine en photo ou importer une capture Maps pour que l'app détecte automatiquement son contour,
afin de gagner du temps sans dessiner manuellement.

**Acceptance Criteria:**

**Given** je choisis "Depuis une photo" dans l'onboarding
**When** je tape sur le bouton capture
**Then** `<input type="file" accept="image/*" capture="environment">` s'ouvre sans demande de permission préalable (NFR-2)

**Given** une image est importée (photo ou capture Maps JPEG/PNG)
**When** `lib/cv.ts` envoie `POST /detect-contours` au cv-api
**Then** le polygone normalisé [0..1] s'affiche sur le canvas en moins de 8s
**And** `cv-api/services/contour_detection.py` applique Canny + homographie de perspective

**Given** le cv-api est inaccessible ou le timeout 8s est dépassé
**When** le fallback s'active dans un Web Worker
**Then** l'algorithme Canny-like JS retourne un polygone approximatif
**And** `cv.ts` retourne `method: "js-fallback"` dans la réponse

**Given** les deux méthodes échouent
**When** l'état d'échec s'affiche
**Then** le message "Détection impossible — placez les 4 coins manuellement" apparaît
**And** 4 points déplaçables apparaissent aux coins du canvas (FR-10)

---

### Story 2.4 : Zones de profondeur

En tant qu'utilisateur,
je veux délimiter les zones de profondeur de ma piscine avec précision,
afin que le calcul de volume tienne compte de la vraie géométrie de mon bassin.

**Acceptance Criteria:**

**Given** le contour est validé et l'étape "Profondeurs" est active
**When** je regarde le canvas
**Then** `DepthZonesLayer.tsx` affiche 2 zones par défaut colorées selon leur profondeur (--depth-shallow → --depth-deep)
**And** `CanvasSheet.tsx` (bottom sheet rounded 28px) liste les zones avec swatches et champs de valeur

**Given** je glisse le séparateur entre deux zones via `useDepthZones.ts`
**When** je le déplace
**Then** les zones se redécoupent en temps réel sans perdre les valeurs de profondeur adjacentes

**Given** je saisis deux valeurs pour une zone (bord A + bord B)
**When** je confirme
**Then** la zone est marquée "pan incliné" dans le modèle de données Dexie

**Given** toutes les zones ne couvrent pas 100% du plan
**When** je tente de passer à l'étape suivante
**Then** un message signale les zones non renseignées et bloque la progression

**Given** je maintiens un doigt sur un endpoint de séparateur pendant 150ms
**Then** la loupe ×3 s'active pour une précision centimétrique

---

### Story 2.5 : Calibrage, calcul de volume & écran climax

En tant qu'utilisateur,
je veux tracer une ligne de calibrage entre deux points connus et voir le volume exact de ma piscine,
afin de connaître enfin le volume précis de mon bassin.

**Acceptance Criteria:**

**Given** l'étape "Calibrage" est active
**When** je regarde le canvas
**Then** `CalibrationLayer.tsx` affiche une ligne `--calibration` (lilas pastel) avec deux endpoints déplaçables
**And** `CanvasSheet.tsx` affiche un champ de saisie de distance réelle en mètres

**Given** je positionne les endpoints et saisis une distance
**When** je confirme la cote
**Then** le plan entier est mis à l'échelle instantanément via `useCalibrationLine.ts`

**Given** `lib/chemistry.ts` implémente `calculateVolume({ plan, zones, coteCalibrage })`
**When** le calibrage est confirmé
**Then** le volume est calculé en m³ avec deux décimales, interpolation linéaire pour pans inclinés
**And** `chemistry.test.ts` couvre au moins 3 cas : fond plat, pan incliné, piscine mixte

**Given** le volume est calculé et `ClimaxScreen.tsx` s'affiche
**Then** un compteur anime de 0 au volume en 1,6 secondes avec vagues elliptiques pulsantes
**And** la phrase "Votre piscine n'a plus de secrets !" apparaît
**And** `AccountPrompt.tsx` propose "Créer un compte" ou "Plus tard"

**Given** `prefers-reduced-motion` est activé
**When** l'écran climax s'affiche
**Then** le volume final s'affiche directement sans compteur ni vagues animées

---

## Epic 3 : Doser mes produits

Marc peut sélectionner un produit chimique (suggéré automatiquement), saisir son taux mesuré, obtenir son dosage exact avec décomposition en conditionnements, et être rappelé en début et fin de saison.

### Story 3.1 : Roue de sélection produit

En tant qu'utilisateur,
je veux sélectionner un produit chimique via une roue rotative qui suggère automatiquement le produit le plus urgent,
afin de savoir immédiatement sur quoi me concentrer sans chercher.

**Acceptance Criteria:**

**Given** `DosageScreen.tsx` avec `ProductWheel.tsx` (SVG circulaire, 7 produits)
**When** j'ouvre l'onglet Dosage sans historique
**Then** la roue est positionnée sur "Sel" (défaut)

**Given** j'ai un historique de sessions en Dexie
**When** j'ouvre l'onglet Dosage
**Then** la roue se positionne sur le produit dont le dernier taux est le plus éloigné de sa valeur cible
**And** un indicateur (point aqua Balnéa / pixel acid Brutale) marque le segment suggéré
**And** une bannière contextuelle affiche "Sel suggéré — taux bas depuis votre dernière mesure"

**Given** je fais glisser le SVG en rotation libre
**When** je relâche
**Then** la roue snappe vers le produit le plus proche de la fenêtre 12h (easeOutCubic 320–420ms Balnéa, easeInQuart + snap instantané ~300ms Brutale)
**And** le panneau de saisie se met à jour en temps réel pendant la rotation

**Given** je tape directement sur un segment (< 8px de déplacement)
**Then** la roue s'anime directement vers ce produit

**Given** `prefers-reduced-motion` est activé
**Then** le snap est instantané sans animation

---

### Story 3.2 : Panneau de saisie & calcul de dosage

En tant qu'utilisateur,
je veux saisir mon taux mesuré et obtenir immédiatement la dose exacte avec sa décomposition en conditionnements courants,
afin de savoir exactement quoi acheter et quoi ajouter.

**Acceptance Criteria:**

**Given** un produit en mode mesure (Sel, Chlore, pH+, pH−, TAC) est sélectionné
**When** `MeasurePanel.tsx` s'affiche
**Then** un champ numérique avec l'unité correcte est visible (PPM, pH, mg/L selon le produit)
**And** la valeur cible par défaut est affichée (sel 3200 PPM, pH 7.4, chlore 1.5 mg/L)
**And** `PebbleGauge.tsx` affiche la jauge à galets avec un marqueur vertical à la cible

**Given** je saisis mon taux mesuré
**When** la valeur change
**Then** `lib/chemistry.ts calculateDose({ produit, tauxMesure, tauxCible, volume })` est appelé
**And** le résultat s'affiche en moins de 200ms (NFR-3)
**And** `DoseResult.tsx` affiche la dose en kg avec une décimale (ex: "14,2 kg")
**And** la décomposition en conditionnements s'affiche (ex: "1 sac 10 kg + 1 sac 5 kg")
**And** `chemistry.test.ts` couvre `calculateDose` avec au moins 4 cas (sel, chlore, pH+, taux déjà optimal)

**Given** le taux mesuré est supérieur ou égal au taux cible
**Then** `DoseResult.tsx` affiche "Aucun ajout nécessaire"

**Given** le champ de saisie est vide
**Then** `DoseResult.tsx` affiche "—" et le CTA est désactivé (opacity 40%)

---

### Story 3.3 : Mode préventif & score visuel

En tant qu'utilisateur,
je veux voir un indicateur coloré sur l'état de mon eau et obtenir une dose préventive pour les produits sans taux mesurable,
afin de comprendre d'un coup d'œil si mon eau est saine.

**Acceptance Criteria:**

**Given** un produit en mode préventif (Algicide, Stabilisant) est sélectionné
**When** `PreventivePanel.tsx` s'affiche
**Then** aucun champ de saisie n'est visible
**And** la dose est calculée directement sur le volume du profil piscine actif
**And** une note contextuelle explique la base de calcul

**Given** un taux mesuré est saisi en mode mesure
**When** le calcul s'exécute
**Then** le score visuel (`PebbleGauge.tsx`) s'affiche de façon proéminente AVANT la dose
**And** vert si ±5% de la cible, orange si hors plage, rouge si critique
**And** les galets avant le marqueur sont colorés (peach = déficit, aqua = optimal, rouge = excès)
**And** les galets après le marqueur sont en `--faint`

---

### Story 3.4 : Confirmation de session & enregistrement

En tant qu'utilisateur,
je veux confirmer que j'ai ajouté le produit pour que la session soit enregistrée,
afin que l'app mémorise mon historique et améliore ses suggestions.

**Acceptance Criteria:**

**Given** un dosage est calculé et le champ est renseigné
**When** le CTA est actif
**Then** il affiche "J'ai ajouté le [produit]" (ex: "J'ai ajouté le sel")

**Given** je tape le CTA
**When** l'action s'exécute
**Then** une micro-animation checkmark aqua pulse 1× en 300ms — pas de toast, pas de modal
**And** la session est enregistrée dans Dexie `sessions` : `{ id, piscineId, produit, tauxMesure, dose, valide: true, createdAt }`
**And** le panneau revient en état "non mesuré" (champ vide, CTA désactivé)

**Given** `prefers-reduced-motion` est activé
**Then** le checkmark apparaît instantanément sans pulse

---

### Story 3.5 : Rappels saisonniers & sélecteur multi-piscines

En tant qu'utilisateur,
je veux être rappelé en début et fin de saison et pouvoir changer de piscine active depuis l'écran de dosage,
afin de ne pas oublier les vérifications importantes et de gérer plusieurs bassins facilement.

**Acceptance Criteria:**

**Given** `lib/reminders.ts` contient la logique mai/septembre
**When** l'app s'ouvre et qu'aucune session n'a été enregistrée depuis plus de 6 mois
**Then** `SeasonBanner.tsx` s'affiche en haut de l'écran Dosage
**And** la bannière est dismissable (tap ×)
**And** après dismiss, elle ne réapparaît pas avant le cycle suivant (état dans Dexie `settings`)

**Given** j'ai plusieurs piscines configurées
**When** j'ouvre l'écran Dosage
**Then** une pill avec le nom de la piscine active s'affiche dans le header
**And** un tap ouvre une bottom sheet listant toutes mes piscines

**Given** je sélectionne une autre piscine
**When** la sélection s'applique
**Then** le dosage est recalculé avec le volume de la nouvelle piscine
**And** `settings.dernierePiscineId` est mis à jour dans Dexie

**Given** j'ai exactement une piscine
**Then** aucune pill de sélection n'est visible

---

## Epic 4 : Mon compte & Synchronisation

Marc peut créer un compte email/mot de passe, protéger ses profils dans le cloud, et les retrouver sur n'importe quel appareil sans jamais bloquer l'usage hors ligne.

### Story 4.1 : Inscription & connexion Supabase Auth

En tant qu'utilisateur,
je veux créer un compte avec mon email et mon mot de passe et me connecter depuis n'importe quel appareil,
afin de protéger mes données et d'y accéder partout.

**Acceptance Criteria:**

**Given** `src/features/auth/RegisterScreen.tsx` et `auth.store.ts` sont implémentés
**When** je renseigne un email valide et un mot de passe ≥ 8 caractères
**Then** Supabase Auth crée le compte et envoie un email de confirmation
**And** l'app affiche "Vérifiez votre email"

**Given** je soumets avec un email invalide ou un mot de passe < 8 caractères
**Then** un message d'erreur explicite s'affiche sans envoyer de requête

**Given** je saisis des identifiants incorrects dans `LoginScreen.tsx`
**Then** un message "Email ou mot de passe incorrect" s'affiche sans exposer d'information sensible

**Given** je suis connecté et tape "Se déconnecter" dans les Réglages
**Then** la session Supabase est invalidée et l'app repasse en mode local (données Dexie intactes)
**And** le JWT est stocké en mémoire par le SDK — jamais dans localStorage

---

### Story 4.2 : Avertissement non-connecté & prompt de sauvegarde

En tant qu'utilisateur sans compte,
je veux être informé du risque de perte de données sans être bloqué dans mon usage,
afin de décider en connaissance de cause si je veux créer un compte.

**Acceptance Criteria:**

**Given** je suis utilisateur non connecté
**When** je navigue sur n'importe quel écran principal
**Then** `AccountPrompt.tsx` (bannière persistante) est visible avec le risque de perte de données
**And** "Créer un compte" mène directement au formulaire
**And** "Plus tard" ferme la bannière pour la session (réapparaît à la prochaine ouverture)

**Given** je suis sur l'écran climax (fin Epic 2)
**When** le volume s'affiche
**Then** `AccountPrompt.tsx` s'affiche SOUS le volume — pas avant (règle UX stricte)
**And** "Plus tard" est toujours accessible — l'app n'est jamais bloquée sans compte

---

### Story 4.3 : Synchronisation cloud local-first

En tant qu'utilisateur connecté,
je veux que mes données se synchronisent automatiquement en arrière-plan,
afin de les retrouver sur n'importe quel appareil sans action de ma part.

**Acceptance Criteria:**

**Given** je suis connecté et `lib/sync.ts` est implémenté
**When** je crée ou modifie un profil piscine
**Then** la donnée est d'abord écrite dans Dexie (write-local-first)
**And** `sync.ts` envoie la mise à jour à Supabase en arrière-plan (non-bloquant — `void sync()`)
**And** `piscines.syncedAt` est mis à jour après confirmation

**Given** la connexion réseau est rétablie après une période offline
**When** des données locales ont `syncedAt` < `updatedAt`
**Then** la sync s'exécute automatiquement
**And** une icône sync-pending discrète apparaît dans le header et disparaît à la fin (UX-DR20)

**Given** un conflit existe entre version locale et cloud
**Then** la version avec `updatedAt` le plus récent gagne (last-write-wins)

**Given** je supprime un profil sur l'appareil A
**Then** la suppression est reflétée sur l'appareil B après sync (ON DELETE CASCADE)

**Given** je suis offline
**Then** toutes les fonctionnalités sont disponibles sans message d'erreur bloquant (NFR-8)

---

### Story 4.4 : Suppression de compte & conformité RGPD

En tant qu'utilisateur,
je veux pouvoir supprimer mon compte et toutes mes données depuis les Réglages,
afin d'exercer mon droit à l'effacement conformément au RGPD.

**Acceptance Criteria:**

**Given** je suis connecté dans les Réglages
**When** je tape "Supprimer mon compte"
**Then** une confirmation explicite est demandée avant toute action

**Given** je confirme la suppression
**When** l'opération s'exécute
**Then** le compte Supabase est supprimé via GoTrue
**And** `ON DELETE CASCADE` supprime toutes les données liées (`piscines`, `sessions`, `profiles`)
**And** les données Dexie locales sont effacées et l'app repasse en état "premier lancement"

**Given** la page `/privacy` est accessible
**When** un utilisateur la consulte
**Then** les données collectées, la durée de rétention et l'hébergement EU sont clairement indiqués (NFR-5)

---

## Epic 5 : Journal, Réglages & Mise en production

Marc peut consulter son historique de sessions, personnaliser ses valeurs cibles, utiliser l'app dans sa langue, et l'app est prête pour la production.

### Story 5.1 : Écran Journal — historique des sessions

En tant qu'utilisateur,
je veux consulter l'historique chronologique de mes sessions de dosage par piscine,
afin de suivre l'évolution de ma chimie et retrouver les dosages passés.

**Acceptance Criteria:**

**Given** `src/features/journal/JournalScreen.tsx` et `journal.store.ts`
**When** j'ouvre l'onglet Journal avec des sessions enregistrées
**Then** les sessions s'affichent en ordre chronologique inverse (plus récente en premier)
**And** chaque entrée affiche : nom de la piscine, produit, taux mesuré, dose calculée, date

**Given** j'ai des sessions pour plusieurs piscines
**When** je filtre par piscine via un sélecteur
**Then** seules les sessions de la piscine sélectionnée s'affichent

**Given** `useLiveQuery(() => db.sessions.orderBy('createdAt').reverse().toArray())`
**When** une nouvelle session est enregistrée depuis l'écran Dosage
**Then** elle apparaît immédiatement en tête de liste sans rechargement

**Given** aucune session n'existe
**When** j'ouvre le Journal
**Then** un état vide s'affiche avec "Aucune session enregistrée — faites votre premier dosage !"

---

### Story 5.2 : Réglages — valeurs cibles modifiables & préférences

En tant qu'utilisateur,
je veux personnaliser les valeurs cibles de chaque produit et accéder à toutes mes préférences depuis un seul écran,
afin d'adapter l'app à ma piscine spécifique.

**Acceptance Criteria:**

**Given** `src/features/reglages/ReglagesScreen.tsx` et `reglages.store.ts`
**When** j'ouvre l'onglet Réglages
**Then** je vois : valeurs cibles par produit, sélecteur de thème, sélecteur de langue, gestion du compte, lien vers /privacy

**Given** je modifie la valeur cible du sel (ex: 3200 → 3400 PPM)
**When** je confirme
**Then** la valeur est sauvegardée dans Dexie `settings` par produit
**And** le calcul de dosage utilise immédiatement la nouvelle cible

**Given** je tape "Réinitialiser" à côté d'une valeur cible modifiée
**When** la réinitialisation s'exécute
**Then** la valeur revient à son défaut (sel 3200 PPM, pH 7.4, chlore 1.5 mg/L)
**And** le calcul de dosage est mis à jour immédiatement

**Given** je change le thème depuis les Réglages
**When** la sélection s'applique
**Then** le morphing inter-thème s'exécute et le choix est persisté dans Dexie

---

### Story 5.3 : Internationalisation FR/EN complète

En tant qu'utilisateur,
je veux que l'app s'affiche dans ma langue automatiquement et que je puisse la changer manuellement,
afin de l'utiliser confortablement dans ma langue native.

**Acceptance Criteria:**

**Given** `src/lib/i18n.ts` configure i18next avec détection du navigateur
**When** l'app s'ouvre sur un navigateur configuré en anglais
**Then** toute l'interface s'affiche en anglais

**Given** la langue du navigateur n'est pas supportée
**When** l'app s'ouvre
**Then** l'anglais est utilisé par défaut (FR-19)

**Given** je change la langue vers l'anglais dans les Réglages
**When** la sélection s'applique
**Then** toute l'interface bascule en anglais immédiatement sans rechargement
**And** le choix est persisté dans Dexie `settings.langue`

**Given** les 6 namespaces i18n sont complets (`common`, `dosage`, `piscine`, `journal`, `reglages`, `errors`)
**When** chaque namespace est inspecté
**Then** chaque clé FR a son équivalent EN
**And** aucune string hardcodée n'est présente dans les composants

**Given** une valeur numérique est affichée (volume, dosage, taux)
**When** la locale est FR
**Then** `Intl.NumberFormat` produit la virgule décimale et l'espace insécable (ex: "47,3 m³", "3 200 ppm") — FR-20

---

### Story 5.4 : Audit final & validation production

En tant qu'utilisateur,
je veux que l'app soit performante, sans régression, et correctement déployée en production,
afin d'avoir confiance dans sa fiabilité au quotidien.

**Acceptance Criteria:**

**Given** `npm run test` est exécuté
**When** la suite Vitest complète s'exécute
**Then** tous les tests passent (`chemistry.ts`, `cv.ts`, `auth.test.ts`, `dosage.test.ts`, `canvas.test.ts`)
**And** la couverture des fonctions pures de `chemistry.ts` est ≥ 90%

**Given** l'app est buildée en production (`npm run build`)
**When** le build est analysé
**Then** le bundle JS initial est < 200 KB gzippé (hors fonts et icônes)
**And** les fonts woff2 sont correctement préchargées via `<link rel="preload">`

**Given** l'app est ouverte sur Safari iOS 17+ et Chrome Android 120+
**When** les fonctionnalités principales sont testées (canvas, roue, dosage, thème)
**Then** aucune erreur console critique n'apparaît (NFR-7)

**Given** le Lighthouse PWA audit est lancé
**When** le rapport est généré
**Then** le score PWA est ≥ 90 (installable, offline ready, manifest valide)

**Given** l'app est déployée via GitHub Actions
**When** le déploiement SSH est terminé
**Then** l'app est accessible via HTTPS avec un certificat TLS valide (NFR-4)
