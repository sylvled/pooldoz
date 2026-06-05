---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-04'
inputDocuments:
  - planning-artifacts/prds/prd-pooldoz-2026-06-03/prd.md
  - planning-artifacts/ux-designs/ux-pooldoz-2026-06-03/DESIGN.md
  - planning-artifacts/ux-designs/ux-pooldoz-2026-06-03/EXPERIENCE.md
workflowType: 'architecture'
project_name: 'PoolDoz'
user_name: 'Fondateur'
date: '2026-06-03'
---

# Architecture Decision Document — PoolDoz

_Ce document se construit collaborativement, étape par étape. Les sections sont ajoutées au fil des décisions architecturales._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (20 FRs, 6 domaines) :**

| Domaine | FRs | Enjeu architectural |
|---|---|---|
| Compte & persistance | FR-1 à FR-4 | Local-first, sync cloud optionnelle |
| Multi-piscines | FR-5, FR-6 | Modèle de données hiérarchique |
| Création de profil | FR-7 à FR-10 | Canvas SVG interactif + vision par ordinateur |
| Zones & calcul volume | FR-11 à FR-13 | Géométrie computationnelle côté client |
| Session de dosage | FR-14 à FR-17 | Calculs chimiques + UI roue rotative |
| Rappels & i18n | FR-18 à FR-20 | Logique temporelle + internationalisation |

**Non-Functional Requirements :**

- **Performance** : calculs volume et dosage < 200ms, entièrement côté client
- **Offline** : app 100% fonctionnelle sans réseau à tout instant
- **Sécurité** : HTTPS, passwords bcrypt, pas de données sensibles côté client
- **RGPD** : hébergement EU, suppression complète du compte et des données
- **i18n** : architecture extensible aux langues sans modification structurelle
- **Compatibilité** : Safari iOS + Chrome Android obligatoires
- **PWA → Native** : base de code partageable avec Capacitor/React Native (future)

**Scale & Complexity :**

