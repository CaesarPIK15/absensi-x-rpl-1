/**
 * ABSENSI KELAS X RPL 1 - SMKN 1 PROBOLINGGO
 * dashboard.js - Real-time stats, Interactive Canvas Chart, Recent Activities
 */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();

  const refreshBtn = document.getElementById('refreshDashboardBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboardData();
      Toast.info('Data dashboard diperbarui.', 'Sinkronisasi');
    });
  }
});

async function loadDashboardData() {
  const res = await apiRequest('/api/dashboard/stats');
  if (!res.ok || !res.data.success) {
    Toast.error('Gagal memuat data statistik dashboard.');
    return;
  }

  const d = res.data;

  // 1. Update Card Angka
  setAnimatedNumber('statTotalSiswa', d.total_students);
  setAnimatedNumber('statHadir', d.hadir);
  setAnimatedNumber('statSakit', d.sakit);
  setAnimatedNumber('statIzin', d.izin);
  setAnimatedNumber('statAlpa', d.alpa);

  // 2. Update Persentase Kehadiran
  const pctEl = document.getElementById('statPersentaseHadir');
  if (pctEl) pctEl.textContent = `${d.persentase_hadir}%`;

  const pctBar = document.getElementById('progressBarHadir');
  if (pctBar) pctBar.style.width = `${d.persentase_hadir}%`;

  // 3. Render HTML5 Canvas Chart (7 Hari Terakhir)
  renderAttendanceChart(d.chart);

  // 4. Render Aktivitas Terkini
  renderRecentActivities(d.recent_activities);
}

function setAnimatedNumber(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = targetValue;
}

// ==========================================
// RENDER HTML5 CANVAS CHART (Multi-bar Attendance)
// ==========================================
function renderAttendanceChart(chartData) {
  const canvas = document.getElementById('attendanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const labels = chartData.labels || [];
  const hadirData = chartData.hadir || [];
  const sakitData = chartData.sakit || [];
  const izinData = chartData.izin || [];
  const alpaData = chartData.alpa || [];

  const count = labels.length;
  if (count === 0) return;

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Cari max value
  let maxVal = 36;
  hadirData.forEach((v, i) => {
    const totalDay = v + sakitData[i] + izinData[i] + alpaData[i];
    if (totalDay > maxVal) maxVal = totalDay;
  });
  maxVal = Math.ceil(maxVal / 5) * 5;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Draw Grid Lines (Y-Axis)
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'right';

  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const yVal = Math.round((maxVal / ySteps) * i);
    const yPos = height - paddingBottom - (chartH / ySteps) * i;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, yPos);
    ctx.lineTo(width - paddingRight, yPos);
    ctx.stroke();

    ctx.fillText(yVal, paddingLeft - 8, yPos + 4);
  }

  // Draw Bars for Each Day
  const groupWidth = chartW / count;
  const barWidth = Math.min(14, (groupWidth - 10) / 4);

  labels.forEach((label, idx) => {
    const groupX = paddingLeft + idx * groupWidth + (groupWidth / 2);

    // Label X-Axis
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.fillText(label, groupX, height - paddingBottom + 20);

    // Bars: Hadir, Sakit, Izin, Alpa
    const statuses = [
      { val: hadirData[idx] || 0, color: '#10b981' },
      { val: sakitData[idx] || 0, color: '#f59e0b' },
      { val: izinData[idx] || 0, color: '#0284c7' },
      { val: alpaData[idx] || 0, color: '#ef4444' }
    ];

    statuses.forEach((s, sIdx) => {
      const bH = (s.val / maxVal) * chartH;
      const bX = groupX - (barWidth * 2) + (sIdx * barWidth);
      const bY = height - paddingBottom - bH;

      ctx.fillStyle = s.color;
      // Draw Rounded Top Bar
      drawRoundedRect(ctx, bX, bY, barWidth - 2, bH, 3);
      ctx.fill();
    });
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (height <= 0) return;
  radius = Math.min(radius, height / 2, width / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x, y);
  ctx.closePath();
}

// Window resize chart re-render
window.addEventListener('resize', () => {
  const canvas = document.getElementById('attendanceChart');
  if (canvas) {
    loadDashboardData();
  }
});

// ==========================================
// RENDER RECENT ACTIVITIES
// ==========================================
function renderRecentActivities(activities) {
  const container = document.getElementById('recentActivitiesList');
  if (!container) return;

  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted);">
        <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 8px;"></i>
        <p>Belum ada aktivitas absensi tercatat.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = activities.map(item => {
    let badgeClass = 'badge-hadir';
    let iconClass = 'fa-check';

    if (item.status === 'Sakit') { badgeClass = 'badge-sakit'; iconClass = 'fa-thermometer-half'; }
    else if (item.status === 'Izin') { badgeClass = 'badge-izin'; iconClass = 'fa-envelope-open-text'; }
    else if (item.status === 'Alpa') { badgeClass = 'badge-alpa'; iconClass = 'fa-times'; }

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: var(--bg-card); font-weight: 700; font-size: 0.85rem;">
            ${escapeHtml(item.jenis_kelamin || 'L')}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${escapeHtml(item.nama)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">NIS: ${escapeHtml(item.nis)} &bull; ${escapeHtml(item.tanggal)} (${escapeHtml(item.waktu_absen)})</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${badgeClass}"><i class="fas ${iconClass}"></i> ${escapeHtml(item.status)}</span>
        </div>
      </div>
    `;
  }).join('');
}
