---
title: "PoolDoz — Calculateur de Produits Chimiques pour Piscine"
status: final
created: 2026-06-03
updated: 2026-06-03
---

# Product Brief : PoolDoz

## Résumé exécutif

PoolDoz est une application web (puis mobile) gratuite qui dit à un propriétaire de piscine exactement quelle quantité de produit chimique ajouter — sel, chlore, pH, anti-algues — sans approximation ni tâtonnement. L'utilisateur dessine sa piscine à l'écran, entre une seule mesure réelle pour calibrer le dessin, et l'app calcule un volume précis. Ce volume sert ensuite de base permanente à tous les calculs de dosage futurs.

Le problème que PoolDoz résout est simple : les propriétaires de piscine ne connaissent pas le volume exact de leur bassin, et les outils existants (calculateurs web, apps) leur demandent pourtant de le connaître. PoolDoz est le seul outil qui calcule ce volume à leur place, via une interface de dessin intuitive, avant de répondre à la vraie question : combien de produit mettre ?

## Le Problème

Gérer la chimie d'une piscine au sel se fait aujourd'hui à l'aveugle. Le propriétaire mesure son taux de sel, ajoute un sac de 10 kg, attend la dissolution, mesure à nouveau, constate la progression, et recommence — plusieurs fois par session. C'est long, laborieux, et imprécis.

La cause racine : personne ne sait exactement combien d'eau contient sa piscine. Les piscines ne sont pas toujours construites par leurs propriétaires actuels. Les formes sont souvent irrégulières — bassin en L, fond en pente, marches, zone peu profonde. Un simple calcul "longueur × largeur × profondeur" est faux pour la majorité des piscines réelles.

Sans volume précis, impossible de calculer le dosage juste en une fois. Les conséquences d'un mauvais dosage sont réelles : trop peu de sel signifie une production de chlore insuffisante, de l'eau malsaine, une usure prématurée de l'électrolyseur. Trop de sel abîme les équipements métalliques et irrite la peau.

## La Solution

PoolDoz résout le problème à la racine : calculer le volume avant de calculer le dosage.

**Étape 1 — Dessiner sa piscine (une fois)**
L'utilisateur trace la forme de sa piscine à l'écran. Deux modes en V1 :
- Dessin manuel point à point (forme libre)
- Scan de la piscine via la caméra du téléphone (mode optionnel)

_(L'import d'image satellite est prévu en phase 2.)_

Une seule mesure réelle suffit ensuite à mettre tout le dessin à l'échelle. Les fonds en pente, les marches, et les dénivelés sont pris en compte via un profil de coupe.

**Étape 2 — Calculer le dosage (régulièrement)**
L'utilisateur entre son taux mesuré (PPM pour le sel, valeurs pour le pH, le chlore, etc.) et l'app calcule immédiatement le complément exact à ajouter — exprimé en kilogrammes et en nombre de sacs ou flacons selon les conditionnements courants. Le profil de la piscine est sauvegardé : le calcul de volume ne se fait qu'une seule fois.

L'app couvre tous les produits chimiques courants : sel, chlore, pH+, pH−, anti-algues.

## Ce qui rend PoolDoz différent

Tous les calculateurs existants (Pentair, Hayward, OmniCalculator, Pool Water Calculator) supposent que l'utilisateur connaît son volume. PoolDoz est le premier outil à le calculer via le dessin.

| Fonctionnalité | Concurrents | PoolDoz |
|---|---|---|
| Calcul de dosage | ✅ | ✅ |
| Volume calculé automatiquement | ❌ | ✅ |
| Interface de dessin | ❌ | ✅ |
| Formes irrégulières et fonds en pente | ❌ | ✅ |
| Import image satellite | Rarement | ✅ |
| Profil persistant (compte utilisateur) | Rarement | ✅ |
| Marché français / métrique | Partiel | ✅ |
| Tous produits chimiques | Partiel | ✅ |

L'avantage réel est l'exécution : la combinaison dessin + calibrage par une seule mesure + dosage multi-produits n'existe nulle part. Le fondateur est lui-même propriétaire d'une piscine au sel et utilisateur du produit.

## Pour qui

**Utilisateur principal :** Propriétaire de piscine privée au sel, sans équipement connecté. Il achète son testeur basique en grande surface, ne connaît pas le volume exact de sa piscine, et veut une réponse simple et fiable à la question "combien je mets ?". Pas de segmentation fine — c'est potentiellement tous les propriétaires de piscine au sel dans le monde.

**Usage typique :** Deux à quatre fois par saison. Souvent au moment d'acheter les produits — l'app est utilisée en point de vente pour savoir exactement combien de sacs prendre.

**Non-cible :** Les propriétaires équipés de sondes connectées ou d'électrolyseurs avec calcul automatique intégré.

## Critères de succès

- L'utilisateur obtient un résultat de dosage sans connaître le volume de sa piscine
- Le dessin de la piscine prend moins de 5 minutes, calibrage inclus
- Le calcul de dosage est juste au premier essai (pas d'itération nécessaire)
- L'app est utilisable sur mobile depuis le navigateur sans installation
- Adoption internationale via i18n complet dès le lancement

## Périmètre — Version 1

**Inclus :**
- Outil de dessin de piscine (dessin manuel + cote de calibrage)
- Calcul de volume (formes libres, fonds en pente, marches)
- Profil de piscine persistant (compte utilisateur)
- Calcul de dosage : sel, chlore, pH+, pH−, anti-algues
- Résultat exprimé en kg et en nombre de sacs/flacons courants
- Application web responsive, utilisable sur mobile
- Accès caméra pour scan de la piscine (mode optionnel)
- i18n multilingue dès le départ
- Modèle gratuit avec don volontaire

**Hors périmètre V1 :**
- Application native iOS / Android (phase 2)
- Import image satellite (phase 2)
- Intégration avec sondes connectées
- Historique et graphiques de suivi chimique (phase 2)
- Rappels saisonniers automatiques (phase 2)
- Partage de profil (phase 2)

## Vision

PoolDoz devient le compagnon de référence de tout propriétaire de piscine dans le monde — une app qu'on configure une fois et qu'on rouvre à chaque ouverture de saison. À terme, elle couvre l'ensemble du suivi chimique (sel, chlore, pH, algues, hivernage), s'enrichit d'apps natives iOS et Android, et intègre des guides contextuels adaptés au niveau de l'utilisateur. Elle reste gratuite et indépendante.
