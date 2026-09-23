import secrets
from functools import wraps
from flask import session, redirect, url_for, request, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from utils.database import User

def hash_password(password: str) -> str:
    """Hash password menggunakan Werkzeug."""
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    """Verifikasi kecocokan password plaintext dengan hash."""
    return check_password_hash(password_hash, password)

def get_current_user():
    """Mengambil user aktif dari session."""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

def login_required(f):
    """Decorator untuk membatasi route hanya untuk user yang sudah login."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Jika request berupa API/JSON, return 401 Unauthorized
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Autentikasi diperlukan. Silakan login terlebih dahulu.'}), 401
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    """Decorator untuk membatasi route berdasarkan role pengguna."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({'success': False, 'message': 'Autentikasi diperlukan.'}), 401
                return redirect(url_for('login'))
            
            user_role = session.get('role')
            if user_role not in allowed_roles:
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({
                        'success': False, 
                        'message': 'Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini.'
                    }), 403
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def generate_csrf_token():
    """Membuat CSRF token acak dan menyimpannya di session."""
    if '_csrf_token' not in session:
        session['_csrf_token'] = secrets.token_hex(32)
    return session['_csrf_token']
