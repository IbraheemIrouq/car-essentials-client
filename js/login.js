const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const emailVal = document.getElementById('email').value.trim();
  const passVal  = document.getElementById('password').value;
  let valid = true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  valid = validate('email',    emailRegex.test(emailVal), 'emailError')    && valid;
  valid = validate('password', passVal.length > 0,        'passwordError') && valid;

  if (!valid) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal, password: passVal })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const msg = document.getElementById('successMsg');
      msg.textContent = '✓ Login successful! Redirecting...';
      msg.classList.add('visible');
      setTimeout(() => { window.location.href = 'home.html'; }, 1200);
    } else {
      showFieldError('passwordError', data.message);
    }
  } catch {
    showFieldError('passwordError', 'Server error. Please try again.');
  } finally {
    btn.textContent = 'login';
    btn.disabled = false;
  }
});

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

function showFieldError(errorId, message) {
  const error = document.getElementById(errorId);
  error.textContent = message;
  error.classList.add('visible');
}
