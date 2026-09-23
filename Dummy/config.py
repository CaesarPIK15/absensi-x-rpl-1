import os
from dotenv import load_dotenv

# Load environment variables dari .env jika ada
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Konfigurasi aplikasi Absensi Kelas X RPL 1 SMKN 1 Probolinggo."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-absensi-xrpl1-smkn1probolinggo-2026'
    
    # Penanganan DATABASE_URL untuk PostgreSQL/MySQL atau SQLite lokal
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        # Fix skema postgres:// lama dari Render/Railway/Heroku ke postgresql://
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = db_url or f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'absensi.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Pengaturan Session & Cookie Keamanan
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 Jam
    
    # Identitas Aplikasi
    APP_NAME = "ABSENSI KELAS X RPL 1"
    SCHOOL_NAME = "SMKN 1 Probolinggo"
    CLASS_NAME = "X RPL 1"
    ACADEMIC_YEAR = "2026/2027"
