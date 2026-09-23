/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * laporan.js - Attendance Reports, Summary Recaps, Print & CSV Export
 */

let currentReportData = null;

document.addEventListener('DOMContentLoaded', () => {
  // Set default filter to bulanan
  setPeriodType('bulanan');

  const periodSelect = document.getElementById('reportPeriodType');
  if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
      setPeriodType(e.target.value);
    });
  }

  const generateBtn = document.getElementById('generateReportBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => loadReport());
  }

  const printBtn = document.getElementById('printReportBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportCsv());
  }
});

function setPeriodType(type) {
  const customRangeGroup = document.getElementById('customDateRangeGroup');
  const startDateInput = document.getElementById('reportStartDate');
  const endDateInput = document.getElementById('reportEndDate');
  const today = new Date();

  const formatDate = (d) => d.toISOString().split('T')[0];

  if (type === 'harian') {
    if (customRangeGroup) customRangeGroup.style.display = 'none';
    if (startDateInput) startDateInput.value = formatDate(today);
    if (endDateInput) endDateInput.value = formatDate(today);
  } else if (type === 'mingguan') {
    if (customRangeGroup) customRangeGroup.style.display = 'none';
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);
    if (startDateInput) startDateInput.value = formatDate(lastWeek);
    if (endDateInput) endDateInput.value = formatDate(today);
  } else if (type === 'bulanan') {
    if (customRangeGroup) customRangeGroup.style.display = 'none';
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    if (startDateInput) startDateInput.value = formatDate(firstDay);
    if (endDateInput) endDateInput.value = formatDate(today);
  } else {
    // Custom
    if (customRangeGroup) customRangeGroup.style.display = 'flex';
  }

  loadReport();
}

async function loadReport() {
  const type = document.getElementById('reportPeriodType')?.value || 'bulanan';
  const startDate = document.getElementById('reportStartDate')?.value || '';
  const endDate = document.getElementById('reportEndDate')?.value || '';

  const tableBody = document.getElementById('reportTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
          <p style="margin-top: 8px; color: var(--text-muted);">Menghitung rekapitulasi data...</p>
        </td>
      </tr>
    `;
  }

  const res = await apiRequest(`/api/reports?type=${type}&start_date=${startDate}&end_date=${endDate}`);
  if (!res.ok || !res.data.success) {
    Toast.error('Gagal menghitung laporan absensi.');
    return;
  }

  currentReportData = res.data;
  renderReport(res.data);
}

function renderReport(data) {
  const tableBody = document.getElementById('reportTableBody');
  const printPeriodText = document.getElementById('printPeriodText');
  const recapPeriodText = document.getElementById('recapPeriodText');

  const periodLabel = `${data.start_date} s.d. ${data.end_date}`;
  if (printPeriodText) printPeriodText.textContent = `Periode: ${periodLabel}`;
  if (recapPeriodText) recapPeriodText.textContent = periodLabel;

  // Update Summary Boxes
  const s = data.summary || {};
  document.getElementById('sumHadir').textContent = s.hadir || 0;
  document.getElementById('sumSakit').textContent = s.sakit || 0;
  document.getElementById('sumIzin').textContent = s.izin || 0;
  document.getElementById('sumAlpa').textContent = s.alpa || 0;

  const list = data.students_recap || [];
  if (!tableBody) return;

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <p>Belum ada data absensi pada periode yang dipilih.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = list.map((item, idx) => {
    let pctColor = 'var(--status-hadir)';
    if (item.persentase < 75) pctColor = 'var(--status-alpa)';
    else if (item.persentase < 85) pctColor = 'var(--status-sakit)';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted); width: 40px; text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 600; color: var(--accent-cyan);">${escapeHtml(item.nis)}</td>
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(item.nama)}</td>
        <td style="text-align: center;">${item.jenis_kelamin}</td>
        <td style="text-align: center; font-weight: 600; color: var(--status-hadir);">${item.hadir}</td>
        <td style="text-align: center; font-weight: 600; color: var(--status-sakit);">${item.sakit}</td>
        <td style="text-align: center; font-weight: 600; color: var(--status-izin);">${item.izin}</td>
        <td style="text-align: center; font-weight: 600; color: var(--status-alpa);">${item.alpa}</td>
        <td style="text-align: center; font-weight: 700; color: ${pctColor};">
          ${item.persentase}%
        </td>
      </tr>
    `;
  }).join('');
}

function exportCsv() {
  const startDate = document.getElementById('reportStartDate')?.value || '';
  const endDate = document.getElementById('reportEndDate')?.value || '';
  window.location.href = `/api/reports/export-csv?start_date=${startDate}&end_date=${endDate}`;
  Toast.success('Mengunduh file laporan CSV...', 'Export Selesai');
}
