// public/js/auth.js

// ===== UTILS =====
async function requestWithSpinner({ url, options, btn, spinner }) {
  btn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const res = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await res.json();
    return data;
  } finally {
    spinner.classList.add('hidden');
    btn.disabled = false;
  }
}

// ===== SIGNUP =====
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  const sendBtn    = document.getElementById('send-code-btn');
  const sendSpin   = document.getElementById('send-spinner');
  const verifySec  = document.getElementById('verify-section');
  const verifyBtn  = document.getElementById('verify-btn');
  const verifySpin = document.getElementById('verify-spinner');
  const errSign    = document.getElementById('signup-error');
  const errVer     = document.getElementById('verify-error');

  sendBtn.addEventListener('click', async () => {
    errSign.textContent = '';

    const fd = new FormData(signupForm);
    if (fd.get('password') !== fd.get('confirmPassword')) {
      errSign.textContent = 'Passwords do not match';
      return;
    }

    const payload = {
      firstName: fd.get('firstName'),
      lastName:  fd.get('lastName'),
      phone:     fd.get('phone'),
      email:     fd.get('email'),
      password:  fd.get('password')
    };

    const data = await requestWithSpinner({
      url: '/api/signup',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      btn: sendBtn,
      spinner: sendSpin
    });

    if (data.status === 'code-sent') {
      signupForm.querySelectorAll('input').forEach(i => {
        if (i.id !== 'code') {
          i.disabled = true;
          i.classList.add('opacity-50');
        }
      });
      verifySec.classList.remove('hidden');
      sendBtn.textContent = 'Resend Code';
    } else {
      errSign.textContent = data.error || 'Signup failed';
    }
  });

  verifyBtn.addEventListener('click', async () => {
    errVer.textContent = '';
    const code = signupForm.code.value.trim();
    if (!code) {
      errVer.textContent = 'Enter verification code';
      return;
    }

    const data = await requestWithSpinner({
      url: '/api/verify',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      },
      btn: verifyBtn,
      spinner: verifySpin
    });

    if (data.status === 'pendingActivation') {
      // اگر حساب غیرفعال است، کاربر را به /login هدایت می‌کنیم
      // و شماره و رمز عبور را در Query String URL می‌فرستیم
      const phone = encodeURIComponent(data.phone);
      const password = encodeURIComponent(data.password);
      window.location.href = `/login?phone=${phone}&password=${password}`;
    } else if (data.status === 'verified') {
      // **فقط اگر در آینده خواستید حساب خودکار فعال شود، این مسیر برقرار بماند**
      window.location.href = '/';
    } else {
      errVer.textContent = data.error || 'Verification failed';
    }
  });
}

// ===== LOGIN =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
  const loginBtn  = document.getElementById('login-btn');
  const loginSpin = document.getElementById('login-spinner');
  const errLogin  = document.getElementById('login-error');

  // ‟Prefill” fields from query parameters if وجود داشته باشند
  const urlParams = new URLSearchParams(window.location.search);
  const prefPhone = urlParams.get('phone');
  const prefPass  = urlParams.get('password');
  if (prefPhone) {
    document.querySelector('input[name="phone"]').value = prefPhone;
  }
  if (prefPass) {
    document.querySelector('input[name="password"]').value = prefPass;
  }

  loginBtn.addEventListener('click', async () => {
    errLogin.textContent = '';
    const fd = new FormData(loginForm);
    const data = await requestWithSpinner({
      url: '/api/login',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fd.get('phone'),
          password: fd.get('password')
        })
      },
      btn: loginBtn,
      spinner: loginSpin
    });
    if (data.status === 'ok') {
      window.location.href = '/';
    } else {
      errLogin.textContent = data.error || 'Login failed';
    }
  });
}