- Domaine principal : Full-stack PWA (web mobile-first, future native)
- Niveau de complexité : **Medium-High**
  - Data : Faible (profils locaux, sessions de dosage)
  - Intégrations tierces : Minimales (auth email, stockage cloud EU — pas d'API Maps)
  - UI/Interaction : **Élevée** (canvas interactif, dual-theme, animations complexes)
  - Vision par ordinateur : **Élevée et incertaine** (détection de contours, correction de perspective)
- Composants architecturaux estimés : 5–7 modules distincts

### Technical Constraints & Dependencies

- **Pas d'API Google Maps** (coût, non-objectif §5 PRD) — captures d'écran statiques uniquement
- **LiDAR** utilisable sur iPhone 12 Pro+ pour FR-8 (détection optionnelle, pas bloquante)
- **localStorage** pour mode sans compte (FR-1) → implique IndexedDB pour données volumineuses (canvas)
- **Framework UI** : custom — aucun composant library hérité (imposé par le dual-theme et l'anti-slop)
- **Hébergement** : EU obligatoire (RGPD §7)
- **Capacitor/React Native** cités dans PRD §8 — l'architecture frontend doit anticiper cet export

### Cross-Cutting Concerns

1. **Local-first + sync** — toutes les couches (stockage, modèle, API) doivent être conçues offline-first
2. **Dual-theme system** — le système de tokens traverse l'intégralité des composants UI et des icônes
3. **i18n** — strings, formats numériques (virgule décimale FR), unités : traversent toute l'interface
4. **Vision par ordinateur (OQ-3)** — décision d'architecture critique non résolue : WASM, Web Worker, ou API externe
5. **Performance canvas** — le canvas SVG doit rester fluide sur mobile mid-range pendant drag + loupe + recalcul
6. **RGPD** — suppression complète implique cascade de données côté serveur et client

## Starter Template Evaluation

### Primary Technology Domain

Full-stack PWA client-heavy, offline-first. Logique de calcul et canvas entièrement côté client.
Pas de SSR requis. Base de code future Capacitor-compatible.

### Starter Options Considered

- **Next.js** — rejeté : SSR inutile pour une app 100% client-side, friction avec l'export Capacitor futur
- **Remix** — rejeté : même raison, plus orienté serveur
- **Vite + React + TypeScript** — retenu : standard 2026, léger, Capacitor-compatible nativement

### Selected Starter : Vite + React 19 + TypeScript

**Commande d'initialisation :**

```bash
npm create vite@latest pooldoz -- --template react-ts
```

**Rationale :** Vite est le standard 2026 pour les apps React sans SSR. Compatible Capacitor sans configuration supplémentaire. Couplé à Supabase self-hosted sur le serveur personnel du fondateur, la stack est 100% gratuite et sous contrôle total.

**Stack complète :**

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | React 19.2 | UI, composants, hooks |
| Build | Vite 6.x | Dev server, build optimisé |
| Langage | TypeScript (strict) | Sécurité typage sur code géométrique et canvas |
| PWA / Offline | vite-plugin-pwa (Workbox) | Service worker, cache offline |
| State | Zustand | État global léger, Capacitor-compatible |
| Stockage local | Dexie.js (IndexedDB) | Profils piscine, sessions dosage — offline-first |
| i18n | i18next + react-i18next | FR/EN extensible sans modification structurelle |
| Tests | Vitest + Testing Library | Natif Vite, même pipeline |
| CSS | Custom (variables CSS — tokens DESIGN.md) | Dual-theme Balnéa/Brutale, zéro framework UI |
| Backend / Auth / DB | Supabase self-hosted (Docker Compose) | PostgreSQL EU, auth email, storage — 100% gratuit |
| Déploiement | Docker Compose (Nginx frontend + Supabase stack) | Serveur personnel, tout en un |

**Architectural Decisions Provided by Starter :**

- **Language & Runtime :** TypeScript strict, ESNext target, path aliases configurables
- **Styling :** CSS variables globales (aucun framework UI — dual-theme exige le contrôle total des tokens)
- **Build Tooling :** Vite HMR, code splitting automatique, tree-shaking
- **Testing :** Vitest (même config Vite, pas de Jest séparé)
- **Code Organization :** `src/` avec `components/`, `lib/`, `store/`, `i18n/`, `hooks/`
- **Development Experience :** HMR sub-100ms, TypeScript error overlay, source maps

**Note :** L'initialisation du projet via cette commande sera la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Décisions critiques (bloquent l'implémentation) :**
- Vision par ordinateur : API Python + fallback JS
- Stratégie de sync : automatique arrière-plan
- Schéma de données : Dexie (local) + PostgreSQL Supabase (cloud)

**Décisions importantes (structurent l'architecture) :**
- Routing : React Router v7
- Canvas : SVG natif + hooks React custom
- Auth : Supabase email/password + RLS
- CI/CD : GitHub Actions (lint + tests + déploiement automatique)

**Décisions différées (post-V1) :**
- LiDAR (FR-8) : à activer via Capacitor natif lors de la version native
- Magic link / Social auth : explicitement hors-périmètre V1
- Monitoring avancé : Supabase Studio suffit pour V1

### Data Architecture

**Sync local ↔ cloud : automatique en arrière-plan**
Dès que la connexion réseau est disponible, le SDK Supabase JS déclenche la sync silencieusement.
Un indicateur discret dans le header (EXPERIENCE.md) signale l'état pending. Disparaît sans interaction.
L'app est 100% fonctionnelle hors-ligne — la sync est transparente, jamais bloquante.

**Schéma Dexie.js (IndexedDB — local-first) :**
```ts
piscines : { id, nom, plan (JSON), zones (JSON), volume, coteCalibrage, syncedAt, updatedAt }
sessions  : { id, piscineId, produit, tauxMesure, dose, valide, createdAt }
settings  : { theme, langue, dernierePiscineId }
```

**Schéma PostgreSQL (Supabase — cloud) :**
```sql
piscines (id, user_id, nom, plan_json, zones_json, volume, updated_at)
sessions (id, piscine_id, produit, taux_mesure, dose, valide, created_at)
-- RLS activé : user_id = auth.uid() sur toutes les tables
-- ON DELETE CASCADE sur toutes les tables liées à user_id (RGPD)
```

**Conflit resolution :** last-write-wins basé sur `updatedAt` — suffisant pour un usage mono-utilisateur mono-session.

### Authentication & Security

- **Méthode :** Supabase Auth email/password uniquement (V1)
- **JWT :** géré automatiquement par le SDK Supabase JS — pas de gestion manuelle
- **RLS :** activé sur toutes les tables (`user_id = auth.uid()`)
- **RGPD :** `ON DELETE CASCADE` sur toutes les relations `user_id` → suppression de compte = suppression complète
- **Client-side :** localStorage contient uniquement thème et langue (aucune donnée personnelle)
- **Transport :** HTTPS obligatoire (Nginx reverse proxy avec TLS)

### API & Communication Patterns

**Pas d'API custom.** PostgREST (inclus dans Supabase) expose automatiquement le schéma PostgreSQL.
Le SDK Supabase JS est le seul layer d'accès aux données cloud.

**Pattern de gestion d'erreurs :**
```ts
// Uniforme dans tous les stores Zustand
{ data: T | null, error: string | null, loading: boolean }
```
Chaque domaine (piscines, sessions, auth) a son store avec ce shape.

### Frontend Architecture

**Routing : React Router v7**
- `createBrowserRouter` avec routes déclaratives
- Routes : `/` (dosage) · `/piscine` · `/journal` · `/reglages` · `/onboarding`
- Navigation persistée via bottom navigation bar (EXPERIENCE.md)

**Canvas : SVG natif + hooks React custom**
- Le SVG est le langage natif de la spec (polygone aqua, ligne de calibrage lilas)
- Aucune lib canvas (Konva, Fabric) — contrôle total sur animations et interactions
- Hooks dédiés : `useCanvasPolygon`, `useDepthZones`, `useCalibrationLine`, `useMagnifier`
- Events : PointerEvent API (unifie touch + mouse, compatible mobile)

**Vision par ordinateur : API Python + fallback JS**

*Architecture principale — serveur accessible :*
- Micro-service FastAPI + OpenCV sur le serveur perso (Docker, même compose)
- Endpoint : `POST /detect-contours` → reçoit image, retourne polygone JSON
- Correction de perspective (homographie) et détection de contours (Canny)
- Timeout : 8s → bascule automatique sur fallback

*Fallback — serveur inaccessible ou timeout :*
- Algorithme Canny-like en JS pur dans un Web Worker (offline-capable)
- Moins précis sur photos complexes — toujours meilleur que rien
- Si les deux échouent → FR-10 : placement manuel des 4 coins (toujours disponible)

**Dual-theme system :**
- Variables CSS globales sur `:root` (tokens DESIGN.md)
- Swap de thème via `data-theme="balnea|brutale"` sur `<html>`
- Stocké dans `settings.theme` (Dexie) → persist entre sessions sans compte
- Icônes SVG : deux jeux dans `src/assets/icons/balnea/` et `src/assets/icons/brutale/`

**Organisation des composants :**
```
src/
  components/   # UI purs, aucun side-effect
  features/     # dosage/, piscine/, journal/, reglages/ — logique métier
  hooks/        # useCanvasPolygon, useMagnifier, useTheme...
  lib/          # db.ts (Dexie), supabase.ts, i18n.ts, chemistry.ts
  store/        # Zustand stores par domaine
  assets/       # icons/balnea/, icons/brutale/, fonts/
```

### Infrastructure & Deployment

**Docker Compose global :**
```yaml
services:
  frontend:  # Nginx + build Vite statique
  cv-api:    # FastAPI + OpenCV (micro-service vision)
  # + stack Supabase complète (db, auth, rest, storage, studio)
```

**CI/CD :** GitHub Actions — lint (ESLint) + tests (Vitest) + déploiement automatique sur le serveur perso (SSH + `docker compose pull && docker compose up -d`) au push sur `main`.

**Environnement :**
```
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=...
VITE_CV_API_URL=http://localhost:8001
```

**Monitoring V1 :** Supabase Studio (inclus) pour logs et données DB.

### Decision Impact Analysis

**Séquence d'implémentation imposée par les dépendances :**
1. Init Vite + React + config (starter)
2. Schéma Dexie + stores Zustand (fondation data)
3. Dual-theme system + tokens CSS (fondation UI)
4. Routing + navigation
5. Canvas SVG (module le plus complexe)
6. Module vision par ordinateur (FastAPI + fallback JS)
7. Module dosage (roue + calculs chimiques)
8. Auth Supabase + sync
9. i18n FR/EN

**Dépendances croisées critiques :**
- Canvas dépend du dual-theme (tokens de couleur profondeur)
- Vision par ordinateur est indépendante — peut se développer en parallèle
- Auth/sync est la dernière couche — l'app doit fonctionner sans elle

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Base de données (PostgreSQL / Supabase)**
- Tables : `snake_case` pluriel — `piscines`, `sessions`, `profiles`
- Colonnes : `snake_case` — `user_id`, `plan_json`, `updated_at`
- Clés étrangères : `{table_singulier}_id` — `piscine_id`, `user_id`
- Index : `idx_{table}_{colonne}` — `idx_piscines_user_id`

**Dexie.js (IndexedDB)**
- Tables : `camelCase` pluriel — `piscines`, `sessions`, `settings`
- Champs : `camelCase` — `piscineId`, `tauxMesure`, `updatedAt`
- La conversion snake_case ↔ camelCase est centralisée dans `src/lib/sync.ts`

**Code TypeScript/React**
- Composants : `PascalCase` — `DosageScreen`, `CanvasEditor`
- Hooks : `camelCase` préfixé `use` — `useCanvasPolygon`, `useTheme`
- Stores Zustand : `camelCase` préfixé `use` + suffixe `Store` — `usePiscineStore`
- Fonctions utilitaires : `camelCase` — `calculateDose`, `detectContours`
- Constantes : `UPPER_SNAKE_CASE` — `DEFAULT_SEL_TARGET`, `CV_API_TIMEOUT`

**Fichiers et dossiers**
- Composants React : `PascalCase.tsx` — `DosageScreen.tsx`, `ProductWheel.tsx`
- Hooks : `camelCase.ts` — `useCanvasPolygon.ts`
- Stores : `camelCase.store.ts` — `piscine.store.ts`
- Libs : `camelCase.ts` — `chemistry.ts`, `db.ts`, `sync.ts`
- Tests : co-localisés, suffixe `.test.ts(x)` — `chemistry.test.ts`
- Assets : `kebab-case` — `icons/balnea/`, `icons/brutale/`

**Variables CSS (tokens)**
- Format : `--{role}` en variable active, surchargée par `[data-theme="brutale"]`
- Exemples : `--ink`, `--aqua`, `--surface`, `--shadow-cta`
- Le swap de thème écrase les variables actives via `[data-theme="brutale"] { --ink: ... }`
- Jamais de valeur hardcodée dans un composant — toujours `var(--token)`

---

### Structure Patterns

**Organisation des fichiers**
```
src/
  features/
    dosage/
      DosageScreen.tsx
      ProductWheel.tsx
      DosagePanel.tsx
      dosage.store.ts
      dosage.test.ts
    piscine/
      PiscineScreen.tsx
      CanvasEditor.tsx
      useCanvasPolygon.ts
      useDepthZones.ts
      piscine.store.ts
    journal/
    reglages/
    onboarding/
  components/       # UI purs partagés (aucun store, aucun side-effect)
    PebbleGauge.tsx
    StepPills.tsx
    BlobCard.tsx
  hooks/            # Hooks partagés entre features
    useTheme.ts
    useMagnifier.ts
  lib/
    db.ts           # Instance Dexie + schéma
    supabase.ts     # Instance Supabase client
    sync.ts         # Logique sync local ↔ cloud + conversion snake/camel
    chemistry.ts    # Calculs de dosage (fonctions pures)
    cv.ts           # Client CV API + fallback JS
    i18n.ts         # Config i18next
  store/            # Stores globaux non liés à une feature
    settings.store.ts
  assets/
    icons/
      balnea/
      brutale/
    fonts/
  styles/
    tokens.css      # Variables CSS — source of truth des deux thèmes
    global.css
```

**Règle de co-location :** tout ce qui n'est utilisé que par une feature vit dans cette feature. Si un composant est utilisé par 2 features ou plus → `components/`.

---

### Format Patterns

**Shape des stores Zustand (uniforme)**
```ts
interface FeatureStore {
  data: T | null
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
  clearError: () => void
}
```

**Réponse du CV API (FastAPI)**
```json
{
  "success": true,
  "polygon": [{"x": 0.1, "y": 0.2}, ...],
  "confidence": 0.87,
  "method": "opencv|js-fallback"
}
```
Coordonnées normalisées [0..1] — la mise à l'échelle est côté client.

**Erreurs (uniformes côté client)**
```ts
// Toujours une string lisible — jamais un objet Error brut
error: "Impossible de charger le profil. Vérifiez votre connexion."
```

**Dates**
- Stockage Dexie : `updatedAt: number` (timestamp ms — `Date.now()`)
- Stockage PostgreSQL : `TIMESTAMPTZ` (ISO string via PostgREST)
- Affichage : `Intl.DateTimeFormat` avec locale active — jamais de lib date externe

**Formats numériques**
- Toujours via `Intl.NumberFormat` avec locale — jamais `.toFixed()` brut affiché
- Virgule décimale FR : géré par i18next + `Intl` automatiquement

---

### Communication Patterns

**Zustand — règles d'usage**
- Un store par domaine métier : `piscine`, `dosage`, `auth`, `settings`
- Les composants lisent via selectors granulaires — jamais le store entier
- Les mutations passent toujours par une action du store — jamais de `setState` direct depuis un composant
- Pas de store pour l'état UI local (ouverture d'un modal, focus d'un champ) → `useState`

**Dexie — règles d'usage**
- `useLiveQuery` pour toute donnée rendue dans un composant (réactivité automatique)
- Accès direct à `db.*` uniquement dans les stores ou `src/lib/sync.ts`
- Jamais d'accès Dexie depuis un composant React directement

**Sync local ↔ cloud**
- Point d'entrée unique : `src/lib/sync.ts`
- Pattern : write-local-first → sync-background-async → update-syncedAt
- Conflits résolus par `updatedAt` (last-write-wins)
- La sync ne bloque jamais l'UI — toujours `void sync()` jamais `await sync()`

---

### Process Patterns

**Gestion des erreurs**
```ts
// Pattern uniforme dans tous les stores
try {
  set({ loading: true, error: null })
  const result = await operation()
  set({ data: result, loading: false })
} catch (e) {
  set({ error: t('errors.generic'), loading: false })
  // Log technique en console, message i18n vers l'utilisateur
}
```

**États de chargement**
- `loading: true` uniquement sur les opérations réseau ou CV API
- Lectures Dexie via `useLiveQuery` — pas de loading state (synchrones)
- Pas de spinner global — chaque feature gère son propre état

**CV API — pattern d'appel**
```ts
// src/lib/cv.ts
async function detectContours(imageBlob: Blob): Promise<Polygon> {
  try {
    return await callCVApi(imageBlob)        // timeout 8s
  } catch {
    return await fallbackJSDetection(imageBlob)
  }
  // Si les deux échouent → throw → la feature affiche FR-10 (placement manuel)
}
```

**i18n**
- Toutes les strings visibles passent par `t('namespace.key')`
- Jamais de string FR/EN hardcodée dans un composant
- Namespaces : `common`, `dosage`, `piscine`, `journal`, `reglages`, `errors`

**Calculs chimiques**
- 100% dans `src/lib/chemistry.ts` — fonctions pures, zéro side-effect
- Chaque fonction testée unitairement dans `chemistry.test.ts`
- Aucun calcul chimique dans un composant ou un store

---

### Enforcement Guidelines

**Tous les agents AI DOIVENT :**
- Utiliser `var(--token)` pour toute couleur, ombre ou rayon — jamais de valeur hardcodée
- Passer par `src/lib/chemistry.ts` pour tout calcul de dosage ou volume
- Utiliser `useLiveQuery` pour toute lecture Dexie dans un composant
- Passer toute string UI par `t()` de i18next
- Co-localiser les fichiers dans leur feature si usage unique

**Anti-patterns à éviter :**
```tsx
// ❌ Couleur hardcodée
style={{ color: '#3DB8B8' }}
// ✅ Token CSS
style={{ color: 'var(--aqua)' }}

// ❌ Calcul dans un composant
const dose = (target - measured) * volume / 1000
// ✅ Lib chemistry
const dose = calculateDose({ produit, tauxMesure, tauxCible, volume })

// ❌ Accès Dexie direct dans un composant
const piscines = await db.piscines.toArray()
// ✅ Live query
const piscines = useLiveQuery(() => db.piscines.toArray())
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pooldoz/                              # Monorepo root
├── .github/
│   └── workflows/
│       └── deploy.yml                # lint → test → SSH deploy → docker compose up
├── docker-compose.yml                # Stack globale (frontend + cv-api + supabase)
├── .env.example
│
├── frontend/                         # App Vite + React 19 + TypeScript
│   ├── package.json
│   ├── vite.config.ts                # vite-plugin-pwa + path aliases
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── index.html
│   ├── .env.example                  # VITE_SUPABASE_URL, VITE_CV_API_URL
│   ├── Dockerfile                    # Build multi-stage → Nginx
│   ├── nginx.conf
│   │
│   ├── public/
│   │   ├── manifest.webmanifest      # PWA manifest (icônes, thème, standalone)
│   │   └── pwa-icons/               # 192×192, 512×512
│   │
│   └── src/
│       ├── main.tsx                  # Entry point + i18n init + Dexie ready
│       ├── App.tsx                   # RouterProvider + ThemeProvider
│       ├── router.tsx                # createBrowserRouter — 5 routes
│       │
│       ├── styles/
│       │   ├── tokens.css            # Variables CSS Balnéa + Brutale (source of truth)
│       │   └── global.css            # Reset + typographie de base + safe areas
│       │
│       ├── lib/
│       │   ├── db.ts                 # Instance Dexie + schéma (piscines, sessions, settings)
│       │   ├── supabase.ts           # Instance Supabase client (singleton)
│       │   ├── sync.ts               # Sync local↔cloud + conversion camelCase/snake_case
│       │   ├── chemistry.ts          # Calculs dosage + volume (fonctions pures — FR-13, FR-16)
│       │   ├── chemistry.test.ts
│       │   ├── cv.ts                 # Client CV API (timeout 8s) + fallback Canny JS
│       │   ├── cv.test.ts
│       │   ├── i18n.ts               # Config i18next (FR défaut, EN, détection navigateur)
│       │   └── reminders.ts          # Logique rappels saisonniers mai/septembre (FR-18)
│       │
│       ├── store/
│       │   └── settings.store.ts     # Thème actif, langue, dernierePiscineId
│       │
│       ├── hooks/
│       │   ├── useTheme.ts           # Long-press logo → morphing Balnéa↔Brutale
│       │   └── useMagnifier.ts       # Loupe ×3 sur PointerEvent (press 150ms)
│       │
│       ├── components/               # UI purs partagés (aucun store, aucun side-effect)
│       │   ├── PebbleGauge.tsx       # Jauge à galets colorée par statut (FR-17)
│       │   ├── StepPills.tsx         # Barre Contour→Forme→Profondeurs→Calibrage
│       │   ├── BlobCard.tsx          # Card prescription fond violet-mid + blob animé
│       │   ├── NavBar.tsx            # Bottom navigation 4 onglets
│       │   ├── SeasonBanner.tsx      # Bannière rappel saisonnier dismissable (FR-18)
│       │   └── AccountPrompt.tsx     # Prompt compte sous l'écran climax (FR-3)
│       │
│       ├── features/
│       │   ├── onboarding/
│       │   │   ├── OnboardingScreen.tsx     # Accueil + 3 cards méthode (photo/maps/dessin)
│       │   │   ├── ThemeReveal.tsx           # Beat découverte thème (affiché 1 seule fois)
│       │   │   └── onboarding.store.ts
│       │   │
│       │   ├── piscine/
│       │   │   ├── PiscineScreen.tsx          # Liste piscines + création/suppression (FR-5, FR-6)
│       │   │   ├── piscine.store.ts           # { piscines, activePiscineId, loading, error }
│       │   │   └── canvas/
│       │   │       ├── CanvasEditor.tsx        # Orchestrateur canvas plein-écran (FR-7 à FR-13)
│       │   │       ├── ContourLayer.tsx        # SVG polygone éditable + vertices (FR-7, FR-10)
│       │   │       ├── DepthZonesLayer.tsx     # SVG zones colorées + séparateurs (FR-12)
│       │   │       ├── CalibrationLayer.tsx    # Ligne lilas pastel + endpoints (FR-11)
│       │   │       ├── FloatingToolbar.tsx     # Toolbar droite (sélection, zone, calibrage, undo, zoom)
│       │   │       ├── CanvasSheet.tsx         # Bottom sheet contextuelle (aide, zones, calibrage)
│       │   │       ├── ClimaxScreen.tsx        # Volume count-up + vagues + AccountPrompt (FR-13)
│       │   │       ├── useCanvasPolygon.ts     # Vertices, drag, snap, fermeture polygone
│       │   │       ├── useDepthZones.ts        # Séparateurs, profondeurs, recalcul
│       │   │       ├── useCalibrationLine.ts   # Endpoints calibrage, saisie distance réelle
│       │   │       ├── usePointerEvents.ts     # Unification PointerEvent touch+mouse, pinch-to-zoom
│       │   │       └── canvas.test.ts
│       │   │
│       │   ├── dosage/
│       │   │   ├── DosageScreen.tsx            # Écran principal quotidien (FR-14 à FR-17)
│       │   │   ├── ProductWheel.tsx             # Roue SVG rotative 7 produits, snap animé (FR-14)
│       │   │   ├── MeasurePanel.tsx             # Champ taux + jauge galets + résultat (FR-15, FR-16)
│       │   │   ├── PreventivePanel.tsx          # Mode préventif sans saisie (Algicide, Stabilisant)
│       │   │   ├── DoseResult.tsx               # Card dose kg + décomposition conditionnements
│       │   │   ├── dosage.store.ts              # { produitActif, tauxMesure, dose, loading, error }
│       │   │   └── dosage.test.ts
│       │   │
│       │   ├── journal/
│       │   │   ├── JournalScreen.tsx            # Historique chronologique par piscine
│       │   │   └── journal.store.ts
│       │   │
│       │   ├── reglages/
│       │   │   ├── ReglagesScreen.tsx           # Valeurs cibles, thème, langue, compte, données
│       │   │   └── reglages.store.ts
│       │   │
│       │   └── auth/
│       │       ├── LoginScreen.tsx
│       │       ├── RegisterScreen.tsx
│       │       ├── auth.store.ts                # { user, session, syncStatus, loading, error }
│       │       └── auth.test.ts
│       │
│       ├── i18n/
│       │   ├── fr/
│       │   │   ├── common.json
│       │   │   ├── dosage.json
│       │   │   ├── piscine.json
│       │   │   ├── journal.json
│       │   │   ├── reglages.json
│       │   │   └── errors.json
│       │   └── en/
│       │       └── (même structure)
│       │
│       └── assets/
│           ├── icons/
│           │   ├── balnea/                      # SVG traits doux, filled, coins arrondis
│           │   └── brutale/                     # SVG monoline 2–3px, outline, angles droits
│           └── fonts/
│               ├── Lora/                        # 600, 700, italic 400, italic 700
│               └── PlusJakartaSans/             # 400, 500, 600, 700
│
├── cv-api/                                      # Micro-service Python vision par ordinateur
│   ├── Dockerfile
│   ├── requirements.txt                         # fastapi, uvicorn, opencv-python-headless, numpy
│   ├── main.py                                  # FastAPI app + CORS (frontend only)
│   ├── routers/
│   │   └── detect.py                            # POST /detect-contours
│   ├── services/
│   │   ├── contour_detection.py                 # Canny + find contours + select largest
│   │   └── perspective.py                       # Homographie 4 points → vue du dessus
│   └── tests/
│       └── test_detect.py
│
└── supabase/
    ├── .env.example
    └── migrations/
        ├── 001_init_schema.sql                  # Tables piscines, sessions, profiles + RLS
        └── 002_cascade_delete.sql               # ON DELETE CASCADE (RGPD)
```

### Architectural Boundaries

**Frontières API**

| Service | Port | Consommé par |
|---|---|---|
| Supabase PostgREST | `:8000/rest/v1/` | frontend (SDK JS) |
| Supabase Auth | `:8000/auth/v1/` | frontend (SDK JS) |
| CV API FastAPI | `:8001/detect-contours` | frontend (`lib/cv.ts`) |
| Supabase Studio | `:8000/studio` | admin uniquement |

**Frontières de données**

```
Composant React
    ↕ useLiveQuery / useState
Dexie (IndexedDB)         ← source of truth locale
    ↕ lib/sync.ts (background, non-bloquant)
Supabase PostgreSQL       ← source of truth cloud (si compte actif)
```

**Frontières du dual-theme**

```
styles/tokens.css        → définit --ink, --aqua, etc. (valeurs Balnéa par défaut)
[data-theme="brutale"]   → surcharge les mêmes tokens avec valeurs Brutale
settings.store.ts        → persiste le thème choisi dans Dexie settings
useTheme.ts              → applique data-theme sur <html>, gère le long-press logo
```

### Integration Points

**Flux de données — Configuration piscine (UJ-1)**
```
Photo/Capture → lib/cv.ts → POST cv-api/detect-contours
                          → (fallback) Canny JS Web Worker
                          → ContourLayer.tsx (SVG éditable)
                          → useDepthZones + useCalibrationLine
                          → lib/chemistry.ts calculateVolume()
                          → Dexie piscines.put()
                          → lib/sync.ts (background si compte connecté)
```

**Flux de données — Session dosage (UJ-2)**
```
ProductWheel (sélection) → dosage.store.ts produitActif
MeasurePanel (saisie)    → dosage.store.ts tauxMesure
                         → lib/chemistry.ts calculateDose()
                         → DoseResult.tsx (kg + conditionnements)
CTA "J'ai ajouté"       → Dexie sessions.add()
                         → lib/sync.ts (background si compte connecté)
```

**Intégrations externes**
- Supabase Auth : JWT stocké en mémoire par SDK — pas dans localStorage
- CV API : appelée uniquement lors de la configuration du profil (usage rare)
- Fonts : auto-hébergées en woff2 dans `assets/fonts/` — aucun appel CDN en production

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility :** toutes les technologies choisies sont compatibles.
React 19.2 + React Router v7 (requiert React 18+) ✅ · Dexie v3 + useLiveQuery ✅ ·
Zustand v5 + React 19 ✅ · Vite + vite-plugin-pwa + Vitest (même config) ✅ ·
FastAPI + OpenCV headless + Docker ✅

**Pattern Consistency :** les conventions (snake_case DB, camelCase code, PascalCase composants,
`var(--token)` CSS, shape store uniforme) sont cohérentes et sans contradiction.

**Structure Alignment :** la structure `features/` co-localisée supporte les patterns de store et
de co-location définis. Les frontières `lib/`, `components/`, `hooks/` sont claires et respectent
la règle de co-location.

### Requirements Coverage Validation ✅

**Couverture des 20 FRs :** tous couverts architecturalement.
Mapping complet FR → fichier documenté dans "Project Structure & Boundaries".

**Non-Functional Requirements :**
- Performance : calculs purs côté client dans `lib/chemistry.ts` — < 200ms garanti
- Offline : Dexie (données) + vite-plugin-pwa ServiceWorker (assets) → 100% offline
- Sécurité : HTTPS (Nginx TLS) + bcrypt via GoTrue + JWT en mémoire (pas localStorage)
- RGPD : hébergement sur serveur perso EU + RLS + ON DELETE CASCADE + page /privacy
- i18n : i18next namespaces, extensible sans modification structurelle

### Implementation Readiness Validation ✅

**Decision Completeness :** toutes les décisions critiques sont documentées avec
technologies, versions et rationale. Les anti-patterns explicites évitent les dérives d'agents.

**Structure Completeness :** arbre complet avec 40+ fichiers nommés et commentés,
frontières API documentées, flux de données UJ-1 et UJ-2 tracés bout en bout.

**Pattern Completeness :** 5 catégories de patterns (naming, structure, format,
communication, process) avec exemples ✅ et anti-patterns ❌ explicites.

### Gap Analysis Results

**Gaps mineurs (non bloquants) :**

1. **Accès caméra FR-8** — mécanisme non précisé dans les patterns.
   Résolution : utiliser `<input type="file" accept="image/*" capture="environment">` —
   compatible Safari iOS et Chrome Android sans permission explicite, pas de Web Media API.
   L'input est déclenché par un bouton dans `OnboardingScreen.tsx`.

2. **Fonts Brutale manquantes** — `Barlow Condensed` et `IBM Plex Mono` absentes de l'arbre.
   Résolution : ajouter `assets/fonts/BarlowCondensed/` et `assets/fonts/IBMPlexMono/` (woff2).

3. **Route /privacy manquante** — §7 PRD impose une politique de confidentialité accessible.
   Résolution : ajouter route `/privacy` + `features/legal/PrivacyScreen.tsx` dans le router.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status : READY FOR IMPLEMENTATION**

**Confidence Level : High** — architecture cohérente, 20/20 FRs couverts, patterns
complets avec anti-patterns explicites, structure spécifique (pas de placeholders).

**Key Strengths :**
- Local-first robuste : l'app fonctionne sans compte, sans réseau, sans CV API
- Dual-theme via CSS variables uniquement — zéro JS pour le swap de couleurs
- Vision par ordinateur avec double fallback : API → JS → manuel (FR-10 toujours dispo)
- Séquence d'implémentation imposée par les dépendances — réduit les conflits entre agents
- Calculs chimiques isolés dans une lib pure testable indépendamment de l'UI

**Areas for Future Enhancement :**
- LiDAR (iPhone 12 Pro+) — activable via Capacitor natif en version native
- Mode hémisphère sud pour les rappels saisonniers (FR-18 assumption)
- Monitoring avancé (Sentry ou équivalent) quand la base d'utilisateurs grandit

### Implementation Handoff

**AI Agent Guidelines :**
- Suivre toutes les décisions architecturales exactement telles que documentées
- Utiliser les patterns d'implémentation de façon uniforme dans tous les composants
- Respecter la structure du projet et les frontières définies
- Consulter ce document pour toute question architecturale

**First Implementation Priority :**
```bash
npm create vite@latest pooldoz -- --template react-ts
```
Suivi de la mise en place du schéma Dexie (`lib/db.ts`) et des tokens CSS (`styles/tokens.css`) —
fondations de tout le reste.
