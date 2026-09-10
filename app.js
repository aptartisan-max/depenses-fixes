// app.js — Mes dépenses (français) — stockage localStorage

const STORAGE_KEY = 'depenses:items:v1'

function $(sel){return document.querySelector(sel)}

const form = $('#expense-form')
const listEl = $('#expenses-list')
const emptyEl = $('#empty')
const totalEl = $('#total')
const clearBtn = $('#clear-all')

function readItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){
    console.error('Erreur lecture localStorage',e)
    return []
  }
}

function writeItems(items){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }catch(e){
    console.error('Erreur écriture localStorage',e)
  }
}

function formatCurrency(n){
  return n.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})
}

function render(){
  const items = readItems()
  listEl.innerHTML = ''
  if(items.length===0){
    emptyEl.style.display='block'
  }else{
    emptyEl.style.display='none'
  }
  let total = 0
  items.forEach((it, idx)=>{
    total += Number(it.amount)
    const li = document.createElement('li')
    li.innerHTML = `
      <div class="meta">
        <strong>${it.category}</strong>
        <small class="muted">${it.date} • ${it.note||''}</small>
      </div>
      <div>
        <div class="amount">${formatCurrency(Number(it.amount))}</div>
        <div style="margin-top:6px;text-align:right">
          <button data-idx="${idx}" class="del">Supprimer</button>
        </div>
      </div>
    `
    listEl.appendChild(li)
  })
  totalEl.textContent = formatCurrency(total)
}

form.addEventListener('submit', e=>{
  e.preventDefault()
  const date = $('#date').value
  const amount = $('#amount').value
  const category = $('#category').value.trim()
  const note = $('#note').value.trim()
  if(!date||!amount||!category){
    alert('Veuillez remplir la date, le montant et la catégorie.')
    return
  }
  const items = readItems()
  items.push({date,amount:parseFloat(amount),category,note})
  writeItems(items)
  form.reset()
  render()
})

listEl.addEventListener('click', e=>{
  if(e.target.matches('button.del')){
    const idx = Number(e.target.dataset.idx)
    const items = readItems()
    if(idx>=0 && idx<items.length){
      if(confirm('Supprimer cette dépense ?')){
        items.splice(idx,1)
        writeItems(items)
        render()
      }
    }
  }
})

clearBtn.addEventListener('click', ()=>{
  if(confirm('Effacer toutes les dépenses ?')){
    writeItems([])
    render()
  }
})

// Export CSV
function exportCSV(){
  const items = readItems()
  if(items.length===0){alert('Aucune dépense à exporter.'); return}
  const header = ['date','amount_eur','category','note']
  const rows = items.map(it => [it.date, it.amount, `"${it.category.replace(/"/g,'""')}"`, `"${(it.note||'').replace(/"/g,'""')}"`])
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mes-depenses.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// add export button to header
const expBtn = document.createElement('button')
expBtn.textContent = 'Exporter CSV'
expBtn.className = 'export-btn'
expBtn.addEventListener('click', exportCSV)

document.querySelector('header').appendChild(expBtn)

// register service worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW enregistré',r)).catch(err=>console.warn('SW erreur',err))
}

render()
