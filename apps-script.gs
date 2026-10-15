/**
 * Dépenses fixes — synchronisation Google Sheets
 *
 * À coller dans : Google Sheets « Dépenses fixes » → Extensions → Apps Script.
 * Puis : Déployer → Nouveau déploiement → Application Web
 *        Exécuter en tant que : Moi · Qui a accès : Tout le monde
 *
 * - L'onglet « Données » contient la sauvegarde complète de l'appli (ne pas modifier à la main).
 * - Les onglets « Liste » et « Suivi mensuel » sont des copies lisibles, mises à jour à chaque changement.
 */

const DATA_SHEET = 'Données';
const CHUNK = 40000; // une cellule Google Sheets accepte au maximum 50 000 caractères

function doGet() {
  return json_({ ok: true, data: readData_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = e.postData.contents;
    const data = JSON.parse(body); // vérifie que c'est bien du JSON valide
    if (!data || !Array.isArray(data.items)) throw new Error('données invalides');
    writeData_(body);
    writeReadable_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readData_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  if (!sh || sh.getLastRow() === 0) return null;
  const text = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => r[0]).join('');
  return text ? JSON.parse(text) : null;
}

function writeData_(text) {
  const sh = sheet_(DATA_SHEET);
  sh.clear();
  const rows = [];
  for (let i = 0; i < text.length; i += CHUNK) rows.push([text.slice(i, i + CHUNK)]);
  // format « texte brut » : Sheets n'interprète pas le contenu comme une formule ou un nombre
  sh.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
}

function writeReadable_(data) {
  const items = data.items.slice().sort((a, b) => a.day - b.day);

  const list = sheet_('Liste');
  list.clear();
  const listRows = [['Jour', 'Nom', 'Catégorie', 'Montant habituel (€)']]
    .concat(items.map(i => [i.day, i.name, i.cat, i.amount]));
  list.getRange(1, 1, listRows.length, 4).setValues(listRows);
  list.getRange(1, 1, 1, 4).setFontWeight('bold');

  const suivi = sheet_('Suivi mensuel');
  suivi.clear();
  const rows = [['Mois', 'Jour', 'Nom', 'Catégorie', 'Montant (€)', 'Payé', 'Ignoré']];
  Object.keys(data.months || {}).sort().reverse().forEach(month => {
    const md = data.months[month] || {};
    if (Object.keys(md).length === 0) return;
    items.forEach(i => {
      const ov = md[i.id] || {};
      rows.push([month, i.day, i.name, i.cat,
        typeof ov.amount === 'number' ? ov.amount : i.amount,
        ov.paid ? 'oui' : '', ov.skipped ? 'oui' : '']);
    });
  });
  suivi.getRange(1, 1, rows.length, 7).setValues(rows);
  suivi.getRange(1, 1, 1, 7).setFontWeight('bold');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
