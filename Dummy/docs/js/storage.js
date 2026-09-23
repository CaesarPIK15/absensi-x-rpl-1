/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * storage.js - LocalStorage Database Engine untuk GitHub Pages (Serverless)
 */

const AbsensiDB = {
  KEYS: {
    USERS: 'xrpl1_users',
    STUDENTS: 'xrpl1_students',
    ATTENDANCE: 'xrpl1_attendance',
    CURRENT_USER: 'xrpl1_current_user',
    THEME: 'absensi_theme'
  },

  // 1. Inisialisasi Database Lokal & Seeding Data Awal
  init() {
    // Akun default
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const defaultUsers = [
        {
          id: 1,
          username: 'wali_kelas',
          password: 'wali123',
          nama: 'Dra. Hj. Nurul Hidayati, M.Kom',
          role: 'wali_kelas'
        },
        {
          id: 2,
          username: 'ketua_kelas',
          password: 'ketua123',
          nama: 'Ahmad Rizky Pratama',
          role: 'ketua_kelas'
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // 36 Siswa X RPL 1
    if (!localStorage.getItem(this.KEYS.STUDENTS)) {
      const initialStudents = [
        { id: 1, nis: "1001", nama: "Achmad Maulana Yusuf", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 2, nis: "1002", nama: "Adelia Putri Rahmadani", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 3, nis: "1003", nama: "Ahmad Rizky Pratama", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 4, nis: "1004", nama: "Alif Fajar Ramadhan", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 5, nis: "1005", nama: "Amelia Dwi Safitri", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 6, nis: "1006", nama: "Angga Dwi Prasetyo", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 7, nis: "1007", nama: "Annisa Kirana Larasati", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 8, nis: "1008", nama: "Arya Bagus Kurniawan", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 9, nis: "1009", nama: "Bagus Tri Saputra", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 10, nis: "1010", nama: "Bella Amanda Maharani", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 11, nis: "1011", nama: "Bima Sakti Nugraha", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 12, nis: "1012", nama: "Citra Lestari Wulandari", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 13, nis: "1013", nama: "Dimas Arya Wijaya", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 14, nis: "1014", nama: "Dinda Ayu Permatasari", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 15, nis: "1015", nama: "Fajar Hidayatullah", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 16, nis: "1016", nama: "Farhan Eka Saputra", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 17, nis: "1017", nama: "Gita Cahyaningrum", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 18, nis: "1018", nama: "Hafidz Ridwanullah", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 19, nis: "1019", nama: "Ilham Syahputra Pratama", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 20, nis: "1020", nama: "Indah Novitasari", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 21, nis: "1021", nama: "Kevin Danendra", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 22, nis: "1022", nama: "Larasati Dewi Anggraeni", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 23, nis: "1023", nama: "Mochammad Bayu Setiawan", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 24, nis: "1024", nama: "Muhammad Fakhri Haidar", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 25, nis: "1025", nama: "Nabila Syifa Azzahra", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 26, nis: "1026", nama: "Nanda Pratama Putra", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 27, nis: "1027", nama: "Putra Agung Samudra", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 28, nis: "1028", nama: "Rafi Ahmad Fauzan", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 29, nis: "1029", nama: "Ratu Safira Maharani", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 30, nis: "1030", nama: "Rendra Wahyu Santoso", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 31, nis: "1031", nama: "Reza Dwi Cahyono", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 32, nis: "1032", nama: "Rina Dwi Astuti", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 33, nis: "1033", nama: "Rizki Febrianto", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 34, nis: "1034", nama: "Salma Putri Aulia", jenis_kelamin: "P", kelas: "X RPL 1" },
        { id: 35, nis: "1035", nama: "Tegar Surya Pamungkas", jenis_kelamin: "L", kelas: "X RPL 1" },
        { id: 36, nis: "1036", nama: "Zahra Salsabila Putri", jenis_kelamin: "P", kelas: "X RPL 1" }
      ];
      localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(initialStudents));
    }

    // Riwayat Absensi Awal
    if (!localStorage.getItem(this.KEYS.ATTENDANCE)) {
      const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS));
      const today = new Date();
      const attendance = [];

      for (let offset = 4; offset >= 0; offset--) {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekend

        const dateStr = d.toISOString().split('T')[0];
        students.forEach((s, idx) => {
          let status = 'Hadir';
          let ket = '';
          if (idx % 18 === 17) { status = 'Alpa'; ket = 'Tanpa keterangan'; }
          else if (idx % 12 === 11) { status = 'Sakit'; ket = 'Demam dan flu'; }
          else if (idx % 10 === 9) { status = 'Izin'; ket = 'Acara keluarga'; }

          attendance.push({
            id: Date.now() + Math.random(),
            student_id: s.id,
            nis: s.nis,
            nama: s.nama,
            jenis_kelamin: s.jenis_kelamin,
            kelas: s.kelas,
            tanggal: dateStr,
            status: status,
            keterangan: ket,
            waktu_absen: '07:15:00',
            created_by: 'ketua_kelas'
          });
        });
      }
      localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(attendance));
    }
  },

  // 2. Autentikasi & Session
  login(username, password, role) {
    this.init();
    const users = JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return { success: false, message: 'Username atau password salah!' };
    }

    if (role && user.role !== role) {
      return { success: false, message: `Akun ini terdaftar sebagai ${user.role.replace('_', ' ')}, bukan ${role.replace('_', ' ')}!` };
    }

    localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    return { success: true, message: `Selamat datang, ${user.nama}!`, user };
  },

  getCurrentUser() {
    const raw = localStorage.getItem(this.KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    window.location.href = 'index.html';
  },

  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    if (requiredRole && user.role !== requiredRole) {
      alert('Akses Ditolak: Anda tidak memiliki izin untuk halaman ini.');
      window.location.href = 'dashboard.html';
      return false;
    }
    return user;
  },

  // 3. Statistik Dashboard
  getDashboardStats(targetDate = null) {
    this.init();
    if (!targetDate) targetDate = new Date().toISOString().split('T')[0];

    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');

    const todayAtt = attendance.filter(a => a.tanggal === targetDate);
    const hadir = todayAtt.filter(a => a.status === 'Hadir').length;
    const sakit = todayAtt.filter(a => a.status === 'Sakit').length;
    const izin = todayAtt.filter(a => a.status === 'Izin').length;
    const alpa = todayAtt.filter(a => a.status === 'Alpa').length;

    const total = students.length;
    const pct = total > 0 ? Math.round((hadir / total) * 1000) / 10 : 0;

    // 7 Hari Terakhir
    const target = new Date(targetDate);
    const labels = [];
    const chartHadir = [];
    const chartSakit = [];
    const chartIzin = [];
    const chartAlpa = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(target);
      d.setDate(target.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(dLabel);

      const dayAtt = attendance.filter(a => a.tanggal === dStr);
      chartHadir.push(dayAtt.filter(a => a.status === 'Hadir').length);
      chartSakit.push(dayAtt.filter(a => a.status === 'Sakit').length);
      chartIzin.push(dayAtt.filter(a => a.status === 'Izin').length);
      chartAlpa.push(dayAtt.filter(a => a.status === 'Alpa').length);
    }

    const recent = [...attendance].reverse().slice(0, 8);

    return {
      success: true,
      total_students: total,
      hadir,
      sakit,
      izin,
      alpa,
      persentase_hadir: pct,
      chart: {
        labels,
        hadir: chartHadir,
        sakit: chartSakit,
        izin: chartIzin,
        alpa: chartAlpa
      },
      recent_activities: recent
    };
  },

  // 4. Data Siswa
  getStudents(search = '', gender = '') {
    this.init();
    let students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');

    if (search) {
      search = search.toLowerCase();
      students = students.filter(s => s.nama.toLowerCase().includes(search) || s.nis.includes(search));
    }
    if (gender) {
      students = students.filter(s => s.jenis_kelamin === gender);
    }

    return students.sort((a, b) => a.nis.localeCompare(b.nis));
  },

  addStudent(student) {
    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    if (students.some(s => s.nis === student.nis)) {
      return { success: false, message: `NIS ${student.nis} sudah terdaftar!` };
    }
    const newStudent = {
      id: Date.now(),
      nis: student.nis,
      nama: student.nama,
      jenis_kelamin: student.jenis_kelamin,
      kelas: student.kelas || 'X RPL 1'
    };
    students.push(newStudent);
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
    return { success: true, message: `Siswa ${student.nama} berhasil ditambahkan!` };
  },

  updateStudent(id, data) {
    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const idx = students.findIndex(s => s.id === Number(id));
    if (idx === -1) return { success: false, message: 'Siswa tidak ditemukan!' };

    if (students.some(s => s.nis === data.nis && s.id !== Number(id))) {
      return { success: false, message: `NIS ${data.nis} sudah digunakan siswa lain!` };
    }

    students[idx] = { ...students[idx], ...data };
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
    return { success: true, message: `Data siswa ${data.nama} berhasil diperbarui!` };
  },

  deleteStudent(id) {
    let students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const s = students.find(item => item.id === Number(id));
    students = students.filter(item => item.id !== Number(id));
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));

    // Hapus juga absensinya
    let att = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');
    att = att.filter(a => a.student_id !== Number(id));
    localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(att));

    return { success: true, message: `Siswa ${s ? s.nama : ''} berhasil dihapus.` };
  },

  // 5. Absensi Harian
  getDailyAttendance(targetDate) {
    this.init();
    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');

    const attMap = {};
    attendance.filter(a => a.tanggal === targetDate).forEach(a => {
      attMap[a.student_id] = a;
    });

    return students.map(s => {
      const recorded = attMap[s.id];
      return {
        student_id: s.id,
        nis: s.nis,
        nama: s.nama,
        jenis_kelamin: s.jenis_kelamin,
        kelas: s.kelas,
        tanggal: targetDate,
        status: recorded ? recorded.status : 'Hadir',
        is_recorded: !!recorded,
        keterangan: recorded ? recorded.keterangan : '',
        waktu_absen: recorded ? recorded.waktu_absen : '-'
      };
    });
  },

  saveAttendance(targetDate, records) {
    let attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');
    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const user = this.getCurrentUser();
    const nowTime = new Date().toTimeString().split(' ')[0];

    const stMap = {};
    students.forEach(s => stMap[s.id] = s);

    // Hapus data tanggal ini untuk siswa yang di-update (mencegah duplikasi)
    const updateIds = new Set(records.map(r => r.student_id));
    attendance = attendance.filter(a => !(a.tanggal === targetDate && updateIds.has(a.student_id)));

    records.forEach(r => {
      const s = stMap[r.student_id];
      if (s) {
        attendance.push({
          id: Date.now() + Math.random(),
          student_id: s.id,
          nis: s.nis,
          nama: s.nama,
          jenis_kelamin: s.jenis_kelamin,
          kelas: s.kelas,
          tanggal: targetDate,
          status: r.status,
          keterangan: r.keterangan || '',
          waktu_absen: nowTime,
          created_by: user ? user.username : 'ketua_kelas'
        });
      }
    });

    localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(attendance));
    return { success: true, message: `Absensi tanggal ${targetDate} berhasil disimpan!` };
  },

  // 6. Laporan Rekapitulasi
  getReports(startDate, endDate) {
    this.init();
    const students = JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    const attendance = JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');

    const periodAtt = attendance.filter(a => a.tanggal >= startDate && a.tanggal <= endDate);

    let sumHadir = 0, sumSakit = 0, sumIzin = 0, sumAlpa = 0;

    const recap = students.map(s => {
      const sAtt = periodAtt.filter(a => a.student_id === s.id);
      const h = sAtt.filter(a => a.status === 'Hadir').length;
      const sk = sAtt.filter(a => a.status === 'Sakit').length;
      const iz = sAtt.filter(a => a.status === 'Izin').length;
      const alp = sAtt.filter(a => a.status === 'Alpa').length;
      const total = h + sk + iz + alp;
      const pct = total > 0 ? Math.round((h / total) * 1000) / 10 : 0;

      sumHadir += h;
      sumSakit += sk;
      sumIzin += iz;
      sumAlpa += alp;

      return {
        student_id: s.id,
        nis: s.nis,
        nama: s.nama,
        jenis_kelamin: s.jenis_kelamin,
        hadir: h,
        sakit: sk,
        izin: iz,
        alpa: alp,
        total_hari: total,
        persentase: pct
      };
    });

    return {
      start_date: startDate,
      end_date: endDate,
      summary: { hadir: sumHadir, sakit: sumSakit, izin: sumIzin, alpa: sumAlpa },
      students_recap: recap
    };
  }
};

// Inisialisasi awal
AbsensiDB.init();
