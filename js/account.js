const TOKEN = localStorage.getItem('token');
if (!TOKEN) window.location.href = 'index.html';

const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';

async function loadAccount() 
{
  document.getElementById('profileCard').innerHTML = '<p class="loading-msg">Loading...</p>';
  document.getElementById('carCard').innerHTML    = '<p class="loading-msg">Loading...</p>';

  try 
  {
    const [userRes, carRes] = await Promise.all([
      fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${TOKEN}` } }),
      fetch(`${BASE_URL}/car`,     { headers: { 'Authorization': `Bearer ${TOKEN}` } })
    ]);

    const userData = await userRes.json();
    const carData  = await carRes.json();

    if (userData.success) renderProfileCard(userData.user);
    else document.getElementById('profileCard').innerHTML = '<p class="error-msg">Failed to load profile.</p>';

    if (carData.success) renderCarCard(carData.car);
    else document.getElementById('carCard').innerHTML = '<p class="error-msg">Failed to load car info.</p>';

  } 
  catch 
  {
    document.getElementById('profileCard').innerHTML = '<p class="error-msg">Could not connect to server.</p>';
    document.getElementById('carCard').innerHTML    = '<p class="error-msg">Could not connect to server.</p>';
  }
}

function renderProfileCard(u) 
{
  document.getElementById('profileCard').innerHTML = `
    <div class="card-title">👤 profile summary</div>
    <div class="profile-field"><strong>name:</strong>  <span>${u.username}</span></div>
    <div class="profile-field"><strong>email:</strong> <span>${u.email}</span></div>
    <div class="profile-field"><strong>phone:</strong> <span>${u.phone || 'N/A'}</span></div>
    <div class="card-actions">
      <button class="btn btn-yellow" onclick="showEditProfile()">✏️ Edit Profile</button>
    </div>
  `;
  document.getElementById('profileCard').dataset.username = u.username;
  document.getElementById('profileCard').dataset.phone    = u.phone || '';
}

function showEditProfile() 
{
  const card     = document.getElementById('profileCard');
  const username = card.dataset.username;
  const phone    = card.dataset.phone;

  card.innerHTML = `
    <div class="card-title">✏️ edit profile</div>
    <div id="profileMsg"></div>
    <div class="form-group">
      <input type="text" id="editUsername" class="form-input" placeholder="Username">
      <span class="field-error" id="usernameErr">Username is required</span>
    </div>
    <div class="form-group">
      <input type="tel" id="editPhone" class="form-input" placeholder="Phone (optional)">
    </div>
    <div class="btn-row">
      <button class="btn btn-blue"  onclick="saveProfile()">Save</button>
      <button class="btn btn-red"   onclick="loadAccount()">Cancel</button>
    </div>
  `;

  document.getElementById('editUsername').value = username;
  document.getElementById('editPhone').value    = phone;
}

async function saveProfile() 
{
  const username = document.getElementById('editUsername').value.trim();
  const phone    = document.getElementById('editPhone').value.trim();
  const err      = document.getElementById('usernameErr');
  const msg      = document.getElementById('profileMsg');

  if (!username) 
  {
    document.getElementById('editUsername').classList.add('input-error');
    err.classList.add('visible');
    return;
  }
  document.getElementById('editUsername').classList.remove('input-error');
  err.classList.remove('visible');

  try 
  {
    const res  = await fetch(`${BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({ username, phone })
    });
    const data = await res.json();

    if (data.success) 
    {
      showToast('Profile updated successfully');
      loadAccount();
    } 
    else 
    {
      msg.textContent = data.message || 'Failed to update profile.';
      msg.className   = 'error-msg';
    }
  } 
  catch 
  {
    msg.textContent = 'Could not connect to server.';
    msg.className   = 'error-msg';
  }
}

function renderCarCard(c) 
{
  document.getElementById('carCard').innerHTML = `
    <div class="card-title">🚗 my car</div>
    <div class="profile-field"><strong>brand:</strong>         <span>${c.brand}</span></div>
    <div class="profile-field"><strong>model:</strong>         <span>${c.model}</span></div>
    <div class="profile-field"><strong>year:</strong>          <span>${c.year}</span></div>
    <div class="profile-field"><strong>license plate:</strong> <span>${c.licensePlate}</span></div>
    <div class="card-actions">
      <button class="btn btn-yellow" onclick="showEditCar()">✏️ Edit Car</button>
    </div>
  `;
  const card = document.getElementById('carCard');
  card.dataset.brand   = c.brand;
  card.dataset.model   = c.model;
  card.dataset.year    = c.year;
  card.dataset.plate   = c.licensePlate;
}

function showEditCar() 
{
  const card  = document.getElementById('carCard');
  const brand = card.dataset.brand;
  const model = card.dataset.model;
  const year  = card.dataset.year;
  const plate = card.dataset.plate;

  card.innerHTML = `
    <div class="card-title">✏️ edit car</div>
    <div id="carMsg"></div>
    <div class="form-group">
      <input type="text"   id="editBrand" class="form-input" placeholder="Brand">
    </div>
    <div class="form-group">
      <input type="text"   id="editModel" class="form-input" placeholder="Model">
    </div>
    <div class="form-group">
      <input type="number" id="editYear"  class="form-input" placeholder="Year">
    </div>
    <div class="form-group">
      <input type="text"   id="editPlate" class="form-input" placeholder="License Plate">
    </div>
    <div class="btn-row">
      <button class="btn btn-blue" onclick="saveCar()">Save</button>
      <button class="btn btn-red"  onclick="loadAccount()">Cancel</button>
    </div>
  `;

  document.getElementById('editBrand').value = brand;
  document.getElementById('editModel').value = model;
  document.getElementById('editYear').value  = year;
  document.getElementById('editPlate').value = plate;
}

async function saveCar() 
{
  const brand        = document.getElementById('editBrand').value.trim();
  const model        = document.getElementById('editModel').value.trim();
  const year         = parseInt(document.getElementById('editYear').value);
  const licensePlate = document.getElementById('editPlate').value.trim();
  const msg          = document.getElementById('carMsg');

  try 
  {
    const res  = await fetch(`${BASE_URL}/car`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({ brand, model, year, licensePlate })
    });
    const data = await res.json();

    if (data.success) 
    {
      showToast('Car info updated successfully');
      loadAccount();
    } 
    else 
    {
      msg.textContent = data.message || 'Failed to update car.';
      msg.className   = 'error-msg';
    }
  } 
  catch 
  {
    msg.textContent = 'Could not connect to server.';
    msg.className   = 'error-msg';
  }
}

function showToast(message) 
{
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

loadAccount();
