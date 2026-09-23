/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * siswa.js - Student Management, CRUD Modals, CSV Import
 */

let studentsList = [];
let studentToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();

  const searchInput = document.getElementById('searchStudentInput');
  const genderFilter = document.getElementById('filterGenderSelect');

  if (searchInput) {
    searchInput.addEventListener('input', () => filterAndRenderStudents());
  }

  if (genderFilter) {
    genderFilter.addEventListener('change', () => filterAndRenderStudents());
  }

  // Modal Triggers
  initStudentModals();
});

// ==========================================
// 1. LOAD STUDENTS FROM API
// ==========================================
async function loadStudents() {
  const tableBody = document.getElementById('studentsTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
          <p style="margin-top: 8px; color: var(--text-muted);">Memuat data siswa...</p>
        </td>
      </tr>
    `;
  }

  const res = await apiRequest('/api/students');
  if (!res.ok || !res.data.success) {
    Toast.error('Gagal memuat data siswa.');
    return;
  }

  studentsList = res.data.students || [];
  filterAndRenderStudents();
  updateStudentStats();
}

// ==========================================
// 2. FILTER & RENDER STUDENTS
// ==========================================
function filterAndRenderStudents() {
  const search = (document.getElementById('searchStudentInput')?.value || '').trim().toLowerCase();
  const gender = document.getElementById('filterGenderSelect')?.value || '';
  const tableBody = document.getElementById('studentsTableBody');
  const isWali = document.body.getAttribute('data-role') === 'wali_kelas';

  if (!tableBody) return;

  const filtered = studentsList.filter(s => {
    const matchSearch = !search || s.nama.toLowerCase().includes(search) || s.nis.toLowerCase().includes(search);
    const matchGender = !gender || s.jenis_kelamin === gender;
    return matchSearch && matchGender;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i class="fas fa-user-slash" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
          <p>Tidak ada data siswa yang sesuai.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map((s, idx) => {
    const genderBadge = s.jenis_kelamin === 'L'
      ? '<span class="badge badge-gender-l"><i class="fas fa-mars"></i> Laki-laki</span>'
      : '<span class="badge badge-gender-p"><i class="fas fa-venus"></i> Perempuan</span>';

    const actionButtons = isWali ? `
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${s.id})" title="Edit Siswa">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteStudent(${s.id}, '${escapeHtml(s.nama)}')" title="Hapus Siswa">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    ` : '<span style="font-size: 0.78rem; color: var(--text-muted);">View-only</span>';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted); width: 40px; text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 600; color: var(--accent-cyan);">${escapeHtml(s.nis)}</td>
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(s.nama)}</td>
        <td>${genderBadge}</td>
        <td><span class="badge" style="background-color: var(--bg-card);">${escapeHtml(s.kelas)}</span></td>
        <td style="width: 120px;">${actionButtons}</td>
      </tr>
    `;
  }).join('');
}

function updateStudentStats() {
  const total = studentsList.length;
  const laki = studentsList.filter(s => s.jenis_kelamin === 'L').length;
  const perem = studentsList.filter(s => s.jenis_kelamin === 'P').length;

  const totalEl = document.getElementById('totalStudentBadge');
  const lakiEl = document.getElementById('totalLakiBadge');
  const peremEl = document.getElementById('totalPeremBadge');

  if (totalEl) totalEl.textContent = total;
  if (lakiEl) lakiEl.textContent = laki;
  if (peremEl) peremEl.textContent = perem;
}

// ==========================================
// 3. MODALS (Add, Edit, Delete, CSV Import)
// ==========================================
function initStudentModals() {
  // Add Student Form
  const addForm = document.getElementById('addStudentForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nis = document.getElementById('addNis').value.trim();
      const nama = document.getElementById('addNama').value.trim();
      const jenis_kelamin = document.getElementById('addJenisKelamin').value;
      const kelas = document.getElementById('addKelas').value.trim() || 'X RPL 1';

      const res = await apiRequest('/api/students', {
        method: 'POST',
        body: JSON.stringify({ nis, nama, jenis_kelamin, kelas })
      });

      if (res.ok && res.data.success) {
        Toast.success(res.data.message || 'Siswa berhasil ditambahkan!');
        closeModal('addStudentModal');
        addForm.reset();
        loadStudents();
      } else {
        Toast.error(res.data.message || 'Gagal menambahkan siswa.');
      }
    });
  }

  // Edit Student Form
  const editForm = document.getElementById('editStudentForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editStudentId').value;
      const nis = document.getElementById('editNis').value.trim();
      const nama = document.getElementById('editNama').value.trim();
      const jenis_kelamin = document.getElementById('editJenisKelamin').value;
      const kelas = document.getElementById('editKelas').value.trim();

      const res = await apiRequest(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nis, nama, jenis_kelamin, kelas })
      });

      if (res.ok && res.data.success) {
        Toast.success(res.data.message || 'Data siswa berhasil diperbarui!');
        closeModal('editStudentModal');
        loadStudents();
      } else {
        Toast.error(res.data.message || 'Gagal memperbarui data siswa.');
      }
    });
  }

  // CSV Import Form
  const csvForm = document.getElementById('importCsvForm');
  if (csvForm) {
    csvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('csvFileInput');
      if (!fileInput || !fileInput.files[0]) {
        Toast.warning('Pilih file CSV terlebih dahulu!');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const submitBtn = csvForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengimpor...';
      }

      try {
        const res = await fetch('/api/students/import-csv', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-upload"></i> Unggah & Impor';
        }

        if (res.ok && data.success) {
          Toast.success(data.message || 'Import data siswa selesai!');
          closeModal('importCsvModal');
          csvForm.reset();
          loadStudents();
        } else {
          Toast.error(data.message || 'Gagal mengimpor file CSV.');
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-upload"></i> Unggah & Impor';
        }
        Toast.error('Terjadi kesalahan saat mengunggah file.');
      }
    });
  }
}

function openEditModal(studentId) {
  const s = studentsList.find(item => item.id === studentId);
  if (!s) return;

  document.getElementById('editStudentId').value = s.id;
  document.getElementById('editNis').value = s.nis;
  document.getElementById('editNama').value = s.nama;
  document.getElementById('editJenisKelamin').value = s.jenis_kelamin;
  document.getElementById('editKelas').value = s.kelas;

  openModal('editStudentModal');
}

function confirmDeleteStudent(studentId, studentNama) {
  studentToDeleteId = studentId;
  const targetEl = document.getElementById('deleteStudentNameTarget');
  if (targetEl) targetEl.textContent = studentNama;
  openModal('deleteConfirmModal');
}

async function executeDeleteStudent() {
  if (!studentToDeleteId) return;

  const res = await apiRequest(`/api/students/${studentToDeleteId}`, {
    method: 'DELETE'
  });

  if (res.ok && res.data.success) {
    Toast.success(res.data.message || 'Siswa berhasil dihapus.');
    closeModal('deleteConfirmModal');
    studentToDeleteId = null;
    loadStudents();
  } else {
    Toast.error(res.data.message || 'Gagal menghapus siswa.');
  }
}

// Modal Helper Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}
