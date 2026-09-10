// app.js — Mes dépenses (français) — localStorage, catégories, recherche, tri, CSV export

const STORAGE_KEY = 'depenses:items:v1';

function $(sel){ return document.querySelector(sel); }

const form = $('#expense-form');
const listEl = $('#expenses-list');
const emptyEl = $('#empty');
const totalEl = $('#total');
const clearBtn = $('#clear-all');
const searchInput = $('#search');
const sortSelect = $('#sort');
const categorySelect = $('#category');

function readItems(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error('Erreur lecture localStorage', e);
    return [];
  }
}

function writeItems(items){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch(e) {
    console.error('Erreur écriture localStorage', e);
  }
}

function formatCurrency(n){
  return Number(n).toLocaleString('fr-FR', {style:'currency', currency:'EUR'});
}

function applyFiltersAndSort(items){
  const q = (searchInput && searchInput.value || '').trim().toLowerCase();
  let out = items.slice();

  // filter by search (date, category, note)
  if(q){
    out = out.filter(it =>
      (it.date && it.date.toLowerCase().includes(q)) ||
      (it.category && it.category.toLowerCase().includes(q)) ||
      ((it.note||'').toLowerCase().includes(q))
    );
  }

  // sort
  const mode = sortSelect ? sortSelect.value : 'date_desc';
  out.sort((a,b) => {
    if(mode.startsWith('date')){
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return mode === 'date_asc' ? da - db : db - da;
    } else {
      const na = Number(a.amount) || 0;
      const nb = Number(b.amount) || 0;
      return mode === 'amount_asc' ? na - nb : nb - na;
    }
  });

  return out;
}

function render(){
  const items = readItems();
  const shown = applyFiltersAndSort(items);
  listEl.innerHTML = '';
  if(shown.length === 0){
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
  }
  let total = 0;
  shown.forEach((it, idx) => {
    total += Number(it.amount);
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="meta">
        <strong>${escapeHtml(it.category)}</strong>
        <small class="muted">${it.date} • ${escapeHtml(it.note||'')}</small>
      </div>
      <div>
        <div class="amount">${formatCurrency(Number(it.amount))}</div>
        <div style="margin-top:6px;text-align:right">
          <button data-idx="${idx}" class="del">Supprimer</button>
        </div>
      </div>
    `;
    listEl.appendChild(li);
  });

  totalEl.textContent = formatCurrency(total);
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const date = $('#date').value;
  const amount = $('#amount').value;
  const category = (categorySelect.value || '').trim();
  const note = $('#note').value.trim();
  if(!date || !amount || !category){
    alert('Veuillez remplir la date, le montant et la catégorie.');
    return;
  }
  const items = readItems();
  items.push({ date, amount: parseFloat(amount), category, note });
  writeItems(items);
  form.reset();
  // reset category to first non-empty
  categorySelect.selectedIndex = 0;
  render();
});

listEl.addEventListener('click', e => {
  if(e.target.matches('button.del')){
    const idx = Number(e.target.dataset.idx);
    // idx is index in filtered list; remove by matching item (safer)
    const shown = applyFiltersAndSort(readItems());
    const item = shown[idx];
    if(!item) return;
    if(confirm('Supprimer cette dépense ?')){
      // remove first matching item from stored array (by exact fields + timestamp optional)
      let items = readItems();
      const found = items.findIndex(it => it.date === item.date && Number(it.amount) === Number(item.amount) && it.category === item.category && (it.note||'') === (item.note||''));
      if(found >= 0){
        items.splice(found,1);
        writeItems(items);
        render();
      }
    }
  }
});

clearBtn.addEventListener('click', () => {
  if(confirm('Effacer toutes les dépenses ?')){
    writeItems([]);
    render();
  }
});

if(searchInput){
  searchInput.addEventListener('input', () => render());
}
if(sortSelect){
  sortSelect.addEventListener('change', () => render());
}

// Export CSV
function exportCSV(){
  const items = readItems();
  if(items.length === 0){ alert('Aucune dépense à exporter.'); return; }
  const header = ['date','amount_eur','category','note'];
  const rows = items.map(it => [
    it.date,
    it.amount,
    `"${(it.category||'').replace(/"/g,'""')}"`,
    `"${(it.note||'').replace(/"/g,'""')}"`,
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mes-depenses.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// add export button to header (if not already)
if(!document.querySelector('.export-btn')){
  const expBtn = document.createElement('button');
  expBtn.textContent = 'Exporter CSV';
  expBtn.className = 'export-btn';
  expBtn.addEventListener('click', exportCSV);
  document.querySelector('header').appendChild(expBtn);
}

// register service worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(r => console.log('SW enregistré', r)).catch(err => console.warn('SW erreur', err));
}

render();
