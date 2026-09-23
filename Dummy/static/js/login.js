/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * login.js - Authentication & Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const roleInput = document.getElementById('selectedRole');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const submitBtn = document.getElementById('submitLoginBtn');
  const roleTabs = document.querySelectorAll('.role-tab');
  const errorAlert = document.getElementById('loginErrorAlert');

  // 1. Role Tabs Selection
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.getAttribute('data-role');
      roleInput.value = role;
    });
  });

  // 2. Show / Hide Password
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  }

  // 3. Quick Account Filler for Testing
  const fillWaliBtn = document.getElementById('fillWaliBtn');
  const fillKetuaBtn = document.getElementById('fillKetuaBtn');

  if (fillWaliBtn) {
    fillWaliBtn.addEventListener('click', () => {
      usernameInput.value = 'wali_kelas';
      passwordInput.value = 'wali123';
      setRole('wali_kelas');
    });
  }

  if (fillKetuaBtn) {
    fillKetuaBtn.addEventListener('click', () => {
      usernameInput.value = 'ketua_kelas';
      passwordInput.value = 'ketua123';
      setRole('ketua_kelas');
    });
  }

  function setRole(role) {
    roleInput.value = role;
    roleTabs.forEach(t => {
      if (t.getAttribute('data-role') === role) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  }

  // 4. Submit Login Form via AJAX
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const role = roleInput.value;

      if (!username || !password) {
        showError('Silakan masukkan username dan password!');
        return;
      }

      hideError();
      setLoading(true);

      const res = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role })
      });

      setLoading(false);

      if (res.ok && res.data.success) {
        Toast.success(res.data.message || 'Login berhasil! Mengalihkan...');
        setTimeout(() => {
          window.location.href = res.data.redirect || '/dashboard';
        }, 600);
      } else {
        const errorMsg = res.data.message || 'Login gagal. Periksa username dan password Anda.';
        showError(errorMsg);
        Toast.error(errorMsg);
      }
    });
  }

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Memproses...' 
        : '<i class="fas fa-sign-in-alt"></i> Masuk Sekarang';
    }
  }
});
