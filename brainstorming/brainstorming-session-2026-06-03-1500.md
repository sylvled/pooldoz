---
stepsCompleted: [1, 2, 3, 4]
session_active: false
workflow_completed: true
inputDocuments: []
session_topic: 'Application SaaS de calcul de sel pour piscine avec interface de dessin à l''écran'
session_goals: 'Explorer toutes les dimensions du produit — fonctionnalités, marchés, modèle économique, différenciation, usages inattendus'
selected_approach: 'random-selection'
techniques_used: ['Alien Anthropologist', 'Question Storming', 'Pirate Code Brainstorm']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Date:** 2026-06-03

## Session Overview

**Topic:** Application SaaS de calcul de sel pour piscine avec interface de dessin à l'écran
**Goals:** Explorer toutes les dimensions du produit — fonctionnalités, marchés, modèle économique, différenciation, usages inattendus

### Session Setup

Nouvelle session démarrée pour explorer une idée de SaaS innovante : une application permettant de dessiner sa piscine à l'écran pour calculer la quantité de sel nécessaire.

## Technique Selection

**Approach:** Sélection Aléatoire de Techniques
**Selection Method:** Découverte sérendipiteuse parmi 36+ techniques

**Techniques Sélectionnées au Hasard :**

- **Alien Anthropologist :** Examiner l'idée à travers les yeux d'un extraterrestre pour révéler les hypothèses cachées
- **Question Storming :** Générer uniquement des questions pour définir correctement l'espace du problème
- **Pirate Code Brainstorm :** Piller ce qui fonctionne ailleurs et remixer sans permission

**Random Discovery Story:** Combinaison alien + questions profondes + esprit pirate — un combo explosif pour explorer un SaaS piscine sous tous les angles inattendus.

## Technique Execution Results

### 🛸 Alien Anthropologist

