---
title: "PRD : PoolDoz"
status: final
created: 2026-06-03
updated: 2026-06-03
---

# PRD : PoolDoz

## 0. Document Purpose

Ce PRD s'adresse aux développeurs, designers et contributeurs de PoolDoz. Il définit les exigences fonctionnelles à partir du brief produit finalisé et des sessions de découverte avec le fondateur. Le vocabulaire est ancré dans le Glossaire (§3). Les features sont groupées par domaine, les FRs numérotées globalement. L'addendum recueille les choix techniques et les options écartées.

---

## 1. Vision

PoolDoz est une application web gratuite (puis native) qui permet à tout propriétaire de piscine au sel de savoir exactement quelle quantité de produit chimique ajouter — en une seule opération, sans tâtonnement.

Le problème central : les propriétaires ne connaissent pas le volume exact de leur piscine, et tous les outils existants le leur demandent. PoolDoz le calcule à leur place, via une interface de dessin ou de capture d'image. Ce volume, calculé une fois, sert de base permanente à tous les dosages futurs.

Le principe directeur de toutes les décisions produit est l'**ultra-automatisation** : l'app fait le maximum à la place de l'utilisateur. Zéro saisie inutile, zéro calcul manuel.

---

## 2. Utilisateur cible

### 2.1 Jobs To Be Done

- **Fonctionnel :** Savoir combien de sel (ou autre produit) ajouter à ma piscine, maintenant, sans me tromper.
- **Émotionnel :** Ne plus tâtonner sac après sac. Avoir confiance dans le dosage du premier coup.
- **Contextuel :** Debout au bord de la piscine, testeur à la main, ou devant le rayon sel du magasin.

### 2.2 Non-utilisateurs (hors périmètre)

- Propriétaires équipés de sondes connectées ou d'électrolyseurs avec calcul automatique intégré.
- Piscinistes professionnels gérant des dizaines de bassins (pas de mode pro/multi-client).

### 2.3 Parcours utilisateurs

**UJ-1. Marc configure sa piscine pour la première fois.**
- **Persona + contexte :** Marc, propriétaire d'un pavillon avec piscine au sel, a hérité de la piscine avec la maison et ne connaît pas son volume.
- **État d'entrée :** App ouverte pour la première fois, sans compte.
- **Parcours :**
  1. L'app propose de créer un compte ou de continuer sans (avec avertissement de perte de données).
  2. Marc choisit un mode d'entrée : photo depuis la terrasse, import d'une capture d'écran de Maps, ou dessin manuel.
  3. L'app détecte automatiquement les contours de la piscine (photo ou capture). Marc affine si besoin.
  4. Marc dessine des zones de profondeur sur le plan, entre une ou deux valeurs par zone (fond plat ou pan incliné).
  5. Marc trace une ligne sur le plan entre deux points connus, entre la distance réelle → mise à l'échelle automatique.
  6. L'app calcule et affiche le volume total. Le profil est sauvegardé.
- **Climax :** Marc voit "Volume de votre piscine : 47,3 m³" — pour la première fois, il connaît le volume exact de sa piscine.
- **Résolution :** Marc peut immédiatement lancer une session de dosage, ou quitter et revenir plus tard.
- **Cas limite :** La détection automatique échoue → l'app demande à Marc de placer manuellement 4 points sur les coins de la piscine.

**UJ-2. Marc vérifie et corrige son sel en début de saison.**
- **Persona + contexte :** Marc revient en mai pour l'ouverture. Il a mesuré son taux de sel avec son testeur.
- **État d'entrée :** App ouverte, profil piscine déjà sauvegardé. Bannière de rappel : "Saison d'ouverture — avez-vous vérifié votre sel ?"
- **Parcours :**
  1. Marc sélectionne sa piscine (il en a peut-être plusieurs).
  2. Il choisit le produit : Sel.
  3. Il entre son taux mesuré : 2800 PPM. La valeur cible (3200 PPM) est déjà renseignée.
  4. L'app calcule : "Ajoutez 14,2 kg — soit 1 sac de 10 kg + 1 sac de 5 kg."
  5. Le score visuel s'affiche : 🟠 Taux bas — complément recommandé.
- **Climax :** Marc sait exactement quoi acheter. Il achète, ajoute, termine.
- **Résolution :** Une seule session. Pas d'itération.

---

## 3. Glossaire

