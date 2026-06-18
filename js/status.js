const TOKEN    = localStorage.getItem('token');
const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';
if (!TOKEN) window.location.href = 'index.html';

let telemetryChart = null;

async function loadTelemetry() {
  const grid = document.getElementById('telemetryGrid');
  grid.innerHTML = '<p class="loading-msg">Loading...</p>';

  try {
    const res = await fetch(`${BASE_URL}/car`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (!data.success) {
      grid.innerHTML = '<p class="error-msg">Failed to load telemetry data.</p>';
      return;
    }

    const t = data.car.telemetry;
    const serviceDate = new Date(t.nextService).toLocaleDateString();

    const items = [
      { label: 'Location',      value: t.location,    unit: ''     },
      { label: 'Speed',         value: t.speed,       unit: 'km/h' },
      { label: 'Engine Temp',   value: t.engineTemp,  unit: '°C'   },
      { label: 'Oil Temp',      value: t.oilTemp,     unit: '°C'   },
      { label: 'Fuel Level',    value: t.fuelLevel,   unit: '%'    },
      { label: 'Next Service',  value: serviceDate,   unit: ''     },
    ];

    grid.innerHTML = items.map(item => `
      <div class="telemetry-item">
        <div class="telemetry-label">${item.label}</div>
        <div class="telemetry-value">${item.value}</div>
        <span class="telemetry-unit">${item.unit}</span>
      </div>
    `).join('');

    renderChart(t);
  } catch {
    grid.innerHTML = '<p class="error-msg">Could not connect to server.</p>';
  }
}

function renderChart(t) {
  const ctx = document.getElementById('telemetryChart').getContext('2d');

  if (telemetryChart) telemetryChart.destroy();

  telemetryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Speed (km/h)', 'Engine Temp (°C)', 'Oil Temp (°C)', 'Fuel Level (%)'],
      datasets: [{
        label: 'Car Telemetry',
        data: [t.speed, t.engineTemp, t.oilTemp, t.fuelLevel],
        backgroundColor: [
          'rgba(99, 179, 237, 0.7)',
          'rgba(252, 129, 74, 0.7)',
          'rgba(246, 173, 85, 0.7)',
          'rgba(104, 211, 145, 0.7)'
        ],
        borderColor: [
          'rgba(99, 179, 237, 1)',
          'rgba(252, 129, 74, 1)',
          'rgba(246, 173, 85, 1)',
          'rgba(104, 211, 145, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#e2e8f0', font: { size: 13 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#a0aec0' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#a0aec0' },
          grid: { color: 'rgba(255,255,255,0.08)' }
        }
      }
    }
  });
}

loadTelemetry();
