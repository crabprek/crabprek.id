/* ==========================================================================
   CRABPREK JAVASCRIPT ENGINE — FULL + FINANCIAL MODULE
   ========================================================================== */

// 🔗 GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT MILIKMU
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxNhu-OOG7JwZZw5rQ0ikluzFTZH6hxnlnCksejbXfRi_QcYfvLw5ZgqOdZqC6aeFo/exec";

const BACKUP_KEY = 'crabprek_backup';
const CSV_COLUMNS = [
  'timestamp', 'action', 'nama', 'prd', 'varian', 'qty',
  'statusBayar', 'metode', 'kategori', 'uraian', 'nominal',
  'keterangan', 'porsi'
];

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 🧩 UTILITY: Toast Notification
  // =========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  // =========================================================================
  // 🧩 UTILITY: LocalStorage Backup System
  // =========================================================================
  function getBackups() {
    try { return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); }
    catch { return []; }
  }

  function setBackups(list) {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
  }

  function saveBackup(payload) {
    const list = getBackups();
    list.push({ ...payload, timestamp: payload.timestamp || new Date().toISOString() });
    setBackups(list);
    renderBackupList();
  }

  function removeBackupAt(index) {
    const list = getBackups();
    list.splice(index, 1);
    setBackups(list);
    renderBackupList();
  }

  function clearAllBackups() {
    if (!confirm('Hapus semua data backup di browser ini?')) return;
    setBackups([]);
    renderBackupList();
    showToast('🗑️ Semua backup telah dihapus.', 'info');
  }

  // =========================================================================
  // 🧩 UTILITY: Send to Google Apps Script
  // =========================================================================
  async function sendToScript(payload, { silent = false } = {}) {
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* allow non-JSON */ }

      if (data && data.status === 'error') {
        throw new Error(data.message || 'Server menolak data');
      }

      if (!silent) showToast('✅ Data berhasil dikirim ke server.', 'success');
      return { success: true, data };
    } catch (err) {
      console.error('[Crabprek] Gagal kirim:', err, payload);
      saveBackup(payload);
      if (!silent) {
        showToast('⚠️ Koneksi gagal. Data disimpan ke backup lokal.', 'warning');
      }
      return { success: false, error: err.message };
    }
  }

  // =========================================================================
  // 🧩 UTILITY: Download CSV
  // =========================================================================
  function downloadBackupCSV() {
    const backups = getBackups();
    if (backups.length === 0) {
      showToast('ℹ️ Tidak ada data backup untuk diunduh.', 'info');
      return;
    }

    const escapeCSV = (val) => {
      const s = String(val ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = CSV_COLUMNS.join(',');
    const rows = backups.map(b =>
      CSV_COLUMNS.map(col => escapeCSV(b[col])).join(',')
    );
    const csv = [header, ...rows].join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crabprek-backup-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`✅ CSV berhasil diunduh (${backups.length} entri).`, 'success');
  }

  // =========================================================================
  // 🧩 UTILITY: Render backup list
  // =========================================================================
  function renderBackupList() {
    const container = document.getElementById('backup-list');
    if (!container) return;
    const backups = getBackups();

    if (backups.length === 0) {
      container.innerHTML = '<div class="empty-cart-msg">Belum ada backup tersimpan.</div>';
      return;
    }

    container.innerHTML = backups.map((b, i) => {
      const time = new Date(b.timestamp).toLocaleString('id-ID');
      let desc = '';
      if (b.action === 'order') desc = `${b.nama} • ${b.varian} ×${b.qty} • ${b.statusBayar} • ${b.metode}`;
      else if (b.action === 'expense') desc = `${b.kategori} • ${b.uraian} • Rp ${Number(b.nominal || 0).toLocaleString('id-ID')}`;
      else if (b.action === 'production') desc = `${b.keterangan} • ${b.porsi} porsi`;
      else desc = JSON.stringify(b).slice(0, 100);

      return `
        <div class="backup-item">
          <div class="backup-info">
            <div class="backup-time">${time}</div>
            <div class="backup-type">${b.action || 'unknown'}</div>
            <div class="backup-desc">${desc}</div>
          </div>
          <button type="button" class="backup-del" data-idx="${i}" aria-label="Hapus backup">✕</button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.backup-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        removeBackupAt(idx);
      });
    });
  }

  // =========================================================================
  // 1. CUSTOM CURSOR TRAIL ENGINE (existing)
  // =========================================================================
  const trailCanvas = document.getElementById('trail-canvas');
  if (trailCanvas) {
    const tCtx = trailCanvas.getContext('2d');
    let tWidth = trailCanvas.width = window.innerWidth;
    let tHeight = trailCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      tWidth = trailCanvas.width = window.innerWidth;
      tHeight = trailCanvas.height = window.innerHeight;
    });

    const particles = [];
    const trailColors = ['#FF4038', '#FF8A24', '#D7F34A'];

    const addParticle = (x, y) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (particles.length > 42) particles.shift();
      particles.push({
        x, y, size: Math.random() * 5.5 + 2.5, alpha: 1,
        color: trailColors[Math.floor(Math.random() * trailColors.length)],
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 - 1
      });
    };

    window.addEventListener('mousemove', (e) => addParticle(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) addParticle(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchstart', (e) => { if (e.touches.length > 0) addParticle(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

    const animateTrail = () => {
      tCtx.clearRect(0, 0, tWidth, tHeight);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.025;
        if (p.alpha > 0) {
          tCtx.save();
          tCtx.globalAlpha = p.alpha;
          tCtx.fillStyle = p.color;
          tCtx.shadowBlur = 10;
          tCtx.shadowColor = p.color;
          tCtx.beginPath();
          tCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          tCtx.fill();
          tCtx.restore();
        }
      }
      requestAnimationFrame(animateTrail);
    };
    animateTrail();
  }

  // =========================================================================
  // 2. HERO CANVAS 3D ENGINE (existing)
  // =========================================================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    let canvasPointerX = -9999, canvasPointerY = -9999;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();

    const updatePointerPos = (clientX, clientY) => {
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
      const rect = canvas.getBoundingClientRect();
      canvasPointerX = clientX - rect.left;
      canvasPointerY = clientY - rect.top;
      targetMouseX = (clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', (e) => updatePointerPos(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => { if (e.touches.length > 0)