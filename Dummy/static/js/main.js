/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * main.js - Core UI Utilities, Clock, Theme, Sidebar, Toast System
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDigitalClock();
  initSidebarMobile();
});

// ==========================================
// 1. THEME TOGGLE (Dark / Light Mode)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('absensi_theme') || 'dark';
  applyTheme(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('absensi_theme', newTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
    themeBtn.title = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
  }
}

// ==========================================
// 2. LIVE DIGITAL CLOCK (WIB)
// ==========================================
function initDigitalClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s} WIB`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ==========================================
// 3. RESPONSIVE SIDEBAR MOBILE TOGGLE
// ==========================================
function initSidebarMobile() {
  const toggleBtn = document.getElementById('menuToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active');
  });

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }
}

// ==========================================
// 4. TOAST NOTIFICATION SYSTEM
// ==========================================
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message, type = 'info', duration = 3500) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message, title = 'Berhasil') {
    this.show(title, message, 'success');
  },

  error(message, title = 'Terjadi Kesalahan') {
    this.show(title, message, 'error', 4500);
  },

  warning(message, title = 'Peringatan') {
    this.show(title, message, 'warning');
  },

  info(message, title = 'Informasi') {
    this.show(title, message, 'info');
  }
};

// ==========================================
// 5. API REQUEST HELPER (Fetch Wrapper)
// ==========================================
async function apiRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Ambil CSRF Token jika ada
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    defaultHeaders['X-CSRFToken'] = csrfMeta.getAttribute('content');
  }

  options.headers = {
    ...defaultHeaders,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('Fetch error:', err);
    return {
      ok: false,
      status: 500,
      data: { success: false, message: 'Gagal terhubung ke server. Periksa koneksi Anda.' }
    };
  }
}

// Utility: Escape HTML untuk mencegah XSS
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
