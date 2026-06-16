const BASE_URL = 'https://car-essentials-server-project.onrender.com/api';

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  let valid = true;

  const username        = document.getElementById('username').value.trim();
  const email           = document.getElementById('email').value.trim();
  const password        = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const phone           = document.getElementById('phone').value.trim();

  valid = validate('username',        username.length > 0,                          'usernameError') && valid;
  valid = validate('email',           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),    'emailError')    && valid;
  valid = validate('password',        password.length >= 6,                         'passwordError') && valid;
  valid = validate('confirmPassword', password === confirmPassword,                 'confirmError')  && valid;

  if (!valid) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, phone })
    });

    const data = await res.json();

    if (data.success) {
      const msg = document.getElementById('successMsg');
      msg.textContent = '✓ Account created successfully! Redirecting to login...';
      msg.classList.add('visible');
      document.getElementById('registerForm').reset();
      setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    } else {
      const msg = document.getElementById('successMsg');
      msg.textContent = data.message;
      msg.classList.add('visible');
      msg.classList.add('error-text');
    }
  } catch {
    const msg = document.getElementById('successMsg');
    msg.textContent = 'Server error. Please try again.';
    msg.classList.add('visible');
  } finally {
    btn.textContent = 'Create Account';
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
