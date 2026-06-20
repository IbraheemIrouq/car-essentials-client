const TOKEN = localStorage.getItem('token');
if (!TOKEN) window.location.href = 'index.html';

const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';

document.getElementById('supportForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  let valid = true;

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const issue   = document.getElementById('issueType').value;
  const message = document.getElementById('message').value.trim();

  valid = validate('name',      name.length > 0,                           'nameError')    && valid;
  valid = validate('email',     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'emailError')   && valid;
  valid = validate('issueType', issue !== '',                               'issueError')   && valid;
  valid = validate('message',   message.length >= 10,                      'messageError') && valid;

  if (!valid) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    const res  = await fetch(`${BASE_URL}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({ name, email, issueType: issue, message })
    });
    const data = await res.json();
    const msg  = document.getElementById('successMsg');

    if (data.success) {
      msg.textContent = '✓ Your request was submitted! We\'ll get back to you soon.';
      msg.classList.add('visible');
      document.getElementById('supportForm').reset();
      loadTickets();
    } else {
      msg.textContent = data.message || 'Failed to submit request.';
      msg.classList.add('visible');
    }
  } catch {
    const msg = document.getElementById('successMsg');
    msg.textContent = 'Could not connect to server. Please try again.';
    msg.classList.add('visible');
  } finally {
    btn.textContent = 'Submit Request';
    btn.disabled = false;
  }
});

async function loadTickets() {
  const list = document.getElementById('ticketsList');
  list.innerHTML = '<p class="loading-msg">Loading tickets...</p>';

  try {
    const res  = await fetch(`${BASE_URL}/support`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (!data.success) {
      list.innerHTML = '<p class="error-msg">Failed to load tickets.</p>';
      return;
    }

    if (data.tickets.length === 0) {
      list.innerHTML = '<p class="loading-msg">No tickets submitted yet.</p>';
      return;
    }

    list.innerHTML = data.tickets.map(t => {
      const date = new Date(t.createdAt).toLocaleDateString();
      return `
        <div class="ticket-item">
          <div class="ticket-header">
            <div>
              <span class="badge badge-type">${t.issueType}</span>
              <span class="badge ${t.status === 'open' ? 'badge-open' : 'badge-closed'}">${t.status}</span>
            </div>
            <button class="btn btn-red" onclick="deleteTicket('${t._id}')">🗑 Delete</button>
          </div>
          <div class="ticket-meta">Submitted on ${date}</div>
          <div class="ticket-message">${t.message}</div>
        </div>
      `;
    }).join('');
  } catch {
    list.innerHTML = '<p class="error-msg">Could not load tickets.</p>';
  }
}

async function deleteTicket(id) {
  try {
    const res  = await fetch(`${BASE_URL}/support/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    if (data.success) loadTickets();
    else document.getElementById('ticketsList').innerHTML = '<p class="error-msg">Failed to delete ticket.</p>';
  } catch {
    document.getElementById('ticketsList').innerHTML = '<p class="error-msg">Could not connect to server.</p>';
  }
}

function validate(fieldId, condition, errorId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!condition) {
    input.classList.add('input-error');
    error.classList.add('visible');
    return false;
  }
  input.classList.remove('input-error');
  error.classList.remove('visible');
  return true;
}

loadTickets();
