# Dépenses fixes

Suivi mensuel des prélèvements automatiques (page unique `index.html`).

En ligne : https://aptartisan-max.github.io/depenses-fixes/

## Synchronisation Google Sheets
1. Créer un Google Sheets « Dépenses fixes ».
2. Extensions → Apps Script : coller le contenu de `apps-script.gs`, enregistrer.
3. Déployer → Nouveau déploiement → Application Web — Exécuter en tant que : Moi · Qui a accès : Tout le monde.
4. Copier le lien `/exec`, puis dans l'appli : bouton « ☁︎ Google Sheets » → coller → Connecter (une fois par appareil).

Le lien `/exec` n'est jamais publié dans ce dépôt : il reste enregistré dans chaque navigateur.
