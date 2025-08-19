(function(){
  'use strict';

  function $(sel, root=document){ return root.querySelector(sel); }
  function loadData(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; } }
  function saveData(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
  function exportTableToCsv(table, filename){ if(!table) return; const rows = Array.from(table.querySelectorAll('tr')); const data = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => '"'+(c.innerText||'').replace(/"/g,'""')+'"').join(',')).join('\n'); const blob = new Blob([data], {type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
  function badgeForStatus(status, map){ const cls = (map && map[status]) || 'bg-secondary'; return `<span class="badge ${cls}">${status}</span>`; }
  function validateForm(form){ let ok=true; form.querySelectorAll('input,select,textarea').forEach(el=>{ if(!el.checkValidity()){ el.classList.add('is-invalid'); ok=false; } else { el.classList.remove('is-invalid'); }}); return ok; }
  function toast(msg,type='primary'){ const cont = document.getElementById('toastContainer'); if(!cont) return; const el = document.createElement('div'); el.className=`toast align-items-center text-bg-${type} border-0`; el.role='alert'; el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Kapat"></button></div>`; cont.appendChild(el); const t=new bootstrap.Toast(el,{delay:2000}); t.show(); el.addEventListener('hidden.bs.toast',()=>el.remove()); }

  const K = { musteri:'asansor:musteri', sozlesme:'asansor:sozlesme', tahsilat:'asansor:tahsilat', kasa:'asansor:kasa', gider:'asansor:gider', stok:'asansor:stok', muhasebe:'asansor:muhasebe' };

  const musteriTable = $('#musteriTable');
  const sozlesmeTable = $('#sozlesmeTable');
  const tahsilatTable = $('#tahsilatTable');
  const kasaTable = $('#kasaTable');
  const giderTable = $('#giderTable');
  const stokTable = $('#stokTable');

  function renderMusteri(filter={}){ if(!musteriTable) return; const data=loadData(K.musteri); const q=(filter.q||'').toLowerCase(); const status=filter.status||''; const list=data.filter(d=>(!q||Object.values(d).join(' ').toLowerCase().includes(q))&&(!status||(d.durum||'Aktif')===status)); const tbody=musteriTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.ad}</td><td>${r.telefon||''}</td><td>${r.email||''}</td><td>${badgeForStatus(r.durum||'Aktif',{Aktif:'bg-success',Pasif:'bg-secondary'})}</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`; tbody.appendChild(tr); }); }
  function renderSozlesme(filter={}){ if(!sozlesmeTable) return; const data=loadData(K.sozlesme); const q=(filter.q||'').toLowerCase(); const status=filter.status||''; const list=data.filter(d=>(!q||Object.values(d).join(' ').toLowerCase().includes(q))&&(!status||d.durum===status)); const tbody=sozlesmeTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.no}</td><td>${r.musteri}</td><td>${r.baslangic}</td><td>${r.bitis}</td><td>${badgeForStatus(r.durum||'Aktif',{Aktif:'bg-success','Askıda':'bg-warning text-dark','Sona Erdi':'bg-secondary'})}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td><i class=\"fas fa-pen action-icon text-primary\" data-action=\"edit\" data-index=\"${i}\"></i><i class=\"fas fa-trash action-icon text-danger\" data-action=\"delete\" data-index=\"${i}\"></i></td>`; tbody.appendChild(tr); }); }
  function renderTahsilat(filter={}){ if(!tahsilatTable) return; const data=loadData(K.tahsilat); const q=(filter.q||'').toLowerCase(); const status=filter.status||''; const list=data.filter(d=>(!q||Object.values(d).join(' ').toLowerCase().includes(q))&&(!status||d.durum===status)); const tbody=tahsilatTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.no}</td><td>${r.musteri}</td><td>${r.tarih}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.yontem}</td><td>${badgeForStatus(r.durum||'Beklemede',{Beklemede:'bg-warning text-dark',Alındı:'bg-success',İptal:'bg-secondary'})}</td><td><i class=\"fas fa-pen action-icon text-primary\" data-action=\"edit\" data-index=\"${i}\"></i><i class=\"fas fa-trash action-icon text-danger\" data-action=\"delete\" data-index=\"${i}\"></i></td>`; tbody.appendChild(tr); }); }
  function renderKasa(filter={}){ if(!kasaTable) return; const data=loadData(K.kasa); const q=(filter.q||'').toLowerCase(); const list=data.filter(d=>!q||Object.values(d).join(' ').toLowerCase().includes(q)); const tbody=kasaTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.no}</td><td>${r.hesap}</td><td>${r.tarih}</td><td>${r.tur}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.aciklama||''}</td><td><i class=\"fas fa-pen action-icon text-primary\" data-action=\"edit\" data-index=\"${i}\"></i><i class=\"fas fa-trash action-icon text-danger\" data-action=\"delete\" data-index=\"${i}\"></i></td>`; tbody.appendChild(tr); }); }
  function renderGider(filter={}){ if(!giderTable) return; const data=loadData(K.gider); const q=(filter.q||'').toLowerCase(); const cat=filter.cat||''; const list=data.filter(d=>(!q||Object.values(d).join(' ').toLowerCase().includes(q))&&(!cat||d.kategori===cat)); const tbody=giderTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.no}</td><td>${r.kategori}</td><td>${r.tarih}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.tedarikci||''}</td><td><i class=\"fas fa-pen action-icon text-primary\" data-action=\"edit\" data-index=\"${i}\"></i><i class=\"fas fa-trash action-icon text-danger\" data-action=\"delete\" data-index=\"${i}\"></i></td>`; tbody.appendChild(tr); }); }
  function renderStok(filter={}){ if(!stokTable) return; const data=loadData(K.stok); const q=(filter.q||'').toLowerCase(); const list=data.filter(d=>!q||Object.values(d).join(' ').toLowerCase().includes(q)); const tbody=stokTable.querySelector('tbody'); tbody.innerHTML=''; list.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.sku}</td><td>${r.ad}</td><td>${r.marka||''}</td><td>${r.birim||''}</td><td>${Number(r.miktar||0)}</td><td>${Number(r.fiyat||0).toFixed(2)} ₺</td><td><i class=\"fas fa-pen action-icon text-primary\" data-action=\"edit\" data-index=\"${i}\"></i><i class=\"fas fa-trash action-icon text-danger\" data-action=\"delete\" data-index=\"${i}\"></i></td>`; tbody.appendChild(tr); }); }

  function bindCrud(container, key, render){ if(!container) return; container.addEventListener('click', (e)=>{ const icon=e.target.closest('i[data-action]'); if(!icon) return; const idx=Number(icon.getAttribute('data-index')); const action=icon.getAttribute('data-action'); const data=loadData(key); if(action==='delete'){ if(confirm('Bu kaydı silmek istediğinize emin misiniz?')){ data.splice(idx,1); saveData(key,data); render(); toast('Kayıt silindi','warning'); } } else if(action==='edit'){ const rec=data[idx]; const entries=Object.entries(rec).map(([k,v])=>[k, prompt(`${k} değerini düzenleyin:`, v) ?? v]); data[idx]=Object.fromEntries(entries); saveData(key,data); render(); toast('Kayıt güncellendi','info'); } }); }

  bindCrud(musteriTable, K.musteri, ()=>renderMusteri(currentFilters.musteri));
  bindCrud(sozlesmeTable, K.sozlesme, ()=>renderSozlesme(currentFilters.sozlesme));
  bindCrud(tahsilatTable, K.tahsilat, ()=>renderTahsilat(currentFilters.tahsilat));
  bindCrud(kasaTable, K.kasa, ()=>renderKasa(currentFilters.kasa));
  bindCrud(giderTable, K.gider, ()=>renderGider(currentFilters.gider));
  bindCrud(stokTable, K.stok, ()=>renderStok(currentFilters.stok));

  const currentFilters = { musteri:{}, sozlesme:{}, tahsilat:{}, kasa:{}, gider:{}, stok:{} };
  $('#musteriSearch')?.addEventListener('input', e=>{ currentFilters.musteri.q=e.target.value; renderMusteri(currentFilters.musteri); });
  $('#musteriStatusFilter')?.addEventListener('change', e=>{ currentFilters.musteri.status=e.target.value; renderMusteri(currentFilters.musteri); });
  $('#musteriExportCsv')?.addEventListener('click', ()=> exportTableToCsv(musteriTable, 'musteriler.csv'));

  $('#sozlesmeSearch')?.addEventListener('input', e=>{ currentFilters.sozlesme.q=e.target.value; renderSozlesme(currentFilters.sozlesme); });
  $('#sozlesmeStatusFilter')?.addEventListener('change', e=>{ currentFilters.sozlesme.status=e.target.value; renderSozlesme(currentFilters.sozlesme); });
  $('#sozlesmeExportCsv')?.addEventListener('click', ()=> exportTableToCsv(sozlesmeTable, 'sozlesmeler.csv'));

  $('#tahsilatSearch')?.addEventListener('input', e=>{ currentFilters.tahsilat.q=e.target.value; renderTahsilat(currentFilters.tahsilat); });
  $('#tahsilatStatusFilter')?.addEventListener('change', e=>{ currentFilters.tahsilat.status=e.target.value; renderTahsilat(currentFilters.tahsilat); });
  $('#tahsilatExportCsv')?.addEventListener('click', ()=> exportTableToCsv(tahsilatTable, 'tahsilatlar.csv'));

  $('#kasaSearch')?.addEventListener('input', e=>{ currentFilters.kasa.q=e.target.value; renderKasa(currentFilters.kasa); });
  $('#kasaExportCsv')?.addEventListener('click', ()=> exportTableToCsv(kasaTable, 'kasa_banka.csv'));

  $('#giderSearch')?.addEventListener('input', e=>{ currentFilters.gider.q=e.target.value; renderGider(currentFilters.gider); });
  $('#giderCategoryFilter')?.addEventListener('change', e=>{ currentFilters.gider.cat=e.target.value; renderGider(currentFilters.gider); });
  $('#giderExportCsv')?.addEventListener('click', ()=> exportTableToCsv(giderTable, 'giderler.csv'));

  $('#stokSearch')?.addEventListener('input', e=>{ currentFilters.stok.q=e.target.value; renderStok(currentFilters.stok); });
  $('#stokExportCsv')?.addEventListener('click', ()=> exportTableToCsv(stokTable, 'stok.csv'));

  $('#musteriForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.musteri); data.push({ ad:f.musteriAd.value.trim(), telefon:f.musteriTelefon.value.trim(), email:f.musteriEmail.value.trim(), vergiNo:f.musteriVergiNo.value.trim(), adres:f.musteriAdres.value.trim(), durum:f.musteriDurum.value }); saveData(K.musteri,data); renderMusteri(); bootstrap.Modal.getInstance($('#musteriModal')).hide(); f.reset(); toast('Müşteri eklendi','success'); });
  $('#sozlesmeForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.sozlesme); data.push({ no:f.sozlesmeNo.value.trim(), musteri:f.sozlesmeMusteri.value.trim(), baslangic:f.sozlesmeBaslangic.value, bitis:f.sozlesmeBitis.value, tutar:Number(f.sozlesmeTutar.value||0), durum:f.sozlesmeDurum.value }); saveData(K.sozlesme,data); renderSozlesme(); bootstrap.Modal.getInstance($('#sozlesmeModal')).hide(); f.reset(); toast('Sözleşme eklendi','success'); });
  $('#tahsilatForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.tahsilat); data.push({ no:f.tahsilatNo.value.trim(), musteri:f.tahsilatMusteri.value.trim(), tarih:f.tahsilatTarih.value, tutar:Number(f.tahsilatTutar.value||0), yontem:f.tahsilatYontem.value, durum:f.tahsilatDurum.value }); saveData(K.tahsilat,data); renderTahsilat(); bootstrap.Modal.getInstance($('#tahsilatModal')).hide(); f.reset(); toast('Tahsilat eklendi','success'); });
  $('#kasaForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.kasa); data.push({ no:f.kasaNo.value.trim(), hesap:f.kasaHesap.value.trim(), tarih:f.kasaTarih.value, tur:f.kasaTur.value, tutar:Number(f.kasaTutar.value||0), aciklama:f.kasaAciklama.value.trim() }); saveData(K.kasa,data); renderKasa(); bootstrap.Modal.getInstance($('#kasaModal')).hide(); f.reset(); toast('İşlem eklendi','success'); });
  $('#giderForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.gider); data.push({ no:f.giderNo.value.trim(), kategori:f.giderKategori.value, tarih:f.giderTarih.value, tutar:Number(f.giderTutar.value||0), tedarikci:f.giderTedarikci.value.trim(), not:f.giderNot.value.trim() }); saveData(K.gider,data); renderGider(); bootstrap.Modal.getInstance($('#giderModal')).hide(); f.reset(); toast('Gider eklendi','success'); });
  $('#stokForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.stok); data.push({ sku:f.stokSku.value.trim(), ad:f.stokAd.value.trim(), marka:f.stokMarka.value.trim(), birim:f.stokBirim.value.trim(), miktar:Number(f.stokMiktar.value||0), fiyat:Number(f.stokFiyat.value||0) }); saveData(K.stok,data); renderStok(); bootstrap.Modal.getInstance($('#stokModal')).hide(); f.reset(); toast('Ürün eklendi','success'); });

  (function seed(){ if(loadData(K.musteri).length===0){ saveData(K.musteri,[{ad:'Kaya İnşaat',telefon:'0212 123 45 67',email:'info@kaya.com',durum:'Aktif'},{ad:'Yıldız A.Ş.',telefon:'0216 987 65 43',email:'info@yildiz.com',durum:'Aktif'}]); } if(loadData(K.sozlesme).length===0){ saveData(K.sozlesme,[{no:'S-2025-001',musteri:'Kaya İnşaat',baslangic:'2025-06-01',bitis:'2026-05-31',tutar:150000,durum:'Aktif'}]); } if(loadData(K.tahsilat).length===0){ saveData(K.tahsilat,[{no:'THS-1001',musteri:'Kaya İnşaat',tarih:'2025-08-05',tutar:25000,yontem:'Havale',durum:'Alındı'}]); } if(loadData(K.kasa).length===0){ saveData(K.kasa,[{no:'KS-1',hesap:'Kasa',tarih:'2025-08-01',tur:'Giriş',tutar:5000,aciklama:'Açılış'}]); } if(loadData(K.gider).length===0){ saveData(K.gider,[{no:'G-1001',kategori:'Parça',tarih:'2025-08-07',tutar:3200,tedarikci:'ABC Yedek Parça'}]); } if(loadData(K.stok).length===0){ saveData(K.stok,[{sku:'PR-001',ad:'Kapı Sensörü',marka:'LiftX',birim:'adet',miktar:25,fiyat:450},{sku:'PR-002',ad:'Motor Kayışı',marka:'LiftX',birim:'adet',miktar:12,fiyat:750}]); } })();

  function renderCharts(){ if(!(window.Chart)) return; const gelirCtx=$('#chartGelirAylik'); const giderCtx=$('#chartGiderKategori'); const nakitCtx=$('#chartNakitAkis'); const now=new Date(); if(gelirCtx){ const labels=Array(6).fill(0).map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return d.toLocaleString('tr-TR',{month:'short'});}); const gelir=Array(6).fill(0); loadData(K.muhasebe).forEach(m=>{const d=new Date(m.tarih); const diff=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth()); if(diff>=0&&diff<6){ gelir[5-diff]+= Number(m.tutar)||0; }}); new Chart(gelirCtx,{type:'line',data:{labels,datasets:[{label:'Gelir',data:gelir,fill:true,borderColor:'#0ea5e9',backgroundColor:'rgba(14,165,233,.2)'}]}}); } if(giderCtx){ const cats={}; loadData(K.gider).forEach(g=>{ cats[g.kategori]=(cats[g.kategori]||0)+(Number(g.tutar)||0);}); const labels=Object.keys(cats); const data=labels.map(l=>cats[l]); new Chart(giderCtx,{type:'doughnut',data:{labels,datasets:[{data}]}}); } if(nakitCtx){ const labels=Array(6).fill(0).map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return d.toLocaleString('tr-TR',{month:'short'});}); const akim=Array(6).fill(0); loadData(K.kasa).forEach(k=>{ const d=new Date(k.tarih); const diff=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth()); if(diff>=0&&diff<6){ akim[5-diff]+= (k.tur==='Giriş'?1:-1)*(Number(k.tutar)||0);} }); new Chart(nakitCtx,{type:'bar',data:{labels,datasets:[{label:'Nakit Akışı',data:akim,backgroundColor:'#22c55e'}]},options:{plugins:{legend:{display:false}}}}); } }

  renderMusteri(); renderSozlesme(); renderTahsilat(); renderKasa(); renderGider(); renderStok(); renderCharts();

})();

