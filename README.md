# Mes dépenses — Dépenses fixes

Application PWA minimale pour suivre des dépenses fixes mensuelles. Données stockées localement dans le navigateur (localStorage).

## Fonctionnalités
- Ajouter / supprimer des dépenses (date, montant, catégorie, note)
- Affichage de la liste et total
- Export CSV (bouton "Exporter CSV")
- PWA : manifest + service worker (cache-first) pour fonctionnement hors-ligne
- Icônes SVG (gallery/icon-192.svg, gallery/icon-512.svg)

## Installation locale (test)
1. Cloner le dépôt :
   git clone https://github.com/aptartisan-max/depenses-fixes.git
2. Ouvrir un serveur local (le service worker nécessite HTTP) :
   - Python 3 : python -m http.server 8000
3. Ouvrir http://localhost:8000 dans le navigateur.

## Publication (optionnelle)
- Activer GitHub Pages pour la branche main (root) dans les paramètres du dépôt.
- Le site sera accessible après déploiement, p.ex. https://aptartisan-max.github.io/depenses-fixes

## Notes
- Les données sont stockées uniquement dans le navigateur sous la clé localStorage: `depenses:items:v1`.
- Pour réinitialiser, utilisez le bouton « Effacer tout ».
- L’export CSV télécharge `mes-depenses.csv` avec colonnes : date, amount_eur, category, note.
