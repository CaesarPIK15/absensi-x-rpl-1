import os
import csv
import io
from datetime import datetime, date, timedelta
from flask import (
    Flask, render_template, request, redirect, url_for,
    session, jsonify, make_response, send_file
)
from config import Config
from utils.database import db, init_db, User, Student, Attendance
from utils.auth import (
    login_required, role_required, hash_password,
    verify_password, get_current_user, generate_csrf_token
)

app = Flask(__name__)
app.config.from_object(Config)

# Inisialisasi Database
init_db(app)

# Inject variabel global ke semua template
@app.context_processor
def inject_global_template_vars():
    today = date.today()
    days_id = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    months_id = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    hari_ini_teks = f"{days_id[today.weekday()]}, {today.day} {months_id[today.month - 1]} {today.year}"
    
    return {
        'APP_NAME': app.config['APP_NAME'],
        'SCHOOL_NAME': app.config['SCHOOL_NAME'],
        'CLASS_NAME': app.config['CLASS_NAME'],
        'ACADEMIC_YEAR': app.config['ACADEMIC_YEAR'],
        'current_user': get_current_user(),
        'today_date': today.strftime('%Y-%m-%d'),
        'today_formatted': hari_ini_teks,
        'csrf_token': generate_csrf_token()
    }

# ==========================================
# WEB PAGE ROUTES (HTML)
# ==========================================

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/absensi')
@login_required
def absensi():
    return render_template('absensi.html', active_page='absensi')

@app.route('/siswa')
@login_required
def siswa():
    return render_template('siswa.html', active_page='siswa')

@app.route('/riwayat')
@login_required
def riwayat():
    return render_template('riwayat.html', active_page='riwayat')

@app.route('/laporan')
@login_required
def laporan():
    return render_template('laporan.html', active_page='laporan')

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', active_page='profile')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    role = (data.get('role') or '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username dan password wajib diisi!'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not verify_password(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Username atau password salah!'}), 401

    if role and user.role != role:
        return jsonify({'success': False, 'message': f'Akun terdaftar sebagai {user.role.replace("_", " ").title()}, bukan {role.replace("_", " ").title()}!'}), 403

    # Set Session
    session.permanent = True
    session['user_id'] = user.id
    session['username'] = user.username
    session['nama'] = user.nama
    session['role'] = user.role

    return jsonify({
        'success': True,
        'message': f'Selamat datang, {user.nama}!',
        'redirect': url_for('dashboard'),
        'user': user.to_dict()
    })

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Berhasil logout.', 'redirect': url_for('login')})

@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def api_dashboard_stats():
    """Mengambil statistik real-time untuk dashboard."""
    target_date = request.args.get('date', date.today().strftime('%Y-%m-%d'))
    total_students = Student.query.count()

    # Hitung data hari ini
    today_attendances = Attendance.query.filter_by(tanggal=target_date).all()
    hadir = sum(1 for a in today_attendances if a.status == 'Hadir')
    sakit = sum(1 for a in today_attendances if a.status == 'Sakit')
    izin = sum(1 for a in today_attendances if a.status == 'Izin')
    alpa = sum(1 for a in today_attendances if a.status == 'Alpa')
    belum_absen = max(0, total_students - (hadir + sakit + izin + alpa))

    persentase_hadir = round((hadir / total_students * 100), 1) if total_students > 0 else 0

    # Grafik 7 hari terakhir
    today = datetime.strptime(target_date, '%Y-%m-%d').date()
    chart_dates = []
    chart_labels = []
    chart_hadir = []
    chart_sakit = []
    chart_izin = []
    chart_alpa = []

    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime('%Y-%m-%d')
        chart_dates.append(d_str)
        chart_labels.append(d.strftime('%d/%m'))
        
        day_atts = Attendance.query.filter_by(tanggal=d_str).all()
        chart_hadir.append(sum(1 for a in day_atts if a.status == 'Hadir'))
        chart_sakit.append(sum(1 for a in day_atts if a.status == 'Sakit'))
        chart_izin.append(sum(1 for a in day_atts if a.status == 'Izin'))
        chart_alpa.append(sum(1 for a in day_atts if a.status == 'Alpa'))

    # Aktivitas absensi terbaru (10 data terakhir)
    recent = (
        Attendance.query
        .order_by(Attendance.tanggal.desc(), Attendance.id.desc())
        .limit(8)
        .all()
    )

    return jsonify({
        'success': True,
        'date': target_date,
        'total_students': total_students,
        'hadir': hadir,
        'sakit': sakit,
        'izin': izin,
        'alpa': alpa,
        'belum_absen': belum_absen,
        'persentase_hadir': persentase_hadir,
        'chart': {
            'labels': chart_labels,
            'dates': chart_dates,
            'hadir': chart_hadir,
            'sakit': chart_sakit,
            'izin': chart_izin,
            'alpa': chart_alpa
        },
        'recent_activities': [a.to_dict() for a in recent]
    })


