import os
import unittest
import json
from app import app
from utils.database import db, User, Student, Attendance

class AbsensiTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.client = app.test_client()

    def test_01_seeding_verification(self):
        with app.app_context():
            user_count = User.query.count()
            student_count = Student.query.count()
            att_count = Attendance.query.count()
            print(f"\n[TEST] User Count: {user_count} (Expected >= 2)")
            print(f"[TEST] Student Count: {student_count} (Expected 36)")
            print(f"[TEST] Attendance Count: {att_count} (Expected > 0)")
            self.assertGreaterEqual(user_count, 2)
            self.assertGreaterEqual(student_count, 36)
            self.assertGreater(att_count, 0)

    def test_02_login_wali_kelas(self):
        res = self.client.post('/api/login', json={
            'username': 'wali_kelas',
            'password': 'wali123',
            'role': 'wali_kelas'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        print(f"[TEST] Login Wali Kelas: SUCCESS ({data['user']['nama']})")

    def test_03_login_ketua_kelas(self):
        res = self.client.post('/api/login', json={
            'username': 'ketua_kelas',
            'password': 'ketua123',
            'role': 'ketua_kelas'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        print(f"[TEST] Login Ketua Kelas: SUCCESS ({data['user']['nama']})")

    def test_04_dashboard_stats(self):
        # Login first
        self.client.post('/api/login', json={'username': 'wali_kelas', 'password': 'wali123', 'role': 'wali_kelas'})
        res = self.client.get('/api/dashboard/stats')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['total_students'], 36)
        print(f"[TEST] Dashboard Stats: Total {data['total_students']}, Hadir {data['hadir']}, Sakit {data['sakit']}, Izin {data['izin']}, Alpa {data['alpa']}")

    def test_05_attendance_save(self):
        self.client.post('/api/login', json={'username': 'ketua_kelas', 'password': 'ketua123', 'role': 'ketua_kelas'})
        res = self.client.post('/api/attendance', json={
            'date': '2026-09-23',
            'records': [
                {'student_id': 1, 'status': 'Hadir', 'keterangan': 'Tepat waktu'},
                {'student_id': 2, 'status': 'Sakit', 'keterangan': 'Surat dokter terlampir'}
            ]
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        print(f"[TEST] Save Attendance: {data['message']}")

    def test_06_reports_calculation(self):
        self.client.post('/api/login', json={'username': 'wali_kelas', 'password': 'wali123', 'role': 'wali_kelas'})
        res = self.client.get('/api/reports?type=bulanan')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('students_recap', data)
        self.assertEqual(len(data['students_recap']), 36)
        print(f"[TEST] Reports Calculation: SUCCESS ({len(data['students_recap'])} siswa terdata)")

if __name__ == '__main__':
    unittest.main()