- **Piscine** — Le bassin de l'utilisateur. Un compte peut contenir plusieurs piscines.
- **Profil** — L'ensemble {plan + zones de profondeur + volume calculé} associé à une piscine. Sauvegardé et réutilisé à chaque session de dosage.
- **Plan** — La représentation 2D de la piscine vue du dessus, issue d'un dessin, d'une photo ou d'une capture d'écran.
- **Zone de profondeur** — Une portion du plan à laquelle est associée une profondeur. Peut être plate (1 valeur) ou inclinée (2 valeurs : bord A et bord B).
- **Pan incliné** — Transition entre deux niveaux de profondeur. Volume calculé par interpolation linéaire entre les deux valeurs.
- **Cote de calibrage** — Une distance réelle (en mètres) saisie par l'utilisateur sur le plan pour mettre l'ensemble du dessin à l'échelle.
- **Volume** — La contenance totale de la piscine en m³, calculée par l'app à partir du plan et des zones de profondeur.
- **PPM** — Parts Per Million. Unité de concentration d'un produit chimique dans l'eau (ex. sel : cible 3200 PPM).
- **Taux mesuré** — La valeur PPM (ou équivalente) obtenue par l'utilisateur avec son testeur externe.
- **Taux cible** — La concentration recommandée par défaut pour chaque produit. Modifiable par l'utilisateur.
- **Dosage** — La quantité de produit chimique à ajouter, exprimée en kg/litres et en nombre de conditionnements courants.
- **Score visuel** — Indicateur coloré (vert/orange/rouge) résumant l'état du taux mesuré par rapport au taux cible.
- **Session de dosage** — Une utilisation de l'app pour calculer un dosage à partir d'un taux mesuré et du profil sauvegardé.
- **Rappel contextuel** — Bannière affichée à l'ouverture de l'app si une vérification saisonnière est recommandée et non effectuée depuis trop longtemps.

---

## 4. Features

### 4.1 Compte utilisateur et persistance des données

**Description :** PoolDoz fonctionne sans inscription mais avertit l'utilisateur du risque de perte de données. Un compte email/mot de passe permet la sauvegarde cloud et l'accès multi-appareils. Réalise UJ-1.

**Exigences fonctionnelles :**

#### FR-1 : Mode sans compte

L'utilisateur peut utiliser PoolDoz sans créer de compte. Les données du profil sont stockées dans le localStorage du navigateur.

**Conséquences (testables) :**
- Un profil créé sans compte est accessible à la réouverture du navigateur sur le même appareil.
- Si le localStorage est vidé, les données sont perdues et l'app repart de zéro.

#### FR-2 : Avertissement et invitation à créer un compte

L'app affiche un avertissement persistant à tout utilisateur sans compte l'informant du risque de perte de données et l'invitant à créer un compte.

**Conséquences (testables) :**
- L'avertissement est visible sur toutes les pages principales pour un utilisateur non connecté.
- Un bouton "Créer un compte" dans l'avertissement mène directement au formulaire d'inscription.

#### FR-3 : Inscription et connexion

L'utilisateur peut créer un compte avec une adresse email et un mot de passe. Il peut se connecter et se déconnecter.

**Conséquences (testables) :**
- L'inscription requiert un email valide et un mot de passe d'au moins 8 caractères.
- Un email de confirmation est envoyé à l'inscription.
- La connexion échoue avec des identifiants incorrects et affiche un message d'erreur explicite.

#### FR-4 : Synchronisation cloud

Pour un utilisateur connecté, tous les profils de piscines sont sauvegardés côté serveur et accessibles depuis n'importe quel appareil.

**Conséquences (testables) :**
- Un profil créé sur mobile est accessible depuis un navigateur desktop après connexion.
- La suppression d'un profil côté serveur est reflétée sur tous les appareils connectés.

---

### 4.2 Gestion multi-piscines

**Description :** Un utilisateur peut gérer plusieurs piscines dans le même compte. Chaque piscine a un nom et son propre profil. Réalise UJ-1, UJ-2.

**Exigences fonctionnelles :**

#### FR-5 : Liste des piscines

L'utilisateur voit la liste de ses piscines à l'ouverture de l'app et peut en sélectionner une.

**Conséquences (testables) :**
- La liste affiche le nom et le volume calculé de chaque piscine.
- Si l'utilisateur n'a qu'une piscine, l'app la sélectionne directement sans afficher la liste.

