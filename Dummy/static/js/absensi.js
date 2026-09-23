/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * absensi.js - Daily Attendance Input, Quick Mark, Batch Save via AJAX
 */

let attendanceList = [];

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('attendanceDateInput');
  const searchInput = document.getElementById('searchStudentInput');
  const statusFilter = document.getElementById('filterStatusSelect');
  const markAllHadirBtn = document.getElementById('markAllHadirBtn');
  const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

  // Set default date to today
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Load initial data
  loadAttendanceData();

  // Event Listeners
  if (dateInput) {
    dateInput.addEventListener('change', () => loadAttendanceData());
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => filterAndRenderTable());
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => filterAndRenderTable());
  }

  if (markAllHadirBtn) {
    markAllHadirBtn.addEventListener('click', () => {
      attendanceList.forEach(item => {
        item.status = 'Hadir';
      });
      filterAndRenderTable();
      updateCounterBadges();
      Toast.info('Semua siswa ditandai Hadir.', 'Tandai Cepat');
    });
  }

  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', () => saveAttendance());
  }
});

// ==========================================
// 1. FETCH ATTENDANCE DATA FROM API
// ==========================================
async function loadAttendanceData() {
  const dateInput = document.getElementById('attendanceDateInput');
  const targetDate = dateInput ? dateInput.value : '';

  const tableBody = document.getElementById('attendanceTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
          <p style="margin-top: 8px; color: var(--text-muted);">Memuat daftar siswa...</p>
        </td>
      </tr>
    `;
  }

  const res = await apiRequest(`/api/attendance?date=${targetDate}`);
  if (!res.ok || !res.data.success) {
    Toast.error('Gagal memuat daftar absensi siswa.');
    return;
  }

  attendanceList = res.data.records || [];
  filterAndRenderTable();
  updateCounterBadges();
}

// ==========================================
// 2. FILTER & RENDER TABLE
// ==========================================
function filterAndRenderTable() {
  const search = (document.getElementById('searchStudentInput')?.value || '').trim().toLowerCase();
  const filter = document.getElementById('filterStatusSelect')?.value || '';
  const tableBody = document.getElementById('attendanceTableBody');

  if (!tableBody) return;

  const filtered = attendanceList.filter(item => {
    const matchSearch = !search || 
      item.nama.toLowerCase().includes(search) || 
      item.nis.toLowerCase().includes(search);
    const matchStatus = !filter || item.status === filter;
    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
          <p>Tidak ada data siswa yang cocok dengan kriteria pencarian.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map((item, index) => {
    const isHadir = item.status === 'Hadir';
    const isSakit = item.status === 'Sakit';
    const isIzin = item.status === 'Izin';
    const isAlpa = item.status === 'Alpa';

    const genderBadge = item.jenis_kelamin === 'L'
      ? '<span class="badge badge-gender-l">L</span>'
      : '<span class="badge badge-gender-p">P</span>';

    return `
      <tr data-student-id="${item.student_id}">
        <td style="font-weight: 600; color: var(--text-muted); width: 40px; text-align: center;">${index + 1}</td>
        <td style="font-family: monospace; font-weight: 600; color: var(--accent-cyan); width: 90px;">${escapeHtml(item.nis)}</td>
        <td style="font-weight: 600; color: var(--text-main);">
          ${escapeHtml(item.nama)}
          ${item.is_recorded ? '<span title="Sudah tersimpan di database" style="color: var(--status-hadir); margin-left: 6px; font-size: 0.8rem;"><i class="fas fa-check-circle"></i></span>' : ''}
        </td>
        <td style="width: 50px; text-align: center;">${genderBadge}</td>
        <td style="width: 320px;">
          <div class="status-pill-group">
            <label class="status-pill-opt">
              <input type="radio" name="status_${item.student_id}" value="Hadir" ${isHadir ? 'checked' : ''} onchange="updateItemStatus(${item.student_id}, 'Hadir')">
              <span class="pill-hadir"><i class="fas fa-check"></i> Hadir</span>
            </label>
            <label class="status-pill-opt">
              <input type="radio" name="status_${item.student_id}" value="Sakit" ${isSakit ? 'checked' : ''} onchange="updateItemStatus(${item.student_id}, 'Sakit')">
              <span class="pill-sakit"><i class="fas fa-thermometer-half"></i> Sakit</span>
            </label>
            <label class="status-pill-opt">
              <input type="radio" name="status_${item.student_id}" value="Izin" ${isIzin ? 'checked' : ''} onchange="updateItemStatus(${item.student_id}, 'Izin')">
              <span class="pill-izin"><i class="fas fa-envelope-open-text"></i> Izin</span>
            </label>
            <label class="status-pill-opt">
              <input type="radio" name="status_${item.student_id}" value="Alpa" ${isAlpa ? 'checked' : ''} onchange="updateItemStatus(${item.student_id}, 'Alpa')">
              <span class="pill-alpa"><i class="fas fa-times"></i> Alpa</span>
            </label>
          </div>
        </td>
        <td>
          <input 
            type="text" 
            class="form-control" 
            style="padding: 6px 10px; font-size: 0.82rem;" 
            placeholder="Keterangan..." 
            value="${escapeHtml(item.keterangan || '')}"
            onchange="updateItemKeterangan(${item.student_id}, this.value)"
          >
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted); width: 80px; text-align: center;">
          ${escapeHtml(item.waktu_absen || '-')}
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 3. STATUS & KETERANGAN UPDATE HANDLERS
// ==========================================
function updateItemStatus(studentId, newStatus) {
  const item = attendanceList.find(s => s.student_id === studentId);
  if (item) {
    item.status = newStatus;
    updateCounterBadges();
  }
}

function updateItemKeterangan(studentId, note) {
  const item = attendanceList.find(s => s.student_id === studentId);
  if (item) {
    item.keterangan = note.trim();
  }
}

function updateCounterBadges() {
  const total = attendanceList.length;
  const hadir = attendanceList.filter(s => s.status === 'Hadir').length;
  const sakit = attendanceList.filter(s => s.status === 'Sakit').length;
  const izin = attendanceList.filter(s => s.status === 'Izin').length;
  const alpa = attendanceList.filter(s => s.status === 'Alpa').length;

  const countHadir = document.getElementById('countHadirBadge');
  const countSakit = document.getElementById('countSakitBadge');
  const countIzin = document.getElementById('countIzinBadge');
  const countAlpa = document.getElementById('countAlpaBadge');
  const countTotal = document.getElementById('countTotalBadge');

  if (countHadir) countHadir.textContent = hadir;
  if (countSakit) countSakit.textContent = sakit;
  if (countIzin) countIzin.textContent = izin;
  if (countAlpa) countAlpa.textContent = alpa;
  if (countTotal) countTotal.textContent = total;
}

// ==========================================
// 4. SAVE ATTENDANCE BATCH VIA AJAX
// ==========================================
async function saveAttendance() {
  const dateInput = document.getElementById('attendanceDateInput');
  const targetDate = dateInput ? dateInput.value : '';
  const saveBtn = document.getElementById('saveAttendanceBtn');

  if (!targetDate) {
    Toast.warning('Pilih tanggal absensi terlebih dahulu!');
    return;
  }

  if (attendanceList.length === 0) {
    Toast.warning('Tidak ada siswa untuk diabsen.');
    return;
  }

  const payload = {
    date: targetDate,
    records: attendanceList.map(item => ({
      student_id: item.student_id,
      status: item.status,
      keterangan: item.keterangan || ''
    }))
  };

  // Loading state
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan Absensi...';
  }

  const res = await apiRequest('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Absensi';
  }

  if (res.ok && res.data.success) {
    Toast.success(res.data.message || 'Data absensi berhasil disimpan!');
    // Tandai status bahwa data sudah terekam
    attendanceList.forEach(item => {
      item.is_recorded = true;
    });
    filterAndRenderTable();
  } else {
    Toast.error(res.data.message || 'Gagal menyimpan absensi.');
  }
}
