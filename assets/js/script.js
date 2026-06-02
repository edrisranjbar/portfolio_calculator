let growthChart, donutChart, interestChart;

const STORAGE_KEY = 'portfolio_calculator_inputs';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
}

function fmtPct(n) { return n.toFixed(1) + '%'; }

function saveInputs() {
  const data = {
    monthly: document.getElementById('monthly').value,
    rate: document.getElementById('rate').value,
    months: document.getElementById('months').value,
    initial: document.getElementById('initial').value
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showSaveIndicator();
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
}

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.monthly !== undefined) document.getElementById('monthly').value = data.monthly;
    if (data.rate !== undefined) document.getElementById('rate').value = data.rate;
    if (data.months !== undefined) document.getElementById('months').value = data.months;
    if (data.initial !== undefined) document.getElementById('initial').value = data.initial;
  } catch (e) {
    console.warn('Could not load saved inputs:', e);
  }
}

let saveTimer;
function showSaveIndicator() {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  el.textContent = 'Saved';
  el.classList.add('saved');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    el.textContent = '';
    el.classList.remove('saved');
  }, 1500);
}

function calc() {
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const months = Math.max(1, parseInt(document.getElementById('months').value) || 12);
  const initial = parseFloat(document.getElementById('initial').value) || 0;
  const mRate = rate / 100 / 12;

  const yrs = Math.round(months / 12 * 10) / 10;
  document.getElementById('months-label').textContent =
    `months (${yrs % 1 === 0 ? yrs.toFixed(0) : yrs} yr${yrs !== 1 ? 's' : ''})`;

  let bal = initial;
  const md = [{ balance: bal, contributions: initial, interest: 0 }];
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + mRate) + monthly;
    const c = initial + monthly * m;
    md.push({ balance: bal, contributions: c, interest: bal - c });
  }

  const totalC = initial + monthly * months;
  const totalI = bal - totalC;
  const totalR = totalC > 0 ? (totalI / totalC * 100) : 0;

  document.getElementById('metrics').innerHTML = `
    <div class="pf-metric"><div class="pf-metric-label">Total value</div><div class="pf-metric-value green">${fmt(bal)}</div></div>
    <div class="pf-metric"><div class="pf-metric-label">Contributed</div><div class="pf-metric-value">${fmt(totalC)}</div></div>
    <div class="pf-metric"><div class="pf-metric-label">Interest earned</div><div class="pf-metric-value amber">${fmt(totalI)}</div></div>
    <div class="pf-metric"><div class="pf-metric-label">Total return</div><div class="pf-metric-value green">${fmtPct(totalR)}</div></div>
  `;

  const yLabels = [], yVals = [], yC = [];
  for (let y = 0; y <= Math.floor(months / 12); y++) {
    const idx = Math.min(y * 12, months);
    yLabels.push('Yr ' + y);
    yVals.push(Math.round(md[idx].balance));
    yC.push(Math.round(md[idx].contributions));
  }

  const tBody = document.getElementById('yearlyTable');
  tBody.innerHTML = '';
  for (let y = 1; y <= Math.floor(months / 12); y++) {
    const idx = Math.min(y * 12, months);
    const d = md[idx];
    const g = d.contributions > 0 ? (d.interest / d.contributions * 100) : 0;
    tBody.innerHTML += `<tr>
      <td>${y}</td>
      <td>${fmt(d.contributions)}</td>
      <td class="gain">${fmt(d.interest)}</td>
      <td>${fmt(d.balance)}</td>
      <td class="gain">+${fmtPct(g)}</td>
    </tr>`;
  }

  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const tc = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
  const gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  if (growthChart) growthChart.destroy();
  growthChart = new Chart(document.getElementById('growthChart'), {
    type: 'line',
    data: {
      labels: yLabels,
      datasets: [
        {
          label: 'Total value', data: yVals,
          borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.08)',
          fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2
        },
        {
          label: 'Contributions', data: yC,
          borderColor: '#378ADD', backgroundColor: 'rgba(55,138,221,0.06)',
          fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4,
          borderWidth: 1.5, borderDash: [4, 3]
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + fmt(c.raw) } }
      },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, maxTicksLimit: 10, autoSkip: true } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) } }
      }
    }
  });

  if (donutChart) donutChart.destroy();
  const dCtx = document.getElementById('donutChart');
  dCtx.width = 140; dCtx.height = 140;
  donutChart = new Chart(dCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Math.round(totalC), Math.round(Math.max(0, totalI))],
        backgroundColor: ['#378ADD', '#1D9E75'],
        borderWidth: 0, hoverOffset: 4
      }]
    },
    options: {
      responsive: false, maintainAspectRatio: false, cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + fmt(c.raw) } }
      }
    }
  });

  const intPct = totalC + totalI > 0 ? (totalI / (totalC + totalI) * 100) : 0;
  document.getElementById('donut-stats').innerHTML = `
    <div class="donut-stat-label">Principal</div>
    <div class="donut-stat-value">${fmt(totalC)}</div>
    <div class="donut-stat-sub">${fmtPct(100 - intPct)} of portfolio</div>
    <div class="donut-divider" style="margin: 8px 0"></div>
    <div class="donut-stat-label">Interest earned</div>
    <div class="donut-stat-value green">${fmt(totalI)}</div>
    <div class="donut-stat-sub">${fmtPct(intPct)} of portfolio</div>
  `;

  const step = Math.max(1, Math.floor(months / 24));
  const iLabels = [], iData = [];
  for (let m = step; m <= months; m += step) {
    const d = md[m], p = md[m - step];
    iLabels.push('M' + m);
    iData.push(Math.round((d.interest - p.interest) / step));
  }

  if (interestChart) interestChart.destroy();
  interestChart = new Chart(document.getElementById('interestChart'), {
    type: 'bar',
    data: {
      labels: iLabels,
      datasets: [{
        label: 'Avg monthly interest', data: iData,
        backgroundColor: 'rgba(186,117,23,0.7)',
        borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + fmt(c.raw) + '/mo avg' } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 10 }, maxTicksLimit: 12, autoSkip: true } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 11 }, callback: v => '$' + v } }
      }
    }
  });
}

function switchView(view, btn) {
  document.querySelectorAll('.pf-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('view-growth').style.display = view === 'growth' ? '' : 'none';
  document.getElementById('view-breakdown').style.display = view === 'breakdown' ? '' : 'none';
  if (view === 'breakdown') calc();
}

let calcTimer;
function onInput() {
  clearTimeout(calcTimer);
  calcTimer = setTimeout(() => {
    saveInputs();
    calc();
  }, 120);
}

document.addEventListener('DOMContentLoaded', () => {
  loadInputs();
  ['monthly', 'rate', 'months', 'initial'].forEach(id => {
    document.getElementById(id).addEventListener('input', onInput);
  });
  calc();
});