# ------------------------------------------
# SISWA API
# ------------------------------------------

@app.route('/api/students', methods=['GET'])
@login_required
def api_get_students():
    search = request.args.get('search', '').strip().lower()
    jk = request.args.get('jk', '').strip()

    query = Student.query
    if search:
        query = query.filter(
            (Student.nama.ilike(f'%{search}%')) | (Student.nis.ilike(f'%{search}%'))
        )
    if jk in ['L', 'P']:
        query = query.filter_by(jenis_kelamin=jk)

    students = query.order_by(Student.nis.asc()).all()
    return jsonify({
        'success': True,
        'count': len(students),
        'students': [s.to_dict() for s in students]
    })

@app.route('/api/students', methods=['POST'])
@login_required
@role_required('wali_kelas')
def api_create_student():
    data = request.get_json() or {}
    nis = (data.get('nis') or '').strip()
    nama = (data.get('nama') or '').strip()
    jk = (data.get('jenis_kelamin') or '').strip().upper()
    kelas = (data.get('kelas') or 'X RPL 1').strip()

    if not nis or not nama or jk not in ['L', 'P']:
        return jsonify({'success': False, 'message': 'NIS, Nama, dan Jenis Kelamin (L/P) wajib diisi!'}), 400

    if Student.query.filter_by(nis=nis).first():
        return jsonify({'success': False, 'message': f'Siswa dengan NIS {nis} sudah terdaftar!'}), 409

    new_student = Student(nis=nis, nama=nama, jenis_kelamin=jk, kelas=kelas)
    db.session.add(new_student)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Siswa {nama} berhasil ditambahkan!',
        'student': new_student.to_dict()
    }), 201

@app.route('/api/students/<int:student_id>', methods=['PUT'])
@login_required
@role_required('wali_kelas')
def api_update_student(student_id):
    student = Student.query.get_or_404(student_id)
    data = request.get_json() or {}
    
    nis = (data.get('nis') or '').strip()
    nama = (data.get('nama') or '').strip()
    jk = (data.get('jenis_kelamin') or '').strip().upper()
    kelas = (data.get('kelas') or 'X RPL 1').strip()

    if not nis or not nama or jk not in ['L', 'P']:
        return jsonify({'success': False, 'message': 'NIS, Nama, dan Jenis Kelamin (L/P) wajib diisi!'}), 400

    # Cek NIS duplikat jika diubah
    existing = Student.query.filter(Student.nis == nis, Student.id != student_id).first()
    if existing:
        return jsonify({'success': False, 'message': f'NIS {nis} sudah digunakan siswa lain!'}), 409

    student.nis = nis
    student.nama = nama
    student.jenis_kelamin = jk
    student.kelas = kelas
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Data siswa {nama} berhasil diperbarui!',
        'student': student.to_dict()
    })

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
@role_required('wali_kelas')
def api_delete_student(student_id):
    student = Student.query.get_or_404(student_id)
    nama = student.nama
    db.session.delete(student)
    db.session.commit()
    return jsonify({'success': True, 'message': f'Siswa {nama} berhasil dihapus.'})