#### FR-6 : Création et suppression de profil

L'utilisateur peut créer un nouveau profil de piscine et supprimer un profil existant.

**Conséquences (testables) :**
- La suppression d'un profil demande une confirmation explicite.
- Un profil supprimé ne peut pas être récupéré.

---

### 4.3 Création du profil piscine — Dessin et capture

**Description :** L'utilisateur établit le plan de sa piscine via l'un des trois modes d'entrée disponibles. L'objectif est d'obtenir un contour précis avec le minimum d'effort (ultra-automatisation). Réalise UJ-1.

**Exigences fonctionnelles :**

#### FR-7 : Mode dessin manuel

L'utilisateur trace le contour de sa piscine point par point sur un canvas vide.

**Conséquences (testables) :**
- L'utilisateur peut placer, déplacer et supprimer des points.
- La forme se ferme automatiquement au clic sur le point de départ ou via un bouton "Fermer".
- Snap aux angles droits disponible en option.

#### FR-8 : Mode photo

L'utilisateur prend une photo de sa piscine depuis la terrasse (caméra du téléphone ou import depuis galerie). L'app corrige automatiquement la distorsion et la perspective pour restituer une vue du dessus exploitable.

**Conséquences (testables) :**
- Sur les appareils LiDAR compatibles, la mesure LiDAR est utilisée en priorité pour la correction.
- L'app détecte automatiquement les contours de la piscine sur la photo corrigée.
- Si la détection échoue, l'app demande à l'utilisateur de placer manuellement 4 points sur les coins de la piscine (FR-10).
- L'utilisateur peut affiner le contour détecté avant validation.

#### FR-9 : Mode capture d'écran Maps

L'utilisateur importe une capture d'écran d'une vue satellite de sa piscine (depuis Google Maps, Apple Plans ou tout autre service). L'app détecte automatiquement les contours de la piscine.

**Conséquences (testables) :**
- L'app accepte les formats JPEG et PNG.
- La détection automatique des contours est lancée dès l'import.
- Si la détection échoue, l'app bascule vers le placement manuel de 4 points (FR-10).
- L'utilisateur peut affiner le contour détecté avant validation.

#### FR-10 : Fallback — Placement manuel de points

Si la détection automatique de contours échoue (FR-8 ou FR-9), l'app invite l'utilisateur à placer manuellement les points clés du contour de la piscine.

**Conséquences (testables) :**
- L'app affiche un message clair expliquant pourquoi le mode manuel est requis.
- L'utilisateur peut placer autant de points que nécessaire pour décrire la forme.

---

### 4.4 Zones de profondeur et calcul de volume

**Description :** Sur le plan établi, l'utilisateur définit les profondeurs. L'app calcule le volume total en tenant compte des fonds plats, en pente et des zones à géométrie variable. Réalise UJ-1.

**Exigences fonctionnelles :**

#### FR-11 : Calibrage par cote unique

L'utilisateur trace un segment sur le plan entre deux points dont il connaît la distance réelle, et entre cette valeur. L'app met l'intégralité du plan à l'échelle.

**Conséquences (testables) :**
- Après saisie de la cote, toutes les dimensions affichées sont exprimées en mètres à l'échelle correcte.
- L'utilisateur peut recalibrer à tout moment ; le volume est recalculé automatiquement.

#### FR-12 : Zones de profondeur

L'utilisateur délimite des zones sur le plan et associe une profondeur à chacune.

**Conséquences (testables) :**
- Une zone peut recevoir une profondeur unique (fond plat) ou deux profondeurs (bord A et bord B → pan incliné).
- La somme des zones de profondeur doit couvrir l'intégralité du plan avant validation.
- L'app signale les zones non renseignées.

#### FR-13 : Calcul automatique du volume

L'app calcule le volume total de la piscine à partir du plan à l'échelle et des zones de profondeur.

**Conséquences (testables) :**
- Le volume est affiché en m³ avec deux décimales.
- Pour un pan incliné, le volume est calculé par interpolation linéaire entre les deux profondeurs.
- Le volume est recalculé automatiquement à chaque modification du plan ou des zones.

---

### 4.5 Session de dosage

**Description :** L'utilisateur entre son taux mesuré et l'app calcule le dosage exact à ajouter pour chaque produit chimique. Réalise UJ-2.

**Exigences fonctionnelles :**

#### FR-14 : Sélection du produit

