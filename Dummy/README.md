# 🚀 APLIKASI WEB ABSENSI KELAS X RPL 1
### SMKN 1 PROBOLINGGO - TAHUN AJARAN 2026/2027

Aplikasi web presensi siswa modern, cepat, aman, dan siap pakai (*production-ready*) yang dirancang khusus untuk kebutuhan presensi harian siswa kelas **X RPL 1 di SMKN 1 Probolinggo**. Aplikasi ini dapat langsung dijalankan secara lokal (Windows/Linux/macOS) maupun di-deploy ke server hosting cloud (Render, Railway, PythonAnywhere, VPS, dsb).

---

## 📌 DAFTAR ISI
1. [Fitur Utama](#-fitur-utama)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Struktur Folder Project](#-struktur-folder-project)
4. [Akun Pengujian (Testing Credentials)](#-akun-pengujian-testing-credentials)
5. [Panduan Instalasi & Menjalankan di Windows](#-panduan-instalasi--menjalankan-di-windows)
6. [Panduan Instalasi & Menjalankan di Linux / macOS](#-panduan-instalasi--menjalankan-di-linux--macos)
7. [Inisialisasi & Reset Database](#-inisialisasi--reset-database)
8. [Panduan Mengubah Akun & Password](#-panduan-mengubah-akun--password)
9. [Panduan Hosting ke GitHub Pages (100% Gratis & Instan)](#-panduan-hosting-ke-github-pages-100-gratis--instan)
10. [Panduan Deployment Backend ke Cloud (Render/Railway/VPS)](#-panduan-deployment-backend-ke-cloud-renderrailwayvps)
10. [Konfigurasi Database (SQLite ke PostgreSQL / MySQL)](#-konfigurasi-database-sqlite-ke-postgresql--mysql)
11. [Checklist Sebelum Digunakan di Kelas](#-checklist-sebelum-digunakan-secara-nyata)

---

## 🌟 FITUR UTAMA

- 🔐 **Sistem Autentikasi Role-Based**:
  - **Wali Kelas**: Akses penuh ke seluruh fitur, manajemen data siswa (CRUD), input/koreksi absensi, import data siswa via CSV, cetak laporan resmi, export data ke file CSV, dan pengelolaan akun.
  - **Ketua Kelas**: Melakukan input absensi harian siswa, koreksi absensi, melihat riwayat absensi, pencarian siswa, dan melihat laporan kelas.
- ⚡ **Input Absensi Harian Interaktif**:
  - Tombol cepat **"Tandai Semua Hadir"** untuk efisiensi waktu ketua kelas.
  - Status kehadiran jelas: **Hadir** (Hijau), **Sakit** (Kuning), **Izin** (Biru), **Alpa** (Merah).
  - Kolom keterangan instan per siswa.
  - Penyimpanan batch via **AJAX / Fetch API** tanpa reload halaman.
  - Pencegahan duplikasi data absensi pada siswa dan tanggal yang sama (*Unique Constraint*).
- 📊 **Dashboard Real-Time**:
  - 5 Stat Cards: Total Siswa, Hadir, Sakit, Izin, Alpa.
  - Grafik tren kehadiran 7 hari terakhir berbasis HTML5 Canvas murni (ringan dan tanpa library eksternal yang lambat).
  - Ring persentase kehadiran hari ini.
  - Log aktivitas presensi terbaru.
- 👨‍🎓 **Data Siswa & Import CSV**:
  - Sudah terisi 36 data siswa awal X RPL 1.
  - Form tambah & edit siswa interaktif dengan modal popup.
  - Fitur Import data siswa dari file CSV secara massal.
- 📄 **Riwayat & Laporan Resmi Siap Cetak**:
  - Rekapitulasi per siswa dan per kelas (harian, mingguan, bulanan, dan rentang tanggal kustom).
  - **Cetak Laporan**: Template cetak resmi berstandar Kop Surat SMKN 1 Probolinggo lengkap dengan kolom tanda tangan Wali Kelas dan Ketua Kelas.
  - **Export CSV**: Unduh data absensi langsung ke format spreadsheet (Excel/LibreOffice).
- 🎨 **Desain UI Modern & Responsive**:
  - Tampilan bertema sekolah teknologi (*Tech/RPL*).
  - **Dark Mode** & **Light Mode** otomatis dengan penyimpanan preferensi di browser (*localStorage*).
  - **Jam Digital Live (WIB)** & tanggal otomatis dalam Bahasa Indonesia.
  - Indikator denyut **"Sistem Online"**.
  - Responsif sempurna untuk Layar Desktop (1920px), Laptop (1366px), Tablet, serta Smartphone Android & iOS.
  - Sidebar mobile dengan hamburger menu dan backdrop overlay.

---

## 🛠 TEKNOLOGI YANG DIGUNAKAN

- **Backend**: Python 3.10+ & Flask 3.0+
- **Database ORM**: Flask-SQLAlchemy (Kompatibel SQLite lokal & PostgreSQL/MySQL production)
- **Keamanan**: Password Hashing via `werkzeug.security`, HTTPOnly Session Cookies, CSRF Token Protection
- **Frontend**: Semantic HTML5, Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism), Vanilla JavaScript (ES6+ Fetch API)
- **Icons & Typography**: Font Awesome 6, Google Fonts (*Outfit* & *Plus Jakarta Sans*)
- **WSGI Production Server**: Gunicorn

---

## 📁 STRUKTUR FOLDER PROJECT

```text
absensi-x-rpl-1/
├── app.py                     # Entry point Flask, Routing Halaman & REST API
├── config.py                  # Konfigurasi aplikasi & database
├── requirements.txt           # Daftar pustaka Python
├── README.md                  # Dokumentasi panduan lengkap
├── .env.example               # Contoh template file konfigurasi environment
├── .gitignore                 # File yang diabaikan oleh Git
├── Procfile                   # Perintah start worker untuk cloud PaaS (Render/Railway)
├── runtime.txt                # Penentu versi Python untuk cloud
├── data_siswa_contoh.csv      # File template contoh untuk uji coba Import Siswa
│
├── instance/
│   └── absensi.db             # Database SQLite lokal (dibuat otomatis)
│
├── utils/
│   ├── __init__.py
│   ├── database.py            # Model SQLAlchemy (User, Student, Attendance) & Data Seeder
│   └── auth.py                # Decorator login_required, role_required, & hashing password
│
├── templates/
│   ├── base.html              # Layout induk (Sidebar, Topbar, Jam digital, Toast container)
│   ├── login.html             # Halaman login modern
│   ├── dashboard.html         # Tampilan dashboard, kartu statistik, grafik kehadiran
│   ├── absensi.html           # Halaman pengisian absensi harian cepat
│   ├── siswa.html             # Halaman manajemen data siswa & modal CRUD
│   ├── riwayat.html           # Riwayat rekam presensi dengan filter & pagination
│   ├── laporan.html           # Rekap absensi, format Cetak Surat resmi & Export CSV
│   ├── profile.html           # Profil pengguna & formulir ganti password
│   └── 404.html               # Halaman error 404 bertema teknologi
│
└── static/
    ├── css/
    │   └── style.css          # Desain sistem CSS utama (Dark/Light mode & Print layout)
    └── js/
        ├── main.js            # Inisialisasi tema, jam digital, sidebar mobile, toast notification
        ├── login.js           # Validasi login & AJAX submit
        ├── dashboard.js       # Fetch data statistik real-time & HTML5 Canvas chart
        ├── absensi.js         # Interaksi absensi, pill status, & simpan batch AJAX
        ├── siswa.js           # Interaktivitas CRUD siswa & upload CSV
        ├── riwayat.js         # Log riwayat dan penyaringan tanggal/status
        └── laporan.js         # Perhitungan rekapitulasi, cetak print, & download CSV
```

---

## 🔑 AKUN PENGUJIAN (TESTING CREDENTIALS)

Saat database pertama kali diinisialisasi, sistem secara otomatis membuat dua akun pengujian default:

| Role | Username | Password Default | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Wali Kelas** | `wali_kelas` | `wali123` | CRUD Siswa, Import CSV, Koreksi Absensi, Cetak Laporan, Export CSV |
| **Ketua Kelas** | `ketua_kelas` | `ketua123` | Input Absensi Harian, Edit Hari Ini, Filter/Cari, Lihat Laporan |

> ⚠️ **PENTING UNTUK KEAMANAN**:
> Password di atas hanya untuk keperluan pengembangan & pengujian awal. Segera ubah password melalui menu **Profil Pengguna > Ganti Password** sebelum aplikasi digunakan di lingkungan sekolah sebenarnya!

---

## 💻 PANDUAN INSTALASI & MENJALANKAN DI WINDOWS

### 1. Pastikan Python Terpasang
Buka **PowerShell** atau **Command Prompt**, lalu ketik:
```powershell
python --version
```
Jika belum terpasang, unduh installer resmi dari [python.org](https://www.python.org/downloads/) (versi 3.10, 3.11, atau 3.12) dan pastikan mencentang opsi **"Add Python to PATH"** saat instalasi.

### 2. Buka Folder Project
```powershell
cd d:\CODING\Dummy
```

### 3. Buat Virtual Environment
```powershell
python -m venv .venv
```

### 4. Aktifkan Virtual Environment
```powershell
.\.venv\Scripts\Activate.ps1
```
*(Jika muncul error Execution Policy di PowerShell, jalankan: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` terlebih dahulu)*

### 5. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 6. Jalankan Server Aplikasi
```powershell
python app.py
```
Aplikasi akan aktif di alamat: **`http://127.0.0.1:5000`**. Buka peramban (Chrome, Edge, Firefox) dan akses link tersebut.

---

## 🐧 PANDUAN INSTALASI & MENJALANKAN DI LINUX / MACOS

### 1. Update Paket & Install Python
Pada Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv -y
```

### 2. Masuk ke Direktori Project
```bash
cd /path/ke/absensi-x-rpl-1
```

### 3. Buat & Aktifkan Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Jalankan Server
```bash
python3 app.py
```
Buka browser Anda dan akses `http://localhost:5000`.

---

## 🗄 INISIALISASI & RESET DATABASE

Database SQLite lokal disimpan di dalam folder `instance/absensi.db`.
- Database beserta seluruh tabel (`users`, `students`, `attendance`) dan data 36 siswa awal akan **dibuat secara otomatis** saat `app.py` pertama kali dijalankan.
- Jika Anda ingin **mereset database ke kondisi awal**, cukup hapus file `instance/absensi.db`, lalu jalankan kembali `python app.py`. Database baru yang bersih beserta data awal akan langsung di-generate ulang.

---

## 🔒 PANDUAN MENGUBAH AKUN & PASSWORD

### Melalui Antarmuka Web (UI):
1. Login menggunakan akun yang ingin diubah.
2. Masuk ke menu **Profil Pengguna** di sidebar kiri.
3. Pada card **Ganti Password**, masukkan:
   - Password saat ini
   - Password baru (minimal 6 karakter)
   - Konfirmasi password baru
4. Klik tombol **Perbarui Password**.

### Menambah Akun Baru via Python Shell:
Jika ingin menambahkan akun guru piket atau wakil ketua kelas:
```powershell
.\.venv\Scripts\python
```
Lalu masukkan kode:
```python
from app import app
from utils.database import db, User
from werkzeug.security import generate_password_hash

with app.app_context():
    new_user = User(
        username='wakil_ketua',
        password_hash=generate_password_hash('passwordBaru123'),
        nama='Mochammad Bayu Setiawan',
        role='ketua_kelas'
    )
    db.session.add(new_user)
    db.session.commit()
    print("User berhasil dibuat!")
```

---

## 🌐 PANDUAN HOSTING KE GITHUB PAGES (100% GRATIS & INSTAN)

> 💡 **Informasi Teknis untuk Siswa/Guru RPL**:
> GitHub Pages adalah layanan hosting khusus file **statis** (HTML, CSS, JavaScript, Media) dan tidak memiliki mesin runtime server Python Flask atau database SQLite server-side.
>
> Agar website ini **DAPAT LANGSUNG AKTIF DAN DIGUNAKAN DI GITHUB PAGES**, kami telah menyediakan versi **Serverless Web App** di folder `docs/` yang menggunakan mesin penyimpanan **Browser LocalStorage** (`docs/js/storage.js`). Seluruh fitur (Login Wali & Ketua Kelas, 36 Siswa X RPL 1, Absensi Harian, Grafik Canvas, Rekapitulasi, Cetak Kop Surat Resmi, dan Export CSV) berjalan 100% langsung di browser tanpa perlu server!

### Langkah Mudah Hosting ke GitHub Pages dalam 3 Menit:

#### Cara 1: Upload via Browser di GitHub.com (Paling Praktis Tanpa Git CLI)
1. Buka [github.com](https://github.com/) dan login ke akun GitHub Anda.
2. Buat repository baru, misalnya beri nama `absensi-x-rpl-1` (pilih Public).
3. Klik tombol **"uploading an existing file"**.
4. Drag & drop seluruh isi project ini (termasuk folder `docs/`) ke halaman GitHub, lalu klik **Commit changes**.
5. Masuk ke tab **Settings** di repository GitHub Anda.
6. Pada sidebar kiri, klik menu **Pages** (di bawah bagian *Code and automation*).
7. Di bagian **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`
   - **Branch**: Pilih `main` (atau `master`)
   - **Folder**: Ubah dari `/(root)` menjadi **`/docs`**
8. Klik tombol **Save**.
9. Tunggu sekitar 1-2 menit. Refresh halaman Settings > Pages, dan link website Anda akan muncul:
   👉 **`https://<username-anda>.github.io/absensi-x-rpl-1/`**
10. Website absensi kelas langsung aktif dan bisa dibuka oleh seluruh siswa dan guru dari HP maupun laptop!

---

## ☁️ PANDUAN DEPLOYMENT BACKEND KE CLOUD (RENDER/RAILWAY/VPS)

Jika Anda menginginkan **database terpusat yang tersinkronisasi online antar-perangkat** (misal Ketua Kelas mengabsen dari HP, dan di detik yang sama Wali Kelas melihatnya di laptop melalui database server Flask terpusat), gunakan platform cloud gratis berikut:

### 1. Deploy ke Render.com (Direkomendasikan & Gratis)
1. Unggah source code ini ke repository pribadi di **GitHub** atau **GitLab**.
2. Masuk ke [dashboard.render.com](https://dashboard.render.com/) dan buat akun.
3. Klik tombol **New +** > pilih **Web Service**.
4. Hubungkan repository GitHub Anda.
5. Konfigurasikan parameter berikut:
   - **Name**: `absensi-x-rpl-1`
   - **Environment**: `Python 3`
   - **Region**: `Singapore` (terdekat dengan Indonesia untuk performa maksimal)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Masuk ke tab **Environment Variables** dan tambahkan:
   - `SECRET_KEY`: Buat teks acak panjang dan aman (contoh: `k9s8d7f6g5h4j3k2l1m0_xrpl1_smkn1`)
   - `FLASK_DEBUG`: `False`
7. Klik **Create Web Service**. Dalam waktu 2 menit website Anda sudah online dengan domain HTTPS gratis (contoh: `https://absensi-x-rpl-1.onrender.com`).

---

### 2. Deploy ke Railway.app
1. Masuk ke [railway.app](https://railway.app/).
2. Buat **New Project** > pilih **Deploy from GitHub repo**.
3. Railway akan otomatis mendeteksi `Procfile` dan `requirements.txt`.
4. Tambahkan Environment Variable di menu **Variables**:
   - `SECRET_KEY`: `kunci-rahasia-anda`
   - `PORT`: `5000`
5. Masuk ke tab **Settings** > **Networking** > klik **Generate Domain** untuk mendapatkan link website publik.

---

### 3. Deploy ke PythonAnywhere
1. Buat akun di [pythonanywhere.com](https://www.pythonanywhere.com/).
2. Buka tab **Consoles** > buka **Bash console**.
3. Clone repository atau upload project zip Anda:
   ```bash
   git clone <url-repo-anda>
   cd <nama-folder>
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Masuk ke tab **Web** di dashboard PythonAnywhere:
   - Klik **Add a new web app**.
   - Pilih **Manual configuration** > **Python 3.10/3.11**.
   - Pada bagian **Virtualenv**, masukkan path virtualenv: `/home/username/<folder>/.venv`
   - Edit file **WSGI configuration file**:
     ```python
     import sys
     path = '/home/username/<folder>'
     if path not in sys.path:
         sys.path.append(path)

     from app import app as application
     ```
5. Klik tombol **Reload**. Website absensi Anda siap digunakan!

---

### 4. Deploy ke VPS Linux dengan Nginx & Gunicorn
1. Jalankan aplikasi menggunakan service systemd (`/etc/systemd/system/absensi.service`):
   ```ini
   [Unit]
   Description=Gunicorn instance to serve Absensi X RPL 1
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/absensi-x-rpl-1
   Environment="PATH=/var/www/absensi-x-rpl-1/.venv/bin"
   ExecStart=/var/www/absensi-x-rpl-1/.venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

   [Install]
   WantedBy=multi-user.target
   ```
2. Konfigurasi reverse proxy Nginx (`/etc/nginx/sites-available/absensi`):
   ```nginx
   server {
       listen 80;
       server_name absensi.smkn1probolinggo.sch.id;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Aktifkan SSL gratis menggunakan Let's Encrypt Certbot:
   ```bash
   sudo certbot --nginx -d absensi.smkn1probolinggo.sch.id
   ```

---

## 🔄 KONFIGURASI DATABASE (SQLite ke PostgreSQL / MySQL)

Secara default, aplikasi menggunakan database **SQLite** lokal yang disimpan di `instance/absensi.db`.

Jika Anda ingin menggunakan database eksternal seperti **PostgreSQL** (misalnya di Supabase, Neon.tech, Render Postgres, atau AWS RDS), Anda **TIDAK PERLU mengubah satu baris pun kode program!**

Cukup setel variabel environment `DATABASE_URL`:

### Contoh untuk PostgreSQL:
```bash
# Tambahkan psycopg2-binary jika menggunakan PostgreSQL:
pip install psycopg2-binary

# Set di file .env atau panel hosting:
DATABASE_URL=postgresql://username:password@ep-cool-db.us-east-2.aws.neon.tech/absensi_db?sslmode=require
```

### Contoh untuk MySQL:
```bash
pip install pymysql
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/absensi_db
```
Aplikasi secara otomatis membaca URL tersebut dan membuat seluruh tabel serta menginisialisasi data siswa awal secara mandiri saat booting pertama kali.

---

## ✅ CHECKLIST SEBELUM DIGUNAKAN SECARA NYATA

Sebelum aplikasi diserahkan kepada Ketua Kelas dan Wali Kelas untuk absensi harian:

- [ ] **Ganti Password Default**: Login sebagai `wali_kelas` dan `ketua_kelas`, lalu ganti password default di menu Profil Pengguna.
- [ ] **Set SECRET_KEY Unik**: Pastikan `SECRET_KEY` di server production diisi dengan kode acak rahasia.
- [ ] **Verifikasi Daftar Siswa**: Periksa daftar 36 siswa di menu **Data Siswa**. Sesuaikan nama lengkap dan NIS jika terdapat data siswa pindahan atau penyesuaian dari daftar riil absensi sekolah.
- [ ] **Simulasikan Cetak Laporan**: Coba klik menu **Laporan & Rekap** > **Cetak Laporan** untuk memastikan tampilan cetak surat resmi telah sesuai dengan kop surat SMKN 1 Probolinggo.
- [ ] **Uji Coba di Smartphone**: Buka website dari ponsel Ketua Kelas untuk memastikan navigasi dan pengisian absensi berjalan cepat dan nyaman melalui layar sentuh.

---
**SMKN 1 Probolinggo - Rekayasa Perangkat Lunak (RPL)**  
*Mencetak Generasi Unggul, Cerdas, dan Berkarakter Teknologi.*