@app.route('/api/students/import-csv', methods=['POST'])
@login_required
@role_required('wali_kelas')
def api_import_csv():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'File CSV tidak ditemukan!'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Pilih file CSV yang akan diunggah!'}), 400

    try:
        content = file.stream.read().decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(content), delimiter=',' if ',' in content.splitlines()[0] else ';')
        
        imported_count = 0
        updated_count = 0
        
        for row in reader:
            if not row or len(row) < 3:
                continue
            # Skip header
            col0 = row[0].strip().lower()
            if col0 in ['nis', 'no', 'nomor']:
                continue
                
            nis = row[0].strip()
            nama = row[1].strip()
            jk = row[2].strip().upper()
            kelas = row[3].strip() if len(row) > 3 else 'X RPL 1'
            
            if not nis or not nama:
                continue
            if jk not in ['L', 'P']:
                jk = 'L'

            student = Student.query.filter_by(nis=nis).first()
            if student:
                student.nama = nama
                student.jenis_kelamin = jk
                student.kelas = kelas
                updated_count += 1
            else:
                student = Student(nis=nis, nama=nama, jenis_kelamin=jk, kelas=kelas)
                db.session.add(student)
                imported_count += 1

        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Import selesai! {imported_count} siswa baru ditambahkan, {updated_count} diperbarui.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Gagal membaca CSV: {str(e)}'}), 500


# ------------------------------------------
# ABSENSI API
# ------------------------------------------

@app.route('/api/attendance', methods=['GET'])
@login_required
def api_get_attendance():
    """Mengambil daftar absensi untuk tanggal tertentu beserta semua siswa."""
    target_date = request.args.get('date', date.today().strftime('%Y-%m-%d'))
    search = request.args.get('search', '').strip().lower()
    status_filter = request.args.get('status', '').strip()

    students = Student.query.order_by(Student.nis.asc()).all()
    attendances = Attendance.query.filter_by(tanggal=target_date).all()
    att_map = {a.student_id: a for a in attendances}

    result = []
    for s in students:
        if search and (search not in s.nama.lower() and search not in s.nis.lower()):
            continue
            
        att = att_map.get(s.id)
        current_status = att.status if att else 'Hadir'  # default rekomendasi 'Hadir'
        
        if status_filter and current_status != status_filter:
            continue

        result.append({
            'student_id': s.id,
            'nis': s.nis,
            'nama': s.nama,
            'jenis_kelamin': s.jenis_kelamin,
            'kelas': s.kelas,
            'tanggal': target_date,
            'status': current_status,
            'is_recorded': att is not None,
            'keterangan': att.keterangan if att else '',
            'waktu_absen': att.waktu_absen if att else '-',
            'created_by': att.created_by if att else '-'
        })

    return jsonify({
        'success': True,
        'date': target_date,
        'total': len(students),
        'recorded': len(attendances),
        'records': result
    })

@app.route('/api/attendance', methods=['POST'])
@login_required
def api_save_attendance():
    """Menyimpan atau memperbarui data absensi harian secara batch (tanpa reload)."""
    data = request.get_json() or {}
    target_date = (data.get('date') or date.today().strftime('%Y-%m-%d')).strip()
    records = data.get('records', [])

    if not records:
        return jsonify({'success': False, 'message': 'Tidak ada data absensi yang dikirim!'}), 400

    now_time = datetime.now().strftime('%H:%M:%S')
    current_username = session.get('username', 'system')

    saved_count = 0
    updated_count = 0

    try:
        for item in records:
            st_id = item.get('student_id')
            status = item.get('status', 'Hadir')
            keterangan = (item.get('keterangan') or '').strip()

            if status not in ['Hadir', 'Sakit', 'Izin', 'Alpa']:
                status = 'Hadir'

            # Cek jika data absensi tanggal dan siswa tersebut sudah ada (mencegah duplikasi)
            existing = Attendance.query.filter_by(student_id=st_id, tanggal=target_date).first()
            if existing:
                existing.status = status
                existing.keterangan = keterangan
                existing.waktu_absen = now_time
                existing.created_by = current_username
                updated_count += 1
            else:
                new_att = Attendance(
                    student_id=st_id,
                    tanggal=target_date,
                    status=status,
                    keterangan=keterangan,
                    waktu_absen=now_time,
                    created_by=current_username
                )
                db.session.add(new_att)
                saved_count += 1

        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Absensi tanggal {target_date} berhasil disimpan ({saved_count} baru, {updated_count} diperbarui)!'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Gagal menyimpan absensi: {str(e)}'}), 500

