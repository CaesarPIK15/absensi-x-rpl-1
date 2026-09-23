/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * riwayat.js - Attendance History Log with Date Range, Status Filters & Pagination
 */

let currentPage = 1;
const perPage = 30;

document.addEventListener('DOMContentLoaded', () => {
  loadHistory(1);

  const filterForm = document.getElementById('historyFilterForm');
  const resetBtn = document.getElementById('resetHistoryFilterBtn');

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadHistory(1);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (filterForm) filterForm.reset();
      loadHistory(1);
    });
  }
});

async function loadHistory(page = 1) {
  currentPage = page;
  const startDate = document.getElementById('historyStartDate')?.value || '';
  const endDate = document.getElementById('historyEndDate')?.value || '';
  const status = document.getElementById('historyStatusFilter')?.value || '';
  const search = document.getElementById('historySearchInput')?.value || '';

  const tableBody = document.getElementById('historyTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
          <p style="margin-top: 8px; color: var(--text-muted);">Memuat riwayat absensi...</p>
        </td>
      </tr>
    `;
  }

  const queryParams = new URLSearchParams({
    page: page,
    per_page: perPage,
    start_date: startDate,
    end_date: endDate,
    status: status,
    search: search
  });

  const res = await apiRequest(`/api/attendance/history?${queryParams.toString()}`);
  if (!res.ok || !res.data.success) {
    Toast.error('Gagal memuat log riwayat absensi.');
    return;
  }

  const d = res.data;
  renderHistoryTable(d.records);
  renderPagination(d.page, d.total_pages, d.total);
}

function renderHistoryTable(records) {
  const tableBody = document.getElementById('historyTableBody');
  if (!tableBody) return;

  if (!records || records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i class="fas fa-history" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
          <p>Tidak ditemukan data riwayat absensi untuk filter ini.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.map(r => {
    let badgeClass = 'badge-hadir';
    let iconClass = 'fa-check';

    if (r.status === 'Sakit') { badgeClass = 'badge-sakit'; iconClass = 'fa-thermometer-half'; }
    else if (r.status === 'Izin') { badgeClass = 'badge-izin'; iconClass = 'fa-envelope-open-text'; }
    else if (r.status === 'Alpa') { badgeClass = 'badge-alpa'; iconClass = 'fa-times'; }

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 600; color: var(--text-main);">${escapeHtml(r.tanggal)}</td>
        <td style="font-family: monospace; font-weight: 600; color: var(--accent-cyan);">${escapeHtml(r.nis || '-')}</td>
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(r.nama || '-')}</td>
        <td><span class="badge ${badgeClass}"><i class="fas ${iconClass}"></i> ${escapeHtml(r.status)}</span></td>
        <td style="color: var(--text-secondary); font-size: 0.85rem;">${escapeHtml(r.keterangan || '-')}</td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(r.waktu_absen)}</td>
        <td><span class="badge" style="background-color: var(--bg-card);">${escapeHtml(r.created_by)}</span></td>
      </tr>
    `;
  }).join('');
}

function renderPagination(page, totalPages, totalCount) {
  const container = document.getElementById('historyPagination');
  const countEl = document.getElementById('historyTotalCount');

  if (countEl) countEl.textContent = `Total: ${totalCount} rekaman`;
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center;">
      <button class="btn btn-secondary btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="loadHistory(${page - 1})">
        <i class="fas fa-chevron-left"></i> Sebelumnya
      </button>
      <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
        Halaman ${page} dari ${totalPages}
      </span>
      <button class="btn btn-secondary btn-sm" ${page >= totalPages ? 'disabled' : ''} onclick="loadHistory(${page + 1})">
        Selanjutnya <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}
