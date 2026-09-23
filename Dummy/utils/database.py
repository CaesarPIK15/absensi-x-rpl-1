import os
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

class User(db.Model):
    """Model Pengguna (Wali Kelas dan Ketua Kelas)."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'wali_kelas' atau 'ketua_kelas'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nama': self.nama,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Student(db.Model):
    """Model Siswa Kelas X RPL 1."""
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    nis = db.Column(db.String(20), unique=True, nullable=False, index=True)
    nama = db.Column(db.String(100), nullable=False)
    jenis_kelamin = db.Column(db.String(1), nullable=False)  # 'L' atau 'P'
    kelas = db.Column(db.String(20), default='X RPL 1', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attendances = db.relationship('Attendance', backref='student', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nis': self.nis,
            'nama': self.nama,
            'jenis_kelamin': self.jenis_kelamin,
            'kelas': self.kelas,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Attendance(db.Model):
    """Model Absensi Siswa Harian."""
    __tablename__ = 'attendance'
    __table_args__ = (
        db.UniqueConstraint('student_id', 'tanggal', name='unique_student_date'),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    tanggal = db.Column(db.String(10), nullable=False, index=True)  # Format: YYYY-MM-DD
    status = db.Column(db.String(10), nullable=False)  # 'Hadir', 'Sakit', 'Izin', 'Alpa'
    keterangan = db.Column(db.String(255), default='', nullable=True)
    waktu_absen = db.Column(db.String(8), nullable=False)  # Format: HH:MM:SS
    created_by = db.Column(db.String(50), nullable=True)  # Username pencatat absensi

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'nis': self.student.nis if self.student else None,
            'nama': self.student.nama if self.student else None,
            'jenis_kelamin': self.student.jenis_kelamin if self.student else None,
            'kelas': self.student.kelas if self.student else None,
            'tanggal': self.tanggal,
            'status': self.status,
            'keterangan': self.keterangan or '',
            'waktu_absen': self.waktu_absen,
            'created_by': self.created_by or '-'
        }

def init_db(app):
    """Inisialisasi database dan seeding data awal."""
    os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_default_data()

def seed_default_data():
    """Mengisi database dengan akun testing dan 36 siswa awal jika masih kosong."""
    # 1. Inisialisasi Akun Default
    if User.query.count() == 0:
        default_users = [
            User(
                username='wali_kelas',
                password_hash=generate_password_hash('wali123'),
                nama='Dra. Hj. Nurul Hidayati, M.Kom',
                role='wali_kelas'
            ),
            User(
                username='ketua_kelas',
                password_hash=generate_password_hash('ketua123'),
                nama='Ahmad Rizky Pratama',
                role='ketua_kelas'
            )
        ]
        db.session.add_all(default_users)
        db.session.commit()
        print("[DATABASE] Berhasil membuat akun default: wali_kelas & ketua_kelas")

    # 2. Inisialisasi 36 Siswa Kelas X RPL 1
    if Student.query.count() == 0:
        # Data Siswa Kelas X RPL 1 SMKN 1 Probolinggo
        # Catatan: Data dummy ini dapat diedit atau ditambah dengan data riil kelas
        initial_students = [
            ("1001", "Achmad Maulana Yusuf", "L"),
            ("1002", "Adelia Putri Rahmadani", "P"),
            ("1003", "Ahmad Rizky Pratama", "L"),
            ("1004", "Alif Fajar Ramadhan", "L"),
            ("1005", "Amelia Dwi Safitri", "P"),
            ("1006", "Angga Dwi Prasetyo", "L"),
            ("1007", "Annisa Kirana Larasati", "P"),
            ("1008", "Arya Bagus Kurniawan", "L"),
            ("1009", "Bagus Tri Saputra", "L"),
            ("1010", "Bella Amanda Maharani", "P"),
            ("1011", "Bima Sakti Nugraha", "L"),
            ("1012", "Citra Lestari Wulandari", "P"),
            ("1013", "Dimas Arya Wijaya", "L"),
            ("1014", "Dinda Ayu Permatasari", "P"),
            ("1015", "Fajar Hidayatullah", "L"),
            ("1016", "Farhan Eka Saputra", "L"),
            ("1017", "Gita Cahyaningrum", "P"),
            ("1018", "Hafidz Ridwanullah", "L"),
            ("1019", "Ilham Syahputra Pratama", "L"),
            ("1020", "Indah Novitasari", "P"),
            ("1021", "Kevin Danendra", "L"),
            ("1022", "Larasati Dewi Anggraeni", "P"),
            ("1023", "Mochammad Bayu Setiawan", "L"),
            ("1024", "Muhammad Fakhri Haidar", "L"),
            ("1025", "Nabila Syifa Azzahra", "P"),
            ("1026", "Nanda Pratama Putra", "L"),
            ("1027", "Putra Agung Samudra", "L"),
            ("1028", "Rafi Ahmad Fauzan", "L"),
            ("1029", "Ratu Safira Maharani", "P"),
            ("1030", "Rendra Wahyu Santoso", "L"),
            ("1031", "Reza Dwi Cahyono", "L"),
            ("1032", "Rina Dwi Astuti", "P"),
            ("1033", "Rizki Febrianto", "L"),
            ("1034", "Salma Putri Aulia", "P"),
            ("1035", "Tegar Surya Pamungkas", "L"),
            ("1036", "Zahra Salsabila Putri", "P")
        ]

        students_objs = [
            Student(nis=nis, nama=nama, jenis_kelamin=jk, kelas='X RPL 1')
            for nis, nama, jk in initial_students
        ]
        db.session.add_all(students_objs)
        db.session.commit()
        print(f"[DATABASE] Berhasil mendaftarkan {len(students_objs)} siswa X RPL 1")

        # 3. Inisialisasi Data Absensi Contoh (Hari ini dan beberapa hari sebelumnya)
        # Agar dashboard, grafik, dan laporan langsung memiliki data visual
        all_students = Student.query.all()
        today = date.today()

        # Generate absensi untuk 4 hari sebelumnya hingga hari ini
        for day_offset in range(4, -1, -1):
            curr_date = today - timedelta(days=day_offset)
            # Lewati hari libur (Sabtu & Minggu)
            if curr_date.weekday() >= 5:
                continue

            date_str = curr_date.strftime('%Y-%m-%d')
            for i, st in enumerate(all_students):
                # Variasikan status untuk data simulasi realistis
                if i % 18 == 17:
                    status = 'Alpa'
                    ket = 'Tanpa keterangan'
                elif i % 12 == 11:
                    status = 'Sakit'
                    ket = 'Demam dan flu'
                elif i % 10 == 9:
                    status = 'Izin'
                    ket = 'Acara keluarga'
                else:
                    status = 'Hadir'
                    ket = ''

                att = Attendance(
                    student_id=st.id,
                    tanggal=date_str,
                    status=status,
                    keterangan=ket,
                    waktu_absen="07:15:00",
                    created_by="ketua_kelas"
                )
                db.session.add(att)

        db.session.commit()
        print("[DATABASE] Berhasil men-generate riwayat absensi awal.")