@app.route('/api/attendance/history', methods=['GET'])
@login_required
def api_get_attendance_history():
    """Mengambil riwayat absensi dengan pagination & filter."""
    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()
    search = request.args.get('search', '').strip().lower()
    status_filter = request.args.get('status', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))

    query = Attendance.query.join(Student)

    if start_date:
        query = query.filter(Attendance.tanggal >= start_date)
    if end_date:
        query = query.filter(Attendance.tanggal <= end_date)
    if status_filter in ['Hadir', 'Sakit', 'Izin', 'Alpa']:
        query = query.filter(Attendance.status == status_filter)
    if search:
        query = query.filter(
            (Student.nama.ilike(f'%{search}%')) | (Student.nis.ilike(f'%{search}%'))
        )

    total_records = query.count()
    items = (
        query.order_by(Attendance.tanggal.desc(), Student.nis.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return jsonify({
        'success': True,
        'total': total_records,
        'page': page,
        'per_page': per_page,
        'total_pages': (total_records + per_page - 1) // per_page if per_page else 1,
        'records': [a.to_dict() for a in items]
    })


# ------------------------------------------
# LAPORAN & EXPORT API
# ------------------------------------------

@app.route('/api/reports', methods=['GET'])
@login_required
def api_get_reports():
    """Menghitung rekapitulasi kehadiran siswa dalam rentang tanggal tertentu."""
    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()
    report_type = request.args.get('type', 'bulanan').strip()

    today = date.today()

    if not start_date or not end_date:
        if report_type == 'harian':
            start_date = today.strftime('%Y-%m-%d')
            end_date = today.strftime('%Y-%m-%d')
        elif report_type == 'mingguan':
            start_date = (today - timedelta(days=6)).strftime('%Y-%m-%d')
            end_date = today.strftime('%Y-%m-%d')
        else: # bulanan
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
            end_date = today.strftime('%Y-%m-%d')

    students = Student.query.order_by(Student.nis.asc()).all()
    attendances = (
        Attendance.query
        .filter(Attendance.tanggal >= start_date, Attendance.tanggal <= end_date)
        .all()
    )

    # Petakan absensi ke siswa
    att_by_student = {}
    for a in attendances:
        if a.student_id not in att_by_student:
            att_by_student[a.student_id] = []
        att_by_student[a.student_id].append(a)

    rekap = []
    total_hadir_kelas = 0
    total_sakit_kelas = 0
    total_izin_kelas = 0
    total_alpa_kelas = 0

    for s in students:
        s_atts = att_by_student.get(s.id, [])
        h = sum(1 for a in s_atts if a.status == 'Hadir')
        sk = sum(1 for a in s_atts if a.status == 'Sakit')
        iz = sum(1 for a in s_atts if a.status == 'Izin')
        alp = sum(1 for a in s_atts if a.status == 'Alpa')
        total_rekam = h + sk + iz + alp
        pct = round((h / total_rekam * 100), 1) if total_rekam > 0 else 0.0

        total_hadir_kelas += h
        total_sakit_kelas += sk
        total_izin_kelas += iz
        total_alpa_kelas += alp

        rekap.append({
            'student_id': s.id,
            'nis': s.nis,
            'nama': s.nama,
            'jenis_kelamin': s.jenis_kelamin,
            'kelas': s.kelas,
            'hadir': h,
            'sakit': sk,
            'izin': iz,
            'alpa': alp,
            'total_pertemuan': total_rekam,
            'persentase': pct
        })

    return jsonify({
        'success': True,
        'start_date': start_date,
        'end_date': end_date,
        'report_type': report_type,
        'total_students': len(students),
        'summary': {
            'hadir': total_hadir_kelas,
            'sakit': total_sakit_kelas,
            'izin': total_izin_kelas,
            'alpa': total_alpa_kelas
        },
        'students_recap': rekap
    })

@app.route('/api/reports/export-csv', methods=['GET'])
@login_required
def api_export_reports_csv():
    """Export rekap absensi ke file CSV untuk diunduh."""
    start_date = request.args.get('start_date', date.today().replace(day=1).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', date.today().strftime('%Y-%m-%d'))

    students = Student.query.order_by(Student.nis.asc()).all()
    attendances = (
        Attendance.query
        .filter(Attendance.tanggal >= start_date, Attendance.tanggal <= end_date)
        .all()
    )

    att_by_student = {}
    for a in attendances:
        if a.student_id not in att_by_student:
            att_by_student[a.student_id] = []
        att_by_student[a.student_id].append(a)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header CSV
    writer.writerow([f"REKAPITULASI ABSENSI SISWA KELAS X RPL 1 - SMKN 1 PROBOLINGGO"])
    writer.writerow([f"Periode: {start_date} s.d. {end_date}"])
    writer.writerow([])
    writer.writerow(["No", "NIS", "Nama Siswa", "L/P", "Hadir", "Sakit", "Izin", "Alpa", "Total Hari", "Persentase Kehadiran (%)"])

    for idx, s in enumerate(students, 1):
        s_atts = att_by_student.get(s.id, [])
        h = sum(1 for a in s_atts if a.status == 'Hadir')
        sk = sum(1 for a in s_atts if a.status == 'Sakit')
        iz = sum(1 for a in s_atts if a.status == 'Izin')
        alp = sum(1 for a in s_atts if a.status == 'Alpa')
        total_rekam = h + sk + iz + alp
        pct = round((h / total_rekam * 100), 1) if total_rekam > 0 else 0.0

        writer.writerow([idx, s.nis, s.nama, s.jenis_kelamin, h, sk, iz, alp, total_rekam, f"{pct}%"])

    output.seek(0)
    filename = f"Rekap_Absensi_XRPL1_{start_date}_sd_{end_date}.csv"
    
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.headers['Content-Type'] = 'text/csv; charset=utf-8'
    return response


# ------------------------------------------
# PROFILE & SETTINGS API
# ------------------------------------------

@app.route('/api/profile/change-password', methods=['POST'])
@login_required
def api_change_password():
    data = request.get_json() or {}
    current_pass = (data.get('current_password') or '').strip()
    new_pass = (data.get('new_password') or '').strip()
    confirm_pass = (data.get('confirm_password') or '').strip()

    if not current_pass or not new_pass or not confirm_pass:
        return jsonify({'success': False, 'message': 'Semua kolom password wajib diisi!'}), 400

    if new_pass != confirm_pass:
        return jsonify({'success': False, 'message': 'Password baru dan konfirmasi tidak cocok!'}), 400

    if len(new_pass) < 6:
        return jsonify({'success': False, 'message': 'Password baru minimal harus 6 karakter!'}), 400

    user = get_current_user()
    if not user or not verify_password(user.password_hash, current_pass):
        return jsonify({'success': False, 'message': 'Password saat ini salah!'}), 400

    user.password_hash = hash_password(new_pass)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Password berhasil diperbarui!'})


# ------------------------------------------
# ERROR HANDLERS
# ------------------------------------------

@app.errorhandler(404)
def page_not_found(e):
    if request.is_json or request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Endpoint tidak ditemukan (404)'}), 404
    return render_template('404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    if request.is_json or request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Akses ditolak: Anda tidak memiliki izin.'}), 403
    return render_template('404.html', error_title="403 - Akses Ditolak", error_desc="Anda tidak memiliki hak akses ke halaman ini."), 403

@app.errorhandler(500)
def server_error(e):
    if request.is_json or request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Terjadi kesalahan pada server (500)'}), 500
    return render_template('404.html', error_title="500 - Server Error", error_desc="Terjadi gangguan internal pada server."), 500


if __name__ == '__main__':
    # Mode development lokal
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1']
    print(f"[*] Menjalankan {app.config['APP_NAME']} pada http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
