const TOKEN    = localStorage.getItem('token');
const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';
if (!TOKEN) window.location.href = 'index.html';

const CONTROLS_MAP = [
  { id: 'engine', label: 'Toggle Engine',    iconOn: '🟢', iconOff: '⚙️', valueOn: 'running', valueOff: 'off'    },
  { id: 'ac',     label: 'A/C',              iconOn: '❄️', iconOff: '🔴', valueOn: 'on',      valueOff: 'off'    },
  { id: 'doors',  label: 'Lock/Unlock Doors',iconOn: '🔓', iconOff: '🔒', valueOn: 'unlocked',valueOff: 'locked' },
  { id: 'lights', label: 'Headlights',       iconOn: '☀️', iconOff: '🌙', valueOn: 'on',      valueOff: 'off'    },
  { id: 'trunk',  label: 'Open/Close Trunk', iconOn: '📦', iconOff: '🧳', valueOn: 'open',    valueOff: 'closed' },
];

let currentControls = {};

async function loadControls() 
{
  const grid = document.getElementById('controlsGrid');
  grid.innerHTML = '<p class="loading-msg">Loading controls...</p>';

  try 
  {
    const res = await fetch(`${BASE_URL}/controls`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (!data.success) 
    {
      grid.innerHTML = '<p class="error-msg">Failed to load controls.</p>';
      return;
    }

    currentControls = data.controls;
    renderControls();
  } 
  catch 
  {
    grid.innerHTML = '<p class="error-msg">Could not connect to server.</p>';
  }
}

function renderControls() 
{
  document.getElementById('controlsGrid').innerHTML = CONTROLS_MAP.map((ctrl, i) => {
    const rawValue = ctrl.id === 'ac' ? currentControls.ac?.state : currentControls[ctrl.id];
    const isOn = rawValue === ctrl.valueOn;
    return `
      <div class="control-card ${isOn ? 'active' : ''}" onclick="toggleControl(${i})">
        <h3>${ctrl.label}</h3>
        <div class="control-icon">${isOn ? ctrl.iconOn : ctrl.iconOff}</div>
        <div class="control-status">${isOn ? ctrl.valueOn : ctrl.valueOff}</div>
      </div>
    `;
  }).join('');
}

async function toggleControl(index) 
{
  const ctrl = CONTROLS_MAP[index];
  const rawValue = ctrl.id === 'ac' ? currentControls.ac?.state : currentControls[ctrl.id];
  const isOn = rawValue === ctrl.valueOn;
  const newValue = isOn ? ctrl.valueOff : ctrl.valueOn;
  const controlKey = ctrl.id === 'ac' ? 'ac.state' : ctrl.id;

  try 
  {
    const res = await fetch(`${BASE_URL}/controls`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ control: controlKey, value: newValue })
    });

    const data = await res.json();

    if (data.success) 
    {
      currentControls = data.controls;
      renderControls();
      showToast(`${ctrl.label}: ${newValue}`);
    } 
    else 
    {
      showToast('Failed to update control', 'error');
    }
  } 
  catch 
  {
    showToast('Could not connect to server', 'error');
  }
}

function showToast(message) 
{
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

loadControls();
