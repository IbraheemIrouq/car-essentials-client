const TOKEN = localStorage.getItem('token');
if (!TOKEN) window.location.href = 'index.html';

const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';
let currentCity = 'Tel Aviv';

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

document.getElementById('gasBtn').addEventListener('click', () => {
  const toast = document.getElementById('gasToast');
  toast.classList.remove('hidden');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.classList.add('hidden');
        const { latitude, longitude } = pos.coords;
        window.open(`https://www.google.com/maps/search/gas+station/@${latitude},${longitude},15z`, '_blank');
      },
      () => {
        toast.classList.add('hidden');
        window.open('https://www.google.com/maps/search/gas+station', '_blank');
      }
    );
  } else {
    toast.classList.add('hidden');
    window.open('https://www.google.com/maps/search/gas+station', '_blank');
  }
});

async function loadCarStatus() {
  const list = document.getElementById('statusList');
  list.innerHTML = '<li>Loading...</li>';

  try {
    const res = await fetch(`${BASE_URL}/car`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (!data.success) {
      list.innerHTML = '<li>Failed to load car status.</li>';
      return;
    }

    const s = data.car.status;
    const items = [
      { icon: '🚗', label: 'Engine', value: s.engine },
      { icon: '❄️', label: 'A/C',    value: `${s.ac.state} (${s.ac.temperature}°C, ${s.ac.mode})` },
      { icon: '🚪', label: 'Doors',  value: s.doors },
      { icon: '💡', label: 'Lights', value: s.lights },
      { icon: '🧳', label: 'Trunk',  value: s.trunk },
    ];

    list.innerHTML = items.map(item =>
      `<li><span>${item.icon}</span> <strong>${item.label}:</strong> ${item.value}</li>`
    ).join('');

    currentCity = data.car.telemetry?.location || 'Tel Aviv';
    loadWeather(currentCity);
  } catch {
    list.innerHTML = '<li>Could not connect to server.</li>';
    document.getElementById('weatherContent').innerHTML = '<p class="error-msg">Could not load weather.</p>';
  }
}

async function loadWeather(city) {
  const content = document.getElementById('weatherContent');
  try {
    const res = await fetch(`${BASE_URL}/weather?city=${encodeURIComponent(city)}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (!data.success) {
      content.innerHTML = '<p class="error-msg">Failed to load weather data.</p>';
      return;
    }

    const w = data.weather;
    const condClass = w.drivingCondition === 'good' ? 'condition-good' : 'condition-caution';

    content.innerHTML = `
      <div class="profile-field"><strong>📍 City:</strong> <span>${w.city}</span></div>
      <div class="profile-field"><strong>🌡 Temperature:</strong> <span>${w.temperature}°C</span></div>
      <div class="profile-field"><strong>💨 Wind Speed:</strong> <span>${w.windSpeed} km/h</span></div>
      <div class="profile-field"><strong>🚦 Driving Condition:</strong> <span class="${condClass}">${w.drivingCondition}</span></div>
      <div class="profile-field"><strong>💬 Advice:</strong> <span>${w.advice}</span></div>
    `;
    document.getElementById('refreshWeatherBtn').classList.remove('hidden');
  } catch {
    content.innerHTML = '<p class="error-msg">Could not load weather data.</p>';
  }
}

document.getElementById('refreshWeatherBtn').addEventListener('click', () => {
  document.getElementById('weatherContent').innerHTML = '<p class="loading-msg">Refreshing...</p>';
  loadWeather(currentCity);
});

loadCarStatus();
