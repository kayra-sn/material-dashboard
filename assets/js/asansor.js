(function () {
  'use strict';

  const menuItems = document.querySelectorAll('#sidebar ul li');
  const sections = document.querySelectorAll('.content-section');
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'success') {
    const wrapper = document.createElement('div');
    wrapper.className = `toast align-items-center text-bg-${type} border-0`;
    wrapper.setAttribute('role', 'alert');
    wrapper.setAttribute('aria-live', 'assertive');
    wrapper.setAttribute('aria-atomic', 'true');
    wrapper.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Kapat"></button>
      </div>
    `;
    toastContainer.appendChild(wrapper);
    const toast = new bootstrap.Toast(wrapper, { delay: 2500 });
    toast.show();
    wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
  }

  function hideAllSections() {
    sections.forEach(sec => sec.classList.add('d-none'));
    menuItems.forEach(item => item.classList.remove('active'));
  }

  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (!target) return;
      hideAllSections();
      target.classList.remove('d-none');
      item.classList.add('active');
      target.focus();
      localStorage.setItem('asansor:lastSection', targetId);
    });
  });

  // Restore last section
  (function initSection() {
    const last = localStorage.getItem('asansor:lastSection') || 'dashboardSection';
    const menuItem = Array.from(menuItems).find(m => m.getAttribute('data-target') === last) || menuItems[0];
    menuItem.click();
  })();

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('input, select').forEach(input => {
      if (!input.checkValidity()) {
        input.classList.add('is-invalid');
        valid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });
    return valid;
  }

  // Data persistence helpers
  function loadData(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // CSV export
  function exportTableToCsv(table, filename) {
    const rows = Array.from(table.querySelectorAll('tr'));
    const data = rows.map(r => Array.from(r.querySelectorAll('th,td'))
      .map(c => '"' + (c.innerText || '').replace(/"/g, '""') + '"')
      .join(','));
    const blob = new Blob([data.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Render helpers
  function badgeForStatus(status, map) {
    const cls = map[status] || 'bg-secondary';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  // State keys
  const K = {
    ariza: 'asansor:ariza',
    bakim: 'asansor:bakim',
    teklif: 'asansor:teklif',
    muhasebe: 'asansor:muhasebe',
    musteri: 'asansor:musteri',
    sozlesme: 'asansor:sozlesme',
    tahsilat: 'asansor:tahsilat',
    kasa: 'asansor:kasa',
    gider: 'asansor:gider',
    stok: 'asansor:stok',
    dark: 'asansor:dark'
  };

  // Dark mode
  const darkToggle = document.getElementById('darkModeToggle');
  function applyDarkMode() {
    const enabled = localStorage.getItem(K.dark) === '1';
    document.body.classList.toggle('dark', enabled);
    if (darkToggle) darkToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      const enabled = !(localStorage.getItem(K.dark) === '1');
      localStorage.setItem(K.dark, enabled ? '1' : '0');
      applyDarkMode();
    });
  }
  applyDarkMode();

  // Tables
  const arizaTable = document.getElementById('arizaYonetimTable');
  const bakimTable = document.getElementById('bakimTable');
  const teklifTable = document.getElementById('teklifTable');
  const muhasebeTable = document.getElementById('muhasebeTable');
  const musteriTable = document.getElementById('musteriTable');
  const sozlesmeTable = document.getElementById('sozlesmeTable');
  const tahsilatTable = document.getElementById('tahsilatTable');
  const kasaTable = document.getElementById('kasaTable');
  const giderTable = document.getElementById('giderTable');
  const stokTable = document.getElementById('stokTable');
  const dashboardArizaTable = document.getElementById('arizaTable');

  function renderAriza(filter = {}) {
    const data = loadData(K.ariza);
    const filtered = data.filter(d => {
      const q = (filter.q || '').toLowerCase();
      const status = filter.status || '';
      const textMatch = !q || Object.values(d).join(' ').toLowerCase().includes(q);
      const statusMatch = !status || d.durum === status;
      return textMatch && statusMatch;
    });
    const tbody = arizaTable.querySelector('tbody');
    tbody.innerHTML = '';
    filtered.forEach((r, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.asansorId}</td>
        <td>${r.binaAdi}</td>
        <td>${r.arizaTipi}</td>
        <td>${r.tarih.replace('T', ' ')}</td>
        <td>${badgeForStatus(r.durum, { 'Acil': 'bg-danger', 'Beklemede': 'bg-warning text-dark', 'Çözüldü': 'bg-success' })}</td>
        <td>${r.personel}</td>
        <td>
          <i class="fas fa-pen action-icon text-primary" title="Düzenle" data-action="edit" data-index="${index}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-index="${index}"></i>
        </td>`;
      tbody.appendChild(tr);
    });
    // dashboard table preview (last 3)
    if (dashboardArizaTable) {
      const dTbody = dashboardArizaTable.querySelector('tbody');
      dTbody.innerHTML = '';
      data.slice(-3).reverse().forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.asansorId}</td>
          <td>${r.binaAdi}</td>
          <td>${r.arizaTipi}</td>
          <td>${r.tarih.replace('T', ' ')}</td>
          <td>${badgeForStatus(r.durum, { 'Acil': 'bg-danger', 'Beklemede': 'bg-warning text-dark', 'Çözüldü': 'bg-success' })}</td>
          <td>${r.personel}</td>
          <td><i class="fas fa-pen action-icon text-primary" title="Düzenle"></i><i class="fas fa-trash action-icon text-danger" title="Sil"></i></td>`;
        dTbody.appendChild(tr);
      });
    }
    updateStats();
  }

  function renderBakim(filter = {}) {
    const data = loadData(K.bakim);
    const filtered = data.filter(d => {
      const q = (filter.q || '').toLowerCase();
      const status = filter.status || '';
      const textMatch = !q || Object.values(d).join(' ').toLowerCase().includes(q);
      const statusMatch = !status || d.durum === status;
      return textMatch && statusMatch;
    });
    const tbody = bakimTable.querySelector('tbody');
    tbody.innerHTML = '';
    filtered.forEach((r, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.asansorId}</td>
        <td>${r.binaAdi}</td>
        <td>${r.tarih}</td>
        <td>${r.personel}</td>
        <td>${badgeForStatus(r.durum, { 'Tamamlandı': 'bg-success', 'Planlandı': 'bg-info text-dark', 'Beklemede': 'bg-warning text-dark' })}</td>
        <td>
          <i class="fas fa-pen action-icon text-primary" title="Düzenle" data-action="edit" data-index="${index}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-index="${index}"></i>
        </td>`;
      tbody.appendChild(tr);
    });
    updateStats();
  }

  function renderTeklif(filter = {}) {
    const data = loadData(K.teklif);
    const filtered = data.filter(d => {
      const q = (filter.q || '').toLowerCase();
      const status = filter.status || '';
      const textMatch = !q || Object.values(d).join(' ').toLowerCase().includes(q);
      const statusMatch = !status || d.durum === status;
      return textMatch && statusMatch;
    });
    const tbody = teklifTable.querySelector('tbody');
    tbody.innerHTML = '';
    filtered.forEach((r, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.no}</td>
        <td>${r.musteri}</td>
        <td>${r.tarih}</td>
        <td>${badgeForStatus(r.durum, { 'Onaylandı': 'bg-success', 'Beklemede': 'bg-warning text-dark', 'Reddedildi': 'bg-danger' })}</td>
        <td>${r.montajTarihi || '-'}</td>
        <td>
          <i class="fas fa-pen action-icon text-primary" title="Düzenle" data-action="edit" data-index="${index}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-index="${index}"></i>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  function renderMuhasebe(filter = {}) {
    const data = loadData(K.muhasebe);
    const filtered = data.filter(d => {
      const q = (filter.q || '').toLowerCase();
      const status = filter.status || '';
      const textMatch = !q || Object.values(d).join(' ').toLowerCase().includes(q);
      const statusMatch = !status || d.durum === status;
      return textMatch && statusMatch;
    });
    const tbody = muhasebeTable.querySelector('tbody');
    tbody.innerHTML = '';
    filtered.forEach((r, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.faturaNo}</td>
        <td>${r.musteri}</td>
        <td>${r.tarih}</td>
        <td>${Number(r.tutar).toFixed(2)} ₺</td>
        <td>${badgeForStatus(r.durum, { 'Ödendi': 'bg-success', 'Beklemede': 'bg-warning text-dark', 'Gecikmiş': 'bg-danger' })}</td>
        <td>${r.odemeTuru}</td>
        <td>
          <i class="fas fa-pen action-icon text-primary" title="Düzenle" data-action="edit" data-index="${index}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-index="${index}"></i>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  function updateStats() {
    const ariza = loadData(K.ariza);
    const bakim = loadData(K.bakim);
    const acikAriza = ariza.filter(a => a.durum !== 'Çözüldü').length;
    const planlananBakim = bakim.filter(b => b.durum === 'Planlandı').length;
    const statAcikAriza = document.getElementById('statAcikAriza');
    const statPlanlananBakim = document.getElementById('statPlanlananBakim');
    if (statAcikAriza) statAcikAriza.textContent = String(acikAriza);
    if (statPlanlananBakim) statPlanlananBakim.textContent = String(planlananBakim);
  }

  // Forms
  document.getElementById('arizaForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const data = loadData(K.ariza);
    data.push({
      asansorId: form.arizaAsansorId.value.trim(),
      binaAdi: form.arizaBinaAdi.value.trim(),
      arizaTipi: form.arizaTipi.value.trim(),
      tarih: form.arizaTarih.value,
      durum: form.arizaDurum.value,
      personel: form.arizaPersonel.value.trim()
    });
    saveData(K.ariza, data);
    renderAriza();
    bootstrap.Modal.getInstance(document.getElementById('arizaModal')).hide();
    form.reset();
    showToast('Arıza kaydı eklendi');
  });

  document.getElementById('bakimForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const data = loadData(K.bakim);
    data.push({
      asansorId: form.bakimAsansorId.value.trim(),
      binaAdi: form.bakimBinaAdi.value.trim(),
      tarih: form.bakimTarihi.value,
      personel: form.bakimPersonel.value.trim(),
      durum: form.bakimDurum.value
    });
    saveData(K.bakim, data);
    renderBakim();
    bootstrap.Modal.getInstance(document.getElementById('bakimModal')).hide();
    form.reset();
    showToast('Bakım kaydı eklendi');
  });

  document.getElementById('teklifForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const data = loadData(K.teklif);
    data.push({
      no: form.teklifNo.value.trim(),
      musteri: form.teklifMusteri.value.trim(),
      tarih: form.teklifTarihi.value,
      durum: form.teklifDurum.value,
      montajTarihi: form.montajTarihi.value || ''
    });
    saveData(K.teklif, data);
    renderTeklif();
    bootstrap.Modal.getInstance(document.getElementById('teklifModal')).hide();
    form.reset();
    showToast('Teklif eklendi');
  });

  document.getElementById('muhasebeForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const data = loadData(K.muhasebe);
    data.push({
      faturaNo: form.faturaNo.value.trim(),
      musteri: form.muhasebeMusteri.value.trim(),
      tarih: form.muhasebeTarih.value,
      tutar: Number(form.tutar.value),
      durum: form.muhasebeDurum.value,
      odemeTuru: form.odemeTuru.value
    });
    saveData(K.muhasebe, data);
    renderMuhasebe();
    bootstrap.Modal.getInstance(document.getElementById('muhasebeModal')).hide();
    form.reset();
    showToast('Muhasebe kaydı eklendi');
  });

  // Delete/Edit actions using event delegation
  function handleCrudClicks(container, key, renderFn) {
    container.addEventListener('click', (e) => {
      const icon = e.target.closest('i[data-action]');
      if (!icon) return;
      const action = icon.getAttribute('data-action');
      const index = Number(icon.getAttribute('data-index'));
      const data = loadData(key);
      if (action === 'delete') {
        if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
          data.splice(index, 1);
          saveData(key, data);
          renderFn();
          showToast('Kayıt silindi', 'warning');
        }
      } else if (action === 'edit') {
        // Simple inline edit prompt set
        const record = data[index];
        const entries = Object.entries(record).map(([k, v]) => {
          const nv = prompt(`${k} değerini düzenleyin:`, v);
          return [k, nv === null ? v : nv];
        });
        data[index] = Object.fromEntries(entries);
        saveData(key, data);
        renderFn();
        showToast('Kayıt güncellendi', 'info');
      }
    });
  }

  handleCrudClicks(arizaTable, K.ariza, () => renderAriza(currentFilters.ariza));
  handleCrudClicks(bakimTable, K.bakim, () => renderBakim(currentFilters.bakim));
  handleCrudClicks(teklifTable, K.teklif, () => renderTeklif(currentFilters.teklif));
  handleCrudClicks(muhasebeTable, K.muhasebe, () => renderMuhasebe(currentFilters.muhasebe));

  // Filters and search
  const currentFilters = { ariza: {}, bakim: {}, teklif: {}, muhasebe: {} };
  document.getElementById('arizaSearch')?.addEventListener('input', (e) => { currentFilters.ariza.q = e.target.value; renderAriza(currentFilters.ariza); });
  document.getElementById('arizaStatusFilter')?.addEventListener('change', (e) => { currentFilters.ariza.status = e.target.value; renderAriza(currentFilters.ariza); });
  document.getElementById('arizaExportCsv')?.addEventListener('click', () => exportTableToCsv(arizaTable, 'ariza.csv'));

  document.getElementById('bakimSearch')?.addEventListener('input', (e) => { currentFilters.bakim.q = e.target.value; renderBakim(currentFilters.bakim); });
  document.getElementById('bakimStatusFilter')?.addEventListener('change', (e) => { currentFilters.bakim.status = e.target.value; renderBakim(currentFilters.bakim); });
  document.getElementById('bakimExportCsv')?.addEventListener('click', () => exportTableToCsv(bakimTable, 'bakim.csv'));

  document.getElementById('teklifSearch')?.addEventListener('input', (e) => { currentFilters.teklif.q = e.target.value; renderTeklif(currentFilters.teklif); });
  document.getElementById('teklifStatusFilter')?.addEventListener('change', (e) => { currentFilters.teklif.status = e.target.value; renderTeklif(currentFilters.teklif); });
  document.getElementById('teklifExportCsv')?.addEventListener('click', () => exportTableToCsv(teklifTable, 'teklif.csv'));

  document.getElementById('muhasebeSearch')?.addEventListener('input', (e) => { currentFilters.muhasebe.q = e.target.value; renderMuhasebe(currentFilters.muhasebe); });
  document.getElementById('muhasebeStatusFilter')?.addEventListener('change', (e) => { currentFilters.muhasebe.status = e.target.value; renderMuhasebe(currentFilters.muhasebe); });
  document.getElementById('muhasebeExportCsv')?.addEventListener('click', () => exportTableToCsv(muhasebeTable, 'muhasebe.csv'));

  // Dashboard quick search/export
  document.getElementById('dashboardArizaAra')?.addEventListener('input', (e) => {
    currentFilters.ariza.q = e.target.value;
    renderAriza(currentFilters.ariza);
  });
  document.getElementById('dashboardArizaCsv')?.addEventListener('click', () => exportTableToCsv(dashboardArizaTable, 'dashboard_ariza.csv'));

  // Seed demo data if empty
  (function seed() {
    if (loadData(K.ariza).length === 0) {
      saveData(K.ariza, [
        { asansorId: '#A-102', binaAdi: 'ABC Plaza', arizaTipi: 'Kapı Arızası', tarih: '2025-08-10T10:45', durum: 'Beklemede', personel: 'Mehmet Yılmaz' },
        { asansorId: '#B-210', binaAdi: 'XYZ Rezidans', arizaTipi: 'Motor Sorunu', tarih: '2025-08-11T09:15', durum: 'Acil', personel: 'Ayşe Demir' },
        { asansorId: '#C-099', binaAdi: 'Delta İş Merkezi', arizaTipi: 'Hareket Durdurma', tarih: '2025-08-09T14:30', durum: 'Çözüldü', personel: 'Ali Korkmaz' }
      ]);
    }
    if (loadData(K.bakim).length === 0) {
      saveData(K.bakim, [
        { asansorId: '#A-102', binaAdi: 'ABC Plaza', tarih: '2025-08-15', personel: 'Mehmet Yılmaz', durum: 'Planlandı' },
        { asansorId: '#B-210', binaAdi: 'XYZ Rezidans', tarih: '2025-08-12', personel: 'Ayşe Demir', durum: 'Tamamlandı' }
      ]);
    }
    if (loadData(K.teklif).length === 0) {
      saveData(K.teklif, [
        { no: 'T-001', musteri: 'ACME LTD', tarih: '2025-08-02', durum: 'Beklemede', montajTarihi: '' },
        { no: 'T-002', musteri: 'XYZ AŞ', tarih: '2025-08-05', durum: 'Onaylandı', montajTarihi: '2025-09-01' }
      ]);
    }
    if (loadData(K.muhasebe).length === 0) {
      saveData(K.muhasebe, [
        { faturaNo: 'F-1001', musteri: 'ACME LTD', tarih: '2025-08-03', tutar: 12500.5, durum: 'Ödendi', odemeTuru: 'Havale' },
        { faturaNo: 'F-1002', musteri: 'XYZ AŞ', tarih: '2025-08-10', tutar: 9850, durum: 'Beklemede', odemeTuru: 'Kredi Kartı' }
      ]);
    }
  })();

  // Initial renders
  renderAriza();
  renderBakim();
  renderTeklif();
  renderMuhasebe();
})();