L'utilisateur choisit le produit chimique à doser parmi : sel, chlore, pH+, pH−, anti-algues.

**Conséquences (testables) :**
- Chaque produit affiche son unité de mesure appropriée (PPM pour le sel, mg/L pour le chlore, pH pour l'acidité, etc.).
- La liste des produits est exhaustive pour la V1.

#### FR-15 : Valeurs cibles suggérées et modifiables

Chaque produit dispose d'une valeur cible par défaut, conforme aux standards industrie. L'utilisateur peut la modifier et la valeur personnalisée est mémorisée par profil.

**Conséquences (testables) :**
- Valeurs cibles par défaut : sel 3200 PPM, pH 7.4, chlore 1.5 mg/L. `[ASSUMPTION: valeurs à valider avec sources chimie piscine — voir OQ-2]`
- Une valeur cible modifiée est sauvegardée dans le profil de la piscine concernée.
- Un bouton "Réinitialiser" restaure la valeur par défaut.

#### FR-16 : Calcul du dosage

L'utilisateur entre son taux mesuré. L'app calcule et affiche la quantité de produit à ajouter.

**Conséquences (testables) :**
- Le résultat est exprimé en kg (ou litres) avec une décimale.
- Le résultat est converti en nombre de conditionnements courants (sacs 5 kg, 10 kg, 25 kg pour le sel ; flacons pour les liquides). `[ASSUMPTION: conditionnements à confirmer par marché FR/EU]`
- Si le taux mesuré est supérieur ou égal au taux cible, l'app indique "Aucun ajout nécessaire" et affiche le score vert.

#### FR-17 : Score visuel

L'app affiche un indicateur coloré après chaque calcul de dosage.

**Conséquences (testables) :**
- 🟢 Vert : taux mesuré dans la plage cible (±5%). `[ASSUMPTION: tolérance à valider]`
- 🟠 Orange : taux mesuré hors plage mais sans danger immédiat.
- 🔴 Rouge : taux critique (trop bas → risque sanitaire / trop haut → risque équipement).
- Le score est affiché de façon proéminente avant le détail du calcul.

---

### 4.6 Rappels contextuels

**Description :** L'app rappelle à l'utilisateur de vérifier sa chimie aux périodes clés de l'année, sans notification push. Réalise UJ-2.

**Exigences fonctionnelles :**

#### FR-18 : Bannière de rappel saisonnier

À l'ouverture de l'app, si une vérification saisonnière recommandée n'a pas été effectuée dans le délai habituel, l'app affiche une bannière de rappel.

**Conséquences (testables) :**
- Rappel d'ouverture : affiché en mai (hémisphère nord) si aucune session de dosage n'a été enregistrée depuis plus de 6 mois. `[ASSUMPTION: mois à adapter pour hémisphère sud dans une version ultérieure]`
- Rappel d'hivernage : affiché en septembre selon la même logique.
- La bannière est dismissable et ne réapparaît pas avant le cycle suivant.
- Les rappels sont adaptés à la langue de l'interface.

---

### 4.7 Internationalisation

**Description :** PoolDoz détecte automatiquement la langue de l'utilisateur et s'affiche dans la langue appropriée. Réalise le principe ultra-automatisation.

**Exigences fonctionnelles :**

#### FR-19 : Détection automatique de la langue

L'app détecte la langue du navigateur/système à l'ouverture et s'affiche dans la langue correspondante.

**Conséquences (testables) :**
- Langues supportées au lancement : Français, Anglais.
- Si la langue détectée n'est pas supportée, l'app bascule sur l'anglais par défaut.
- L'utilisateur peut changer la langue manuellement depuis les paramètres.

#### FR-20 : Unités métriques

Toutes les mesures sont exprimées en unités métriques (m, m³, kg, mg/L).

**Conséquences (testables) :**
- Aucune unité impériale n'est affichée en V1.

---

## 5. Non-objectifs

- Intégration API Google Maps (coûts incompatibles avec le modèle gratuit)
- Notifications push (l'app n'est pas ouverte en permanence)
- Mode professionnel / multi-clients
- Unités impériales (gallons, pounds)
- Connexion sociale (Google, Apple Sign-In)
- Calcul automatique de la composition chimique complète de l'eau (test multi-paramètres)
- Historique et graphiques de suivi chimique
- Partage de profil piscine avec un tiers (ami, pisciniste)
- Curseur de niveau d'eau (ajustement du volume pour piscine partiellement remplie)

---

## 6. Périmètre

Tout ce qui est dans §4 est dans le produit. Il n'y a pas de phase 2 ni de MVP différé : PoolDoz est livré complet dès le premier lancement.

---

## 7. Exigences non fonctionnelles

- **Web responsive :** l'app fonctionne depuis un navigateur mobile sans installation. Interface optimisée pour usage en extérieur (contraste, taille des boutons).
- **Accès caméra :** l'app demande la permission d'accès à la caméra uniquement au moment où l'utilisateur choisit le mode photo.
- **Performance :** les calculs de volume et de dosage sont instantanés (< 200 ms) côté client.
- **Sécurité :** toutes les communications transitent en HTTPS. Les mots de passe sont stockés hashés (bcrypt ou équivalent).
- **RGPD :** les données personnelles (email, profils de piscine) sont hébergées en Union Européenne. Une politique de confidentialité est accessible depuis l'app. L'utilisateur peut supprimer son compte et toutes ses données.
- **i18n :** l'architecture du code supporte l'ajout de nouvelles langues sans modification structurelle.

---

## 8. Platform & Monetisation

- **Plateforme V1 :** Application web progressive (PWA), utilisable depuis tout navigateur moderne sur mobile et desktop.
- **Applications natives :** iOS et Android en version ultérieure, sur la même base de code (ex. Capacitor/React Native).
- **Modèle économique :** gratuit. Un bouton de don volontaire est accessible depuis les paramètres ou la page d'accueil.

---

## 9. Métriques de succès

**Primaires**
- **SM-1 :** Un utilisateur obtient un résultat de dosage complet sans connaître le volume de sa piscine au préalable. Valide FR-11 à FR-16.
- **SM-2 :** La création du profil piscine (de l'import/dessin au volume calculé) prend moins de 5 minutes. Valide FR-7 à FR-13.
- **SM-3 :** Le dosage calculé est exact au premier essai — l'utilisateur n'a pas besoin d'itérer par ajouts successifs. Valide FR-16.

**Secondaires**
- **SM-4 :** L'app est utilisable sans formation ni documentation. Valide l'ensemble de §4.
- **SM-5 :** L'app est fonctionnelle sur les principaux navigateurs mobiles (Safari iOS, Chrome Android). Valide §7 NFR.

**Contre-métriques (ne pas optimiser)**
- **SM-C1 :** Ne pas optimiser le nombre de sessions par utilisateur — PoolDoz est par nature peu fréquent (2-4× par saison). Un indicateur de fréquence élevée signalerait une UX défaillante, pas une adoption forte.

---

## 10. Questions ouvertes

- **OQ-1 :** Conditions d'utilisation des captures d'écran Google Maps / Apple Plans dans une application publiée. Valider avant lancement.
- **OQ-2 :** Valeurs cibles par défaut pour chaque produit chimique (sel, chlore, pH+, pH−, anti-algues) — à valider avec des sources spécialisées chimie piscine.
- **OQ-3 :** Faisabilité technique de la détection automatique de contours sur photo et capture d'écran — quelle bibliothèque/algorithme ? À confirmer en architecture.
- **OQ-4 :** Coûts d'hébergement pour les comptes utilisateurs (base de données, stockage) — impact sur le modèle gratuit/don.
- **OQ-5 :** Périmètre exact des conditionnements courants (sacs de sel, flacons) par marché (FR, EU, UK, US) — à affiner par locale.

---

## 11. Index des hypothèses

- **[ASSUMPTION FR-15] :** Valeurs cibles par défaut (sel 3200 PPM, pH 7.4, chlore 1.5 mg/L) — à valider chimie piscine (→ OQ-2).
- **[ASSUMPTION FR-16] :** Conditionnements courants (5/10/25 kg pour le sel) — à confirmer par locale (→ OQ-5).
- **[ASSUMPTION FR-17] :** Tolérance du score vert à ±5% du taux cible — à valider avec les standards industrie.
- **[ASSUMPTION FR-8] :** Liste des appareils LiDAR compatibles (iPhone 12 Pro+, certains Android) — à confirmer en architecture.
- **[ASSUMPTION FR-18] :** Mois de rappel (mai / septembre) valables pour l'hémisphère nord uniquement — à adapter pour les utilisateurs de l'hémisphère sud.