(function(){
  'use strict';

  // Helpers (duplicated locally to avoid coupling)
  function $(sel, root=document){ return root.querySelector(sel); }
  function loadData(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; } }
  function saveData(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
  function exportTableToCsv(table, filename){
    if(!table) return;
    const rows = Array.from(table.querySelectorAll('tr'));
    const data = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => '"'+(c.innerText||'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([data], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
  }
  function badgeForStatus(status, map){ const cls = (map && map[status]) || 'bg-secondary'; return `<span class="badge ${cls}">${status}</span>`; }
  function validateForm(form){ let ok=true; form.querySelectorAll('input,select,textarea').forEach(el=>{ if(!el.checkValidity()){ el.classList.add('is-invalid'); ok=false; } else { el.classList.remove('is-invalid'); }}); return ok; }
  function toast(msg,type='primary'){
    const cont = document.getElementById('toastContainer'); if(!cont) return;
    const el = document.createElement('div'); el.className=`toast align-items-center text-bg-${type} border-0`; el.role='alert'; el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Kapat"></button></div>`; cont.appendChild(el); const t=new bootstrap.Toast(el,{delay:2000}); t.show(); el.addEventListener('hidden.bs.toast',()=>el.remove());
  }

  // Keys
  const K = {
    musteri: 'asansor:musteri',
    sozlesme: 'asansor:sozlesme',
    tahsilat: 'asansor:tahsilat',
    kasa: 'asansor:kasa',
    gider: 'asansor:gider',
    stok: 'asansor:stok',
    muhasebe: 'asansor:muhasebe'
  };

  // Tables
  const musteriTable = $('#musteriTable');
  const sozlesmeTable = $('#sozlesmeTable');
  const tahsilatTable = $('#tahsilatTable');
  const kasaTable = $('#kasaTable');
  const giderTable = $('#giderTable');
  const stokTable = $('#stokTable');

  // Renderers
  function renderMusteri(filter={}){
    if(!musteriTable) return;
    const data = loadData(K.musteri);
    const q = (filter.q||'').toLowerCase();
    const status = filter.status||'';
    const list = data.filter(d => (!q || Object.values(d).join(' ').toLowerCase().includes(q)) && (!status || (d.durum||'Aktif')===status));
    const tbody = musteriTable.querySelector('tbody'); tbody.innerHTML = '';
    list.forEach((r,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.ad}</td><td>${r.telefon||''}</td><td>${r.email||''}</td><td>${badgeForStatus(r.durum||'Aktif',{Aktif:'bg-success',Pasif:'bg-secondary'})}</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }
  function renderSozlesme(filter={}){
    if(!sozlesmeTable) return;
    const data = loadData(K.sozlesme);
    const q=(filter.q||'').toLowerCase(); const status=filter.status||'';
    const list = data.filter(d => (!q || Object.values(d).join(' ').toLowerCase().includes(q)) && (!status || d.durum===status));
    const tbody = sozlesmeTable.querySelector('tbody'); tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.no}</td><td>${r.musteri}</td><td>${r.baslangic}</td><td>${r.bitis}</td><td>${badgeForStatus(r.durum||'Aktif',{Aktif:'bg-success','Askıda':'bg-warning text-dark','Sona Erdi':'bg-secondary'})}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }
  function renderTahsilat(filter={}){
    if(!tahsilatTable) return;
    const data = loadData(K.tahsilat);
    const q=(filter.q||'').toLowerCase(); const status=filter.status||'';
    const list = data.filter(d => (!q || Object.values(d).join(' ').toLowerCase().includes(q)) && (!status || d.durum===status));
    const tbody = tahsilatTable.querySelector('tbody'); tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.no}</td><td>${r.musteri}</td><td>${r.tarih}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.yontem}</td><td>${badgeForStatus(r.durum||'Beklemede',{Beklemede:'bg-warning text-dark',Alındı:'bg-success',İptal:'bg-secondary'})}</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }
  function renderKasa(filter={}){
    if(!kasaTable) return;
    const data = loadData(K.kasa);
    const q=(filter.q||'').toLowerCase(); const list = data.filter(d=> !q || Object.values(d).join(' ').toLowerCase().includes(q));
    const tbody = kasaTable.querySelector('tbody'); tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.no}</td><td>${r.hesap}</td><td>${r.tarih}</td><td>${r.tur}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.aciklama||''}</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }
  function renderGider(filter={}){
    if(!giderTable) return;
    const data = loadData(K.gider);
    const q=(filter.q||'').toLowerCase(); const cat=filter.cat||'';
    const list = data.filter(d => (!q || Object.values(d).join(' ').toLowerCase().includes(q)) && (!cat || d.kategori===cat));
    const tbody = giderTable.querySelector('tbody'); tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.no}</td><td>${r.kategori}</td><td>${r.tarih}</td><td>${Number(r.tutar||0).toFixed(2)} ₺</td><td>${r.tedarikci||''}</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }
  function renderStok(filter={}){
    if(!stokTable) return;
    const data = loadData(K.stok);
    const q=(filter.q||'').toLowerCase(); const list = data.filter(d=> !q || Object.values(d).join(' ').toLowerCase().includes(q));
    const tbody = stokTable.querySelector('tbody'); tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.sku}</td><td>${r.ad}</td><td>${r.marka||''}</td><td>${r.birim||''}</td><td>${Number(r.miktar||0)}</td><td>${Number(r.fiyat||0).toFixed(2)} ₺</td><td><i class="fas fa-pen action-icon text-primary" data-action="edit" data-index="${i}"></i><i class="fas fa-trash action-icon text-danger" data-action="delete" data-index="${i}"></i></td>`;
      tbody.appendChild(tr);
    });
  }

  // CRUD delegation
  function bindCrud(container, key, render){
    if(!container) return;
    container.addEventListener('click', (e)=>{
      const icon = e.target.closest('i[data-action]'); if(!icon) return;
      const idx = Number(icon.getAttribute('data-index'));
      const action = icon.getAttribute('data-action');
      const data = loadData(key);
      if(action==='delete'){
        if(confirm('Bu kaydı silmek istediğinize emin misiniz?')){
          data.splice(idx,1); saveData(key,data); render(); toast('Kayıt silindi','warning');
        }
      } else if(action==='edit'){
        const rec = data[idx]; const entries = Object.entries(rec).map(([k,v])=>[k, prompt(`${k} değerini düzenleyin:`, v) ?? v]);
        data[idx] = Object.fromEntries(entries); saveData(key,data); render(); toast('Kayıt güncellendi','info');
      }
    });
  }

  bindCrud(musteriTable, K.musteri, ()=>renderMusteri(currentFilters.musteri));
  bindCrud(sozlesmeTable, K.sozlesme, ()=>renderSozlesme(currentFilters.sozlesme));
  bindCrud(tahsilatTable, K.tahsilat, ()=>renderTahsilat(currentFilters.tahsilat));
  bindCrud(kasaTable, K.kasa, ()=>renderKasa(currentFilters.kasa));
  bindCrud(giderTable, K.gider, ()=>renderGider(currentFilters.gider));
  bindCrud(stokTable, K.stok, ()=>renderStok(currentFilters.stok));

  // Filters
  const currentFilters = { musteri:{}, sozlesme:{}, tahsilat:{}, kasa:{}, gider:{}, stok:{} };
  $('#musteriSearch')?.addEventListener('input', e=>{ currentFilters.musteri.q=e.target.value; renderMusteri(currentFilters.musteri); });
  $('#musteriStatusFilter')?.addEventListener('change', e=>{ currentFilters.musteri.status=e.target.value; renderMusteri(currentFilters.musteri); });
  $('#musteriExportCsv')?.addEventListener('click', ()=> exportTableToCsv(musteriTable, 'musteriler.csv'));

  $('#sozlesmeSearch')?.addEventListener('input', e=>{ currentFilters.sozlesme.q=e.target.value; renderSozlesme(currentFilters.sozlesme); });
  $('#sozlesmeStatusFilter')?.addEventListener('change', e=>{ currentFilters.sozlesme.status=e.target.value; renderSozlesme(currentFilters.sozlesme); });
  $('#sozlesmeExportCsv')?.addEventListener('click', ()=> exportTableToCsv(sozlesmeTable, 'sozlesmeler.csv'));

  $('#tahsilatSearch')?.addEventListener('input', e=>{ currentFilters.tahsilat.q=e.target.value; renderTahsilat(currentFilters.tahsilat); });
  $('#tahsilatStatusFilter')?.addEventListener('change', e=>{ currentFilters.tahsilat.status=e.target.value; renderTahsilat(currentFilters.tahsilat); });
  $('#tahsilatExportCsv')?.addEventListener('click', ()=> exportTableToCsv(tahsilatTable, 'tahsilatlar.csv'));

  $('#kasaSearch')?.addEventListener('input', e=>{ currentFilters.kasa.q=e.target.value; renderKasa(currentFilters.kasa); });
  $('#kasaExportCsv')?.addEventListener('click', ()=> exportTableToCsv(kasaTable, 'kasa_banka.csv'));

  $('#giderSearch')?.addEventListener('input', e=>{ currentFilters.gider.q=e.target.value; renderGider(currentFilters.gider); });
  $('#giderCategoryFilter')?.addEventListener('change', e=>{ currentFilters.gider.cat=e.target.value; renderGider(currentFilters.gider); });
  $('#giderExportCsv')?.addEventListener('click', ()=> exportTableToCsv(giderTable, 'giderler.csv'));

  $('#stokSearch')?.addEventListener('input', e=>{ currentFilters.stok.q=e.target.value; renderStok(currentFilters.stok); });
  $('#stokExportCsv')?.addEventListener('click', ()=> exportTableToCsv(stokTable, 'stok.csv'));

  // Forms
  $('#musteriForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.musteri); data.push({ ad:f.musteriAd.value.trim(), telefon:f.musteriTelefon.value.trim(), email:f.musteriEmail.value.trim(), vergiNo:f.musteriVergiNo.value.trim(), adres:f.musteriAdres.value.trim(), durum:f.musteriDurum.value }); saveData(K.musteri,data); renderMusteri(); bootstrap.Modal.getInstance($('#musteriModal')).hide(); f.reset(); toast('Müşteri eklendi','success'); });
  $('#sozlesmeForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.sozlesme); data.push({ no:f.sozlesmeNo.value.trim(), musteri:f.sozlesmeMusteri.value.trim(), baslangic:f.sozlesmeBaslangic.value, bitis:f.sozlesmeBitis.value, tutar:Number(f.sozlesmeTutar.value||0), durum:f.sozlesmeDurum.value }); saveData(K.sozlesme,data); renderSozlesme(); bootstrap.Modal.getInstance($('#sozlesmeModal')).hide(); f.reset(); toast('Sözleşme eklendi','success'); });
  $('#tahsilatForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.tahsilat); data.push({ no:f.tahsilatNo.value.trim(), musteri:f.tahsilatMusteri.value.trim(), tarih:f.tahsilatTarih.value, tutar:Number(f.tahsilatTutar.value||0), yontem:f.tahsilatYontem.value, durum:f.tahsilatDurum.value }); saveData(K.tahsilat,data); renderTahsilat(); bootstrap.Modal.getInstance($('#tahsilatModal')).hide(); f.reset(); toast('Tahsilat eklendi','success'); });
  $('#kasaForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.kasa); data.push({ no:f.kasaNo.value.trim(), hesap:f.kasaHesap.value.trim(), tarih:f.kasaTarih.value, tur:f.kasaTur.value, tutar:Number(f.kasaTutar.value||0), aciklama:f.kasaAciklama.value.trim() }); saveData(K.kasa,data); renderKasa(); bootstrap.Modal.getInstance($('#kasaModal')).hide(); f.reset(); toast('İşlem eklendi','success'); });
  $('#giderForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.gider); data.push({ no:f.giderNo.value.trim(), kategori:f.giderKategori.value, tarih:f.giderTarih.value, tutar:Number(f.giderTutar.value||0), tedarikci:f.giderTedarikci.value.trim(), not:f.giderNot.value.trim() }); saveData(K.gider,data); renderGider(); bootstrap.Modal.getInstance($('#giderModal')).hide(); f.reset(); toast('Gider eklendi','success'); });
  $('#stokForm')?.addEventListener('submit', e=>{ e.preventDefault(); const f=e.target; if(!validateForm(f)) return; const data=loadData(K.stok); data.push({ sku:f.stokSku.value.trim(), ad:f.stokAd.value.trim(), marka:f.stokMarka.value.trim(), birim:f.stokBirim.value.trim(), miktar:Number(f.stokMiktar.value||0), fiyat:Number(f.stokFiyat.value||0) }); saveData(K.stok,data); renderStok(); bootstrap.Modal.getInstance($('#stokModal')).hide(); f.reset(); toast('Ürün eklendi','success'); });

  // Seed demo data (non-destructive)
  (function seed(){
    if(loadData(K.musteri).length===0){ saveData(K.musteri,[{ad:'Kaya İnşaat',telefon:'0212 123 45 67',email:'info@kaya.com',durum:'Aktif'},{ad:'Yıldız A.Ş.',telefon:'0216 987 65 43',email:'info@yildiz.com',durum:'Aktif'}]); }
    if(loadData(K.sozlesme).length===0){ saveData(K.sozlesme,[{no:'S-2025-001',musteri:'Kaya İnşaat',baslangic:'2025-06-01',bitis:'2026-05-31',tutar:150000,durum:'Aktif'}]); }
    if(loadData(K.tahsilat).length===0){ saveData(K.tahsilat,[{no:'THS-1001',musteri:'Kaya İnşaat',tarih:'2025-08-05',tutar:25000,yontem:'Havale',durum:'Alındı'}]); }
    if(loadData(K.kasa).length===0){ saveData(K.kasa,[{no:'KS-1',hesap:'Kasa',tarih:'2025-08-01',tur:'Giriş',tutar:5000,aciklama:'Açılış'}]); }
    if(loadData(K.gider).length===0){ saveData(K.gider,[{no:'G-1001',kategori:'Parça',tarih:'2025-08-07',tutar:3200,tedarikci:'ABC Yedek Parça'}]); }
    if(loadData(K.stok).length===0){ saveData(K.stok,[{sku:'PR-001',ad:'Kapı Sensörü',marka:'LiftX',birim:'adet',miktar:25,fiyat:450},{sku:'PR-002',ad:'Motor Kayışı',marka:'LiftX',birim:'adet',miktar:12,fiyat:750}]); }
  })();

  // Charts
  function renderCharts(){
    if(!(window.Chart)) return;
    const gelirCtx = document.getElementById('chartGelirAylik');
    const giderCtx = document.getElementById('chartGiderKategori');
    const nakitCtx = document.getElementById('chartNakitAkis');
    const now=new Date();
    if(gelirCtx){ const labels=Array(6).fill(0).map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return d.toLocaleString('tr-TR',{month:'short'});}); const gelir=Array(6).fill(0); loadData(K.muhasebe).forEach(m=>{const d=new Date(m.tarih); const diff=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth()); if(diff>=0&&diff<6){ gelir[5-diff]+= Number(m.tutar)||0; }}); new Chart(gelirCtx,{type:'line',data:{labels,datasets:[{label:'Gelir',data:gelir,fill:true,borderColor:'#0ea5e9',backgroundColor:'rgba(14,165,233,.2)'}]}}); }
    if(giderCtx){ const cats={}; loadData(K.gider).forEach(g=>{ cats[g.kategori]=(cats[g.kategori]||0)+(Number(g.tutar)||0);}); const labels=Object.keys(cats); const data=labels.map(l=>cats[l]); new Chart(giderCtx,{type:'doughnut',data:{labels,datasets:[{data}]}}); }
    if(nakitCtx){ const labels=Array(6).fill(0).map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return d.toLocaleString('tr-TR',{month:'short'});}); const akim=Array(6).fill(0); loadData(K.kasa).forEach(k=>{ const d=new Date(k.tarih); const diff=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth()); if(diff>=0&&diff<6){ akim[5-diff]+= (k.tur==='Giriş'?1:-1)*(Number(k.tutar)||0);} }); new Chart(nakitCtx,{type:'bar',data:{labels,datasets:[{label:'Nakit Akışı',data:akim,backgroundColor:'#22c55e'}]},options:{plugins:{legend:{display:false}}}}); }
  }

  // Initial renders
  renderMusteri(); renderSozlesme(); renderTahsilat(); renderKasa(); renderGider(); renderStok(); renderCharts();

})();