**[Feature #1]** : Le Détective de Volume
*Concept* : L'application calcule le volume en faisant dessiner la piscine en vue du dessus ET en profil. Fond en pente, marches, zone peu profonde : tout est dessinable.
*Novelty* : Aucun concurrent ne propose un outil de dessin 2.5D pour des piscines avec fonds variables. La plupart demandent juste "longueur × largeur × profondeur".

**[Feature #2]** : L'Œil du Satellite
*Concept* : Import d'une image satellite (Google Maps, etc.) comme calque de fond. L'utilisateur trace les contours de sa piscine par-dessus. Une seule mesure réelle cale automatiquement toute l'image à l'échelle.
*Novelty* : Transforme une donnée publique gratuite en outil de précision professionnel. Aucun effort de mesure, juste du tracé.

**[Feature #3]** : La Cote Unique
*Concept* : Algorithme de mise à l'échelle basé sur une mesure de référence unique. L'utilisateur tape "8m" sur n'importe quel côté connu → toutes les autres dimensions sont recalculées proportionnellement.
*Novelty* : Réduit l'effort de saisie au strict minimum. Même un enfant peut faire le relevé avec un mètre ruban sur un seul côté.

**[Feature #4]** : La Mémoire de la Piscine
*Concept* : Compte utilisateur avec profil persistant — forme, volume calculé, profondeur. Une fois créée, la piscine est là pour toujours. Le calcul de volume complexe ne se fait qu'une seule fois.
*Novelty* : Toutes les futures requêtes partent de cette base sans recalcul.

**[Feature #5]** : Le Calcul PPM de Complément
*Concept* : Le cœur du produit. L'utilisateur mesure son taux de sel actuel (PPM), le saisit dans l'app. L'app connaît le volume, connaît le taux cible, calcule exactement le complément de sel à ajouter. Répété ~2x par an.
*Novelty* : Simple en apparence, mais nécessite le volume précis — que justement la plupart des propriétaires n'ont pas. C'est là que le dessin prend tout son sens.

**[Market #1]** : Monsieur et Madame Tout-le-Monde
*Concept* : Cible = propriétaire de piscine lambda, sans équipement connecté, qui achète son testeur de sel à 15€ en grande surface et ne sait pas quoi faire du résultat affiché.
*Novelty* : Le marché "smart pool" est saturé et cher. Le marché du propriétaire ordinaire est énorme et mal servi.

**[UX #1]** : Le Calcul au Rayon
*Concept* : L'app calcule non seulement les kg de sel manquants, mais les convertit en nombre de sacs selon le conditionnement courant (5kg, 10kg, 25kg). "Il vous faut 3 sacs de 25kg."
*Novelty* : L'utilisateur utilise l'app au moment de l'achat, en point de vente — pas à la maison.

---

### ❓ Question Storming — Questions clés sans réponse

- Qui achète le testeur de sel — le propriétaire ou quelqu'un d'autre ?
- À quelle fréquence un propriétaire pense-t-il à vérifier son sel ?
- Que se passe-t-il si on met trop de sel ?
- Y a-t-il une saisonnalité forte — ouverture/fermeture de piscine ?
- Comment l'utilisateur sait-il quel PPM cible viser selon son système ?
- L'utilisateur sait-il ce qu'est un PPM ?
- A-t-il déjà raté un dosage et abîmé sa piscine ou sa peau ?
- Combien de piscines privées existent en France ? En Europe ?
- L'app est-elle gratuite, freemium, payante une fois, abonnement ?
- Qui d'autre veut que M. Tout-le-monde mette le bon dosage — les fabricants de sel ?
- L'import Google Maps est-il légalement autorisé pour ce type d'usage ?
- Faut-il une app mobile, une web app, ou les deux ?
- Le dessin à l'écran fonctionne-t-il bien sur mobile avec les doigts ?
- Y a-t-il d'autres produits à doser dans une piscine qu'on pourrait intégrer ?
- Ce problème existe-t-il aussi pour les spas et jacuzzis ?

---

### 🏴‍☠️ Pirate Code Brainstorm

**[UX #2]** : Le Geste Immobilier
*Concept* : Reprendre l'UX des apps de plan d'appartement — tracé point à point, snap aux angles droits, affichage du périmètre en temps réel — appliqué à la piscine.
*Novelty* : UX déjà validée par des millions d'utilisateurs. Pas besoin de réinventer le dessin vectoriel.

**[Feature #6]** : Le Scanner de Piscine
*Concept* : L'utilisateur pointe son téléphone vers sa piscine. L'app utilise la caméra (et LiDAR sur iPhone) pour détecter les contours de la surface d'eau et estimer les dimensions. Résultat : un dessin pré-rempli à valider.
*Novelty* : Zéro saisie manuelle, zéro import satellite. Piratage de la techno de scan de pièces appliquée à l'extérieur.

**[Feature #7]** : Le Curseur de Niveau d'Eau
*Concept* : Slider "ma piscine est remplie à X%". Si l'eau est basse après l'été, le volume effectif change et le calcul s'ajuste automatiquement.
*Novelty* : Prend en compte la réalité terrain sans recalcul complet.

**[Feature #8]** : Le Score de Piscine
*Concept* : Après chaque mesure, l'app affiche un score visuel (vert/orange/rouge) : "Parfait", "Ajouter du sel", "Attention : surdosage".
*Novelty* : Transforme une donnée chimique anxiogène en information immédiatement actionnable pour le non-expert.

**[Feature #9]** : Le Rappel Saisonnier
*Concept* : Notification en mai ("Pensez à tester votre sel avant l'ouverture !") et en septembre ("Vérifiez votre dosage avant l'hivernage").
*Novelty* : L'app vient chercher l'utilisateur au bon moment plutôt que d'attendre qu'il s'en souvienne.

**[Feature #10]** : Le Partage de Piscine
*Concept* : L'utilisateur peut partager son profil de piscine avec un ami ou son pisciniste — qui voit le volume, le dernier taux mesuré, la quantité recommandée.
*Novelty* : Facilite la communication avec un pro sans avoir à tout réexpliquer.

---

## Synthèse de Session

**10 idées générées** across features, UX, et market positioning.

**Percées majeures :**
- Le volume précis est le problème central — tout le reste en découle
- L'usage principal se passe au magasin, devant le rayon sel
- Cible : particulier sans équipement connecté
- Trois modes d'entrée du plan : dessin manuel, import satellite, scan téléphone

**Questions prioritaires à résoudre :**
- Légalité de l'import Google Maps
- Mobile vs web app
- Modèle économique
- Connaissance du PPM par l'utilisateur cible

---

## Organisation et Priorisation des Idées

### Thèmes identifiés

**🎯 Thème 1 : Capture du Volume (prioritaire)**
- Feature #1 — Dessin 2.5D avec fonds en pente et marches
- Feature #2 — Import image satellite comme calque de fond
- Feature #3 — Cote unique pour mise à l'échelle automatique
- Feature #6 — Scanner de piscine via caméra/LiDAR

**⚗️ Thème 2 : Calcul et Dosage (prioritaire)**
- Feature #5 — Calcul PPM → kg de sel manquants
- Feature #7 — Curseur de niveau d'eau
- UX #1 — Conversion en nombre de sacs au rayon
- Feature #8 — Score visuel vert/orange/rouge

**🔄 Thème 3 : Engagement & Rétention (post-MVP)**
- Feature #4 — Profil de piscine persistant
- Feature #9 — Rappels saisonniers
- Feature #10 — Partage du profil

### Prioritisation MVP

| Priorité | Feature | Rôle |
|---|---|---|
| 1 | Dessin 2.5D (fonds variables, marches) | Sans volume précis, rien ne fonctionne |
| 2 | Cote unique (mise à l'échelle auto) | Rend le dessin accessible à tous |
| 3 | Calcul PPM → sel manquant | Promesse centrale du produit |
| 4 | Conversion en sacs (5/10/25kg) | Résultat immédiatement actionnable |

### Post-MVP
- Import satellite (Feature #2)
- Scanner LiDAR (Feature #6)
- Score visuel, rappels saisonniers, partage

---

## Prochaines Étapes

1. Valider la légalité de l'import Google Maps
2. Tester des apps de dessin de plan existantes pour inspiration UX
3. Lancer `bmad-bmm-create-product-brief` pour formaliser le brief produit
4. Lancer `bmad-bmm-create-prd` pour le document d'exigences complet

