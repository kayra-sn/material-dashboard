/* Entegre Mühendislik - Asansör Takip Sistemi
   - Karanlık mod kalıcılığı
   - Sekme (section) kalıcılığı
   - Kayıtların localStorage'da saklanması (ariza, bakim, teklif, muhasebe)
   - Arama ve filtreleme
   - Ekle/Düzenle/Sil işlemleri
   - Dashboard istatistikleri
   - Toast bildirimleri
*/

(function () {
  const STORAGE_KEYS = {
    THEME: 'theme:dark',
    ACTIVE_SECTION: 'ui:activeSection',
    ARIZA: 'data:arizalar',
    BAKIM: 'data:bakimlar',
    TEKLIF: 'data:teklifler',
    MUHASEBE: 'data:muhasebe'
  };

  const selectors = {
    sidebarItems: '#sidebar ul li',
    sections: '.content-section',
    arizaTableBody: '#arizaYonetimTable tbody',
    arizaDashBody: '#arizaTable tbody',
    bakimTableBody: '#bakimTable tbody',
    teklifTableBody: '#teklifTable tbody',
    muhasebeTableBody: '#muhasebeTable tbody',
    toastContainer: '#toastContainer'
  };

  const dom = {};

  function queryCached() {
    dom.sidebarItems = document.querySelectorAll(selectors.sidebarItems);
    dom.sections = document.querySelectorAll(selectors.sections);
    dom.arizaTableBody = document.querySelector(selectors.arizaTableBody);
    dom.arizaDashBody = document.querySelector(selectors.arizaDashBody);
    dom.bakimTableBody = document.querySelector(selectors.bakimTableBody);
    dom.teklifTableBody = document.querySelector(selectors.teklifTableBody);
    dom.muhasebeTableBody = document.querySelector(selectors.muhasebeTableBody);
    dom.toastContainer = document.querySelector(selectors.toastContainer);
  }

  const state = {
    arizalar: [],
    bakimlar: [],
    teklifler: [],
    muhasebe: []
  };

  const editState = {
    arizaIndex: null,
    bakimIndex: null,
    teklifIndex: null,
    muhasebeIndex: null
  };

  function loadTheme() {
    const isDark = localStorage.getItem(STORAGE_KEYS.THEME) === '1';
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  }

  function toggleTheme() {
    const nowDark = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', nowDark);
    localStorage.setItem(STORAGE_KEYS.THEME, nowDark ? '1' : '0');
    toast(nowDark ? 'Karanlık mod etkinleştirildi' : 'Aydınlık mod etkinleştirildi');
  }

  function toast(message, type = 'info') {
    if (!dom.toastContainer) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'toast align-items-center text-bg-' + (type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary') + ' border-0 mb-2';
    wrapper.setAttribute('role', 'alert');
    wrapper.setAttribute('aria-live', 'assertive');
    wrapper.setAttribute('aria-atomic', 'true');
    wrapper.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Kapat"></button>
      </div>
    `;
    dom.toastContainer.appendChild(wrapper);
    const t = new bootstrap.Toast(wrapper, { delay: 2000 });
    t.show();
  }

  function saveAll() {
    localStorage.setItem(STORAGE_KEYS.ARIZA, JSON.stringify(state.arizalar));
    localStorage.setItem(STORAGE_KEYS.BAKIM, JSON.stringify(state.bakimlar));
    localStorage.setItem(STORAGE_KEYS.TEKLIF, JSON.stringify(state.teklifler));
    localStorage.setItem(STORAGE_KEYS.MUHASEBE, JSON.stringify(state.muhasebe));
  }

  function loadAll() {
    state.arizalar = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARIZA) || '[]');
    state.bakimlar = JSON.parse(localStorage.getItem(STORAGE_KEYS.BAKIM) || '[]');
    state.teklifler = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEKLIF) || '[]');
    state.muhasebe = JSON.parse(localStorage.getItem(STORAGE_KEYS.MUHASEBE) || '[]');
  }

  function formatBadge(value, mappings) {
    const cls = mappings[value] || 'bg-secondary';
    return `<span class="badge ${cls}">${value}</span>`;
  }

  function renderArizaTables() {
    if (dom.arizaTableBody) dom.arizaTableBody.innerHTML = '';
    if (dom.arizaDashBody) dom.arizaDashBody.innerHTML = '';
    const statusClass = {
      'Acil': 'bg-danger',
      'Beklemede': 'bg-warning text-dark',
      'Çözüldü': 'bg-success'
    };

    state.arizalar.forEach((rec, idx) => {
      if (dom.arizaTableBody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${rec.asansorId}</td>
          <td>${rec.binaAdi}</td>
          <td>${rec.arizaTipi}</td>
          <td>${rec.tarih}</td>
          <td>${formatBadge(rec.durum, statusClass)}</td>
          <td>${rec.personel}</td>
          <td>
            <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="ariza" data-index="${idx}"></i>
            <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="ariza" data-index="${idx}"></i>
          </td>
        `;
        dom.arizaTableBody.appendChild(tr);
      }
    });

    // Dashboard table: last 10
    state.arizalar.slice(-10).forEach(rec => {
      if (!dom.arizaDashBody) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.asansorId}</td>
        <td>${rec.binaAdi}</td>
        <td>${rec.arizaTipi}</td>
        <td>${rec.tarih}</td>
        <td>${formatBadge(rec.durum, statusClass)}</td>
        <td>${rec.personel}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="ariza-dash" data-id="${rec.id}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="ariza-dash" data-id="${rec.id}"></i>
        </td>
      `;
      dom.arizaDashBody.appendChild(tr);
    });
  }

  function renderBakimTable() {
    if (!dom.bakimTableBody) return;
    dom.bakimTableBody.innerHTML = '';
    const statusClass = {
      'Tamamlandı': 'bg-success',
      'Planlandı': 'bg-info text-dark',
      'Beklemede': 'bg-warning text-dark'
    };
    state.bakimlar.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.asansorId}</td>
        <td>${rec.binaAdi}</td>
        <td>${rec.tarih}</td>
        <td>${rec.personel}</td>
        <td>${formatBadge(rec.durum, statusClass)}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="bakim" data-index="${idx}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="bakim" data-index="${idx}"></i>
        </td>
      `;
      dom.bakimTableBody.appendChild(tr);
    });
  }

  function renderTeklifTable() {
    if (!dom.teklifTableBody) return;
    dom.teklifTableBody.innerHTML = '';
    const statusClass = {
      'Onaylandı': 'bg-success',
      'Beklemede': 'bg-warning text-dark',
      'Reddedildi': 'bg-danger'
    };
    state.teklifler.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.no}</td>
        <td>${rec.musteri}</td>
        <td>${rec.tarih}</td>
        <td>${formatBadge(rec.durum, statusClass)}</td>
        <td>${rec.montajTarihi || '-'}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="teklif" data-index="${idx}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="teklif" data-index="${idx}"></i>
        </td>
      `;
      dom.teklifTableBody.appendChild(tr);
    });
  }

  function renderMuhasebeTable() {
    if (!dom.muhasebeTableBody) return;
    dom.muhasebeTableBody.innerHTML = '';
    const statusClass = {
      'Ödendi': 'bg-success',
      'Beklemede': 'bg-warning text-dark',
      'Gecikmiş': 'bg-danger'
    };
    state.muhasebe.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.faturaNo}</td>
        <td>${rec.musteri}</td>
        <td>${rec.tarih}</td>
        <td>${Number(rec.tutar).toFixed(2)} ₺</td>
        <td>${formatBadge(rec.durum, statusClass)}</td>
        <td>${rec.odemeTuru}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="muhasebe" data-index="${idx}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="muhasebe" data-index="${idx}"></i>
        </td>
      `;
      dom.muhasebeTableBody.appendChild(tr);
    });
  }

  function updateDashboardStats() {
    const elTotal = document.getElementById('statTotalAsansor');
    const elAcik = document.getElementById('statAcikAriza');
    const elPlanli = document.getElementById('statPlanliBakim');
    if (elTotal) elTotal.textContent = String(new Set(state.arizalar.map(a => a.asansorId)).size);
    if (elAcik) elAcik.textContent = String(state.arizalar.filter(a => a.durum !== 'Çözüldü').length);
    if (elPlanli) elPlanli.textContent = String(state.bakimlar.filter(b => b.durum === 'Planlandı').length);
  }

  function rerenderAll() {
    renderArizaTables();
    renderBakimTable();
    renderTeklifTable();
    renderMuhasebeTable();
    updateDashboardStats();
  }

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

  function resetForm(form) {
    if (!form) return;
    form.reset();
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  function ensureId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function setupForms() {
    const arizaForm = document.getElementById('arizaForm');
    if (arizaForm) {
      arizaForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateForm(arizaForm)) return;
        const payload = {
          asansorId: arizaForm.arizaAsansorId.value.trim(),
          binaAdi: arizaForm.arizaBinaAdi.value.trim(),
          arizaTipi: arizaForm.arizaTipi.value.trim(),
          tarih: arizaForm.arizaTarih.value.replace('T', ' '),
          durum: arizaForm.arizaDurum.value,
          personel: arizaForm.arizaPersonel.value.trim()
        };
        if (editState.arizaIndex !== null) {
          const rec = state.arizalar[editState.arizaIndex];
          if (rec) Object.assign(rec, payload);
          toast('Arıza kaydı güncellendi', 'success');
        } else {
          state.arizalar.push({ id: ensureId(), ...payload });
          toast('Arıza kaydı eklendi', 'success');
        }
        editState.arizaIndex = null;
        saveAll();
        rerenderAll();
        bootstrap.Modal.getInstance(document.getElementById('arizaModal')).hide();
        resetForm(arizaForm);
        applyFilters();
      });
    }

    const bakimForm = document.getElementById('bakimForm');
    if (bakimForm) {
      bakimForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateForm(bakimForm)) return;
        const payload = {
          asansorId: bakimForm.bakimAsansorId.value.trim(),
          binaAdi: bakimForm.bakimBinaAdi.value.trim(),
          tarih: bakimForm.bakimTarihi.value,
          personel: bakimForm.bakimPersonel.value.trim(),
          durum: bakimForm.bakimDurum.value
        };
        if (editState.bakimIndex !== null) {
          const rec = state.bakimlar[editState.bakimIndex];
          if (rec) Object.assign(rec, payload);
          toast('Bakım kaydı güncellendi', 'success');
        } else {
          state.bakimlar.push({ id: ensureId(), ...payload });
          toast('Bakım kaydı eklendi', 'success');
        }
        editState.bakimIndex = null;
        saveAll();
        rerenderAll();
        bootstrap.Modal.getInstance(document.getElementById('bakimModal')).hide();
        resetForm(bakimForm);
        applyFilters();
      });
    }

    const teklifForm = document.getElementById('teklifForm');
    if (teklifForm) {
      teklifForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateForm(teklifForm)) return;
        const payload = {
          no: teklifForm.teklifNo.value.trim(),
          musteri: teklifForm.teklifMusteri.value.trim(),
          tarih: teklifForm.teklifTarihi.value,
          durum: teklifForm.teklifDurum.value,
          montajTarihi: teklifForm.montajTarihi.value || ''
        };
        if (editState.teklifIndex !== null) {
          const rec = state.teklifler[editState.teklifIndex];
          if (rec) Object.assign(rec, payload);
          toast('Teklif güncellendi', 'success');
        } else {
          state.teklifler.push({ id: ensureId(), ...payload });
          toast('Teklif eklendi', 'success');
        }
        editState.teklifIndex = null;
        saveAll();
        rerenderAll();
        bootstrap.Modal.getInstance(document.getElementById('teklifModal')).hide();
        resetForm(teklifForm);
        applyFilters();
      });
    }

    const muhasebeForm = document.getElementById('muhasebeForm');
    if (muhasebeForm) {
      muhasebeForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateForm(muhasebeForm)) return;
        const payload = {
          faturaNo: muhasebeForm.faturaNo.value.trim(),
          musteri: muhasebeForm.muhasebeMusteri.value.trim(),
          tarih: muhasebeForm.muhasebeTarih.value,
          tutar: parseFloat(muhasebeForm.tutar.value || '0'),
          durum: muhasebeForm.muhasebeDurum.value,
          odemeTuru: muhasebeForm.odemeTuru.value
        };
        if (editState.muhasebeIndex !== null) {
          const rec = state.muhasebe[editState.muhasebeIndex];
          if (rec) Object.assign(rec, payload);
          toast('Muhasebe kaydı güncellendi', 'success');
        } else {
          state.muhasebe.push({ id: ensureId(), ...payload });
          toast('Muhasebe kaydı eklendi', 'success');
        }
        editState.muhasebeIndex = null;
        saveAll();
        rerenderAll();
        bootstrap.Modal.getInstance(document.getElementById('muhasebeModal')).hide();
        resetForm(muhasebeForm);
        applyFilters();
      });
    }
  }

  function applyFilters() {
    // Ariza filters
    const arama = (document.getElementById('arizaSearch')?.value || '').toLowerCase();
    const durumFilter = document.getElementById('arizaDurumFilter')?.value || '';
    let list = state.arizalar;
    if (arama) list = list.filter(r => Object.values(r).join(' ').toLowerCase().includes(arama));
    if (durumFilter) list = list.filter(r => r.durum === durumFilter);
    // re-render ariza table body only
    if (dom.arizaTableBody) dom.arizaTableBody.innerHTML = '';
    const statusClass = {
      'Acil': 'bg-danger',
      'Beklemede': 'bg-warning text-dark',
      'Çözüldü': 'bg-success'
    };
    list.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.asansorId}</td>
        <td>${rec.binaAdi}</td>
        <td>${rec.arizaTipi}</td>
        <td>${rec.tarih}</td>
        <td>${formatBadge(rec.durum, statusClass)}</td>
        <td>${rec.personel}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="ariza" data-index="${state.arizalar.indexOf(rec)}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="ariza" data-index="${state.arizalar.indexOf(rec)}"></i>
        </td>
      `;
      dom.arizaTableBody.appendChild(tr);
    });

    // Bakim filters
    const bArama = (document.getElementById('bakimSearch')?.value || '').toLowerCase();
    const bDurum = document.getElementById('bakimDurumFilter')?.value || '';
    let blist = state.bakimlar;
    if (bArama) blist = blist.filter(r => Object.values(r).join(' ').toLowerCase().includes(bArama));
    if (bDurum) blist = blist.filter(r => r.durum === bDurum);
    if (dom.bakimTableBody) dom.bakimTableBody.innerHTML = '';
    const bStatus = {
      'Tamamlandı': 'bg-success',
      'Planlandı': 'bg-info text-dark',
      'Beklemede': 'bg-warning text-dark'
    };
    blist.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.asansorId}</td>
        <td>${rec.binaAdi}</td>
        <td>${rec.tarih}</td>
        <td>${rec.personel}</td>
        <td>${formatBadge(rec.durum, bStatus)}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="bakim" data-index="${state.bakimlar.indexOf(rec)}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="bakim" data-index="${state.bakimlar.indexOf(rec)}"></i>
        </td>
      `;
      dom.bakimTableBody.appendChild(tr);
    });

    // Teklif filters
    const tArama = (document.getElementById('teklifSearch')?.value || '').toLowerCase();
    const tDurum = document.getElementById('teklifDurumFilter')?.value || '';
    let tlist = state.teklifler;
    if (tArama) tlist = tlist.filter(r => Object.values(r).join(' ').toLowerCase().includes(tArama));
    if (tDurum) tlist = tlist.filter(r => r.durum === tDurum);
    if (dom.teklifTableBody) dom.teklifTableBody.innerHTML = '';
    const tStatus = {
      'Onaylandı': 'bg-success',
      'Beklemede': 'bg-warning text-dark',
      'Reddedildi': 'bg-danger'
    };
    tlist.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.no}</td>
        <td>${rec.musteri}</td>
        <td>${rec.tarih}</td>
        <td>${formatBadge(rec.durum, tStatus)}</td>
        <td>${rec.montajTarihi || '-'}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="teklif" data-index="${state.teklifler.indexOf(rec)}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="teklif" data-index="${state.teklifler.indexOf(rec)}"></i>
        </td>
      `;
      dom.teklifTableBody.appendChild(tr);
    });

    // Muhasebe filters
    const mArama = (document.getElementById('muhasebeSearch')?.value || '').toLowerCase();
    const mDurum = document.getElementById('muhasebeDurumFilter')?.value || '';
    const mOdeme = document.getElementById('muhasebeOdemeFilter')?.value || '';
    let mlist = state.muhasebe;
    if (mArama) mlist = mlist.filter(r => Object.values(r).join(' ').toLowerCase().includes(mArama));
    if (mDurum) mlist = mlist.filter(r => r.durum === mDurum);
    if (mOdeme) mlist = mlist.filter(r => r.odemeTuru === mOdeme);
    if (dom.muhasebeTableBody) dom.muhasebeTableBody.innerHTML = '';
    const mStatus = {
      'Ödendi': 'bg-success',
      'Beklemede': 'bg-warning text-dark',
      'Gecikmiş': 'bg-danger'
    };
    mlist.forEach((rec, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rec.faturaNo}</td>
        <td>${rec.musteri}</td>
        <td>${rec.tarih}</td>
        <td>${Number(rec.tutar).toFixed(2)} ₺</td>
        <td>${formatBadge(rec.durum, mStatus)}</td>
        <td>${rec.odemeTuru}</td>
        <td>
          <i class="fas fa-pen-to-square action-icon text-primary" title="Düzenle" data-action="edit" data-type="muhasebe" data-index="${state.muhasebe.indexOf(rec)}"></i>
          <i class="fas fa-trash action-icon text-danger" title="Sil" data-action="delete" data-type="muhasebe" data-index="${state.muhasebe.indexOf(rec)}"></i>
        </td>
      `;
      dom.muhasebeTableBody.appendChild(tr);
    });
  }

  function hookFilters() {
    ['arizaSearch', 'arizaDurumFilter', 'bakimSearch', 'bakimDurumFilter', 'teklifSearch', 'teklifDurumFilter', 'muhasebeSearch', 'muhasebeDurumFilter', 'muhasebeOdemeFilter']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', applyFilters);
        if (el && el.tagName === 'SELECT') el.addEventListener('change', applyFilters);
      });
  }

  function showSectionById(sectionId) {
    dom.sections.forEach(sec => sec.classList.add('d-none'));
    const toShow = document.getElementById(sectionId);
    if (toShow) {
      toShow.classList.remove('d-none');
      toShow.focus();
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, sectionId);
    }
    dom.sidebarItems.forEach(li => li.classList.toggle('active', li.getAttribute('data-target') === sectionId));
  }

  function setupSidebar() {
    dom.sidebarItems.forEach(li => {
      li.addEventListener('click', () => showSectionById(li.getAttribute('data-target')));
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showSectionById(li.getAttribute('data-target'));
        }
      });
    });
    // initial
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTION) || 'dashboardSection';
    showSectionById(saved);
  }

  function findRecordIndex(type, idxOrId) {
    if (type === 'ariza-dash') {
      return state.arizalar.findIndex(a => a.id === idxOrId);
    }
    return Number(idxOrId);
  }

  function setupTableActions() {
    document.querySelectorAll('table').forEach(table => {
      table.addEventListener('click', e => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        const type = target.getAttribute('data-type');
        const indexAttr = target.getAttribute('data-index');
        const idAttr = target.getAttribute('data-id');
        const index = findRecordIndex(type, indexAttr ?? idAttr);

        if (action === 'delete') {
          if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
          if (type.startsWith('ariza')) state.arizalar.splice(index, 1);
          else if (type === 'bakim') state.bakimlar.splice(index, 1);
          else if (type === 'teklif') state.teklifler.splice(index, 1);
          else if (type === 'muhasebe') state.muhasebe.splice(index, 1);
          saveAll();
          rerenderAll();
          applyFilters();
          toast('Kayıt silindi', 'success');
        } else if (action === 'edit') {
          // open related modal and preload, set edit mode
          if (type.startsWith('ariza')) {
            const rec = state.arizalar[index];
            const form = document.getElementById('arizaForm');
            if (!rec || !form) return;
            editState.arizaIndex = index;
            form.arizaAsansorId.value = rec.asansorId;
            form.arizaBinaAdi.value = rec.binaAdi;
            form.arizaTipi.value = rec.arizaTipi;
            form.arizaTarih.value = rec.tarih.replace(' ', 'T');
            form.arizaDurum.value = rec.durum;
            form.arizaPersonel.value = rec.personel;
            const modal = new bootstrap.Modal(document.getElementById('arizaModal'));
            modal.show();
          } else if (type === 'bakim') {
            const rec = state.bakimlar[index];
            const form = document.getElementById('bakimForm');
            if (!rec || !form) return;
            editState.bakimIndex = index;
            form.bakimAsansorId.value = rec.asansorId;
            form.bakimBinaAdi.value = rec.binaAdi;
            form.bakimTarihi.value = rec.tarih;
            form.bakimPersonel.value = rec.personel;
            form.bakimDurum.value = rec.durum;
            const modal = new bootstrap.Modal(document.getElementById('bakimModal'));
            modal.show();
          } else if (type === 'teklif') {
            const rec = state.teklifler[index];
            const form = document.getElementById('teklifForm');
            if (!rec || !form) return;
            editState.teklifIndex = index;
            form.teklifNo.value = rec.no;
            form.teklifMusteri.value = rec.musteri;
            form.teklifTarihi.value = rec.tarih;
            form.teklifDurum.value = rec.durum;
            form.montajTarihi.value = rec.montajTarihi || '';
            const modal = new bootstrap.Modal(document.getElementById('teklifModal'));
            modal.show();
          } else if (type === 'muhasebe') {
            const rec = state.muhasebe[index];
            const form = document.getElementById('muhasebeForm');
            if (!rec || !form) return;
            editState.muhasebeIndex = index;
            form.faturaNo.value = rec.faturaNo;
            form.muhasebeMusteri.value = rec.musteri;
            form.muhasebeTarih.value = rec.tarih;
            form.tutar.value = rec.tutar;
            form.muhasebeDurum.value = rec.durum;
            form.odemeTuru.value = rec.odemeTuru;
            const modal = new bootstrap.Modal(document.getElementById('muhasebeModal'));
            modal.show();
          }
        }
      });
    });
  }

  function setupNewButtons() {
    const map = [
      { btn: 'btnYeniAriza', form: 'arizaForm', key: 'arizaIndex' },
      { btn: 'btnYeniBakim', form: 'bakimForm', key: 'bakimIndex' },
      { btn: 'btnYeniTeklif', form: 'teklifForm', key: 'teklifIndex' },
      { btn: 'btnYeniMuhasebe', form: 'muhasebeForm', key: 'muhasebeIndex' }
    ];
    map.forEach(({ btn, form, key }) => {
      const b = document.getElementById(btn);
      const f = document.getElementById(form);
      if (b) b.addEventListener('click', () => {
        editState[key] = null;
        resetForm(f);
      });
    });
    // Reset edit state on modal close
    const keyMap = { ariza: 'arizaIndex', bakim: 'bakimIndex', teklif: 'teklifIndex', muhasebe: 'muhasebeIndex' };
    Object.keys(keyMap).forEach(name => {
      const modalEl = document.getElementById(`${name}Modal`);
      const formEl = document.getElementById(`${name}Form`);
      if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
          editState[keyMap[name]] = null;
          resetForm(formEl);
        });
      }
    });
  }

  function seedIfEmpty() {
    if (state.arizalar.length === 0) {
      state.arizalar = [
        { id: ensureId(), asansorId: '#A-102', binaAdi: 'ABC Plaza', arizaTipi: 'Kapı Arızası', tarih: '2025-08-10 10:45', durum: 'Beklemede', personel: 'Mehmet Yılmaz' },
        { id: ensureId(), asansorId: '#B-210', binaAdi: 'XYZ Rezidans', arizaTipi: 'Motor Sorunu', tarih: '2025-08-11 09:15', durum: 'Acil', personel: 'Ayşe Demir' },
        { id: ensureId(), asansorId: '#C-099', binaAdi: 'Delta İş Merkezi', arizaTipi: 'Hareket Durdurma', tarih: '2025-08-09 14:30', durum: 'Çözüldü', personel: 'Ali Korkmaz' }
      ];
    }
    if (state.bakimlar.length === 0) {
      state.bakimlar = [
        { id: ensureId(), asansorId: '#A-102', binaAdi: 'ABC Plaza', tarih: '2025-08-15', personel: 'Mehmet Yılmaz', durum: 'Planlandı' }
      ];
    }
    if (state.teklifler.length === 0) {
      state.teklifler = [
        { id: ensureId(), no: 'T-2025-001', musteri: 'ABC Holding', tarih: '2025-08-01', durum: 'Beklemede', montajTarihi: '' }
      ];
    }
    if (state.muhasebe.length === 0) {
      state.muhasebe = [
        { id: ensureId(), faturaNo: 'F-1001', musteri: 'XYZ Rezidans', tarih: '2025-08-05', tutar: 12500.5, durum: 'Ödendi', odemeTuru: 'Havale' }
      ];
    }
    saveAll();
  }

  function init() {
    queryCached();
    loadTheme();
    loadAll();
    seedIfEmpty();
    setupSidebar();
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    setupForms();
    setupNewButtons();
    hookFilters();
    setupTableActions();
    rerenderAll();
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

