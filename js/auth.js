/* ============================================================
   STACKLY — auth.js (login / signup / session management)
   Demo auth backed by localStorage. No backend required.
   ============================================================ */
(function () {
  'use strict';

  const USERS_KEY = 'stackly_users';
  const SESSION_KEY = 'stackly_session';

  /* ---------- storage helpers ---------- */
  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  };
  const saveUsers = u => localStorage.setItem(USERS_KEY, JSON.stringify(u));

  // seed demo accounts once
  (function seed() {
    const users = getUsers();
    const seeds = [
      { name: 'Admin User', email: 'admin@stackly.fit', pass: 'admin123', role: 'admin', phone: '9876543210', goal: 'General Fitness', plan: 'Elite', joined: '2024-01-10' },
      { name: 'Demo Member', email: 'user@stackly.fit', pass: 'user123', role: 'user', phone: '9123456780', goal: 'Strength', plan: 'Performance', joined: '2025-06-15' }
    ];
    seeds.forEach(s => {
      if (!users.some(u => u.email === s.email)) users.push(s);
    });
    saveUsers(users);
  })();

  const getSession = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  };
  const setSession = (user, remember) => {
    const data = { ...user, pass: undefined, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    else localStorage.removeItem(SESSION_KEY);
  };
  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  };

  // export for dashboard/admin pages
  window.StacklyAuth = { getSession, clearSession, getUsers };

  /* ---------- field validation ---------- */
  const setErr = (id, bad) => {
    const f = document.getElementById(id);
    const e = document.getElementById('e-' + id);
    if (!f) return;
    if (f.type === 'checkbox') { if (e) e.classList.toggle('show', bad); return; }
    f.classList.toggle('err', bad);
    if (!bad) f.classList.add('ok');
    if (e) e.classList.toggle('show', bad);
  };

  const markTouched = id => {
    const f = document.getElementById(id);
    if (!f) return;
    const ev = (f.type === 'checkbox' || f.tagName === 'SELECT') ? 'change' : 'blur';
    f.addEventListener(ev, () => validate(id));
    f.addEventListener('input', () => { if (f.classList.contains('err')) validate(id); });
  };

  const V = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    pass: v => v.length >= 6,
    pass8: v => v.length >= 8,
    name: v => v.trim().length >= 3,
    phone: v => v.trim() === '' || /^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10))
  };

  const validators = {
    lEmail: v => V.email(v),
    lPass: v => V.pass(v),
    sName: v => V.name(v),
    sPhone: v => V.phone(v),
    sEmail: v => V.email(v),
    sPass: v => V.pass8(v),
    sTerms: v => v === true
  };

  function validate(id) {
    const f = document.getElementById(id);
    if (!f) return true;
    const val = f.type === 'checkbox' ? f.checked : f.value;
    const ok = validators[id] ? validators[id](val) : true;
    setErr(id, !ok);
    return ok;
  }
  Object.keys(validators).forEach(markTouched);

  /* ---------- password visibility toggle ---------- */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target);
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.innerHTML = `<i class="fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  /* ---------- password strength meter (signup) ---------- */
  const sPass = document.getElementById('sPass');
  if (sPass) {
    sPass.addEventListener('input', () => {
      const v = sPass.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const bar = document.getElementById('pwBar');
      const txt = document.getElementById('pwText');
      const tip = document.getElementById('pwTip');
      if (!bar) return;
      bar.className = 'pw-strength' + (v ? ' s' + Math.max(score, 1) : '');
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      txt.textContent = v ? 'Strength: ' + labels[score] : 'Password strength';
      txt.style.color = score >= 3 ? '#4ade80' : score === 2 ? '#ffd166' : score === 1 ? '#ff6b6b' : '';
      if (tip) tip.textContent = score >= 4 ? 'Great password! 💪' : 'Use 8+ chars, numbers & symbols';
    });
  }

  /* ---------- demo social buttons ---------- */
  document.querySelectorAll('[data-social]').forEach(b => {
    b.addEventListener('click', () => {
      if (window.showToast) showToast(b.dataset.social + ' sign-in is a demo — use the form instead.', 'err');
    });
  });

  /* ---------- forgot password ---------- */
  document.getElementById('forgot')?.addEventListener('click', e => {
    e.preventDefault();
    const email = document.getElementById('lEmail')?.value.trim();
    if (window.showToast) {
      showToast(email && V.email(email)
        ? `Reset link sent to ${email} (demo).`
        : 'Enter your email first, then click forgot password.', email ? 'ok' : 'err');
    }
  });

  /* ---------- LOGIN ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true, first = null;
      ['lEmail', 'lPass'].forEach(id => {
        const r = validate(id);
        if (!r) { ok = false; if (!first) first = document.getElementById(id); }
      });
      if (!ok) { first?.focus(); if (window.showToast) showToast('Please fix the highlighted fields.', 'err'); return; }

      const email = document.getElementById('lEmail').value.trim().toLowerCase();
      const pass = document.getElementById('lPass').value;
      const btn = document.getElementById('lSubmit');
      const old = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in…';

      setTimeout(() => {
        const user = getUsers().find(u => u.email.toLowerCase() === email && u.pass === pass);
        if (!user) {
          btn.disabled = false;
          btn.innerHTML = old;
          setErr('lPass', true);
          const e2 = document.getElementById('e-lPass');
          if (e2) { e2.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid email or password.'; e2.classList.add('show'); }
          if (window.showToast) showToast('Invalid email or password.', 'err');
          return;
        }
        setSession(user, document.getElementById('lRemember')?.checked);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Success! Redirecting…';
        if (window.showToast) showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'ok');
        setTimeout(() => {
          location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
        }, 800);
      }, 900);
    });
  }

  /* ---------- SIGNUP ---------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true, first = null;
      ['sName', 'sEmail', 'sPass', 'sTerms'].forEach(id => {
        const r = validate(id);
        if (!r) { ok = false; if (!first) first = document.getElementById(id); }
      });
      const phone = document.getElementById('sPhone');
      if (phone && !validate('sPhone')) { ok = false; if (!first) first = phone; }

      if (!ok) { first?.focus(); if (window.showToast) showToast('Please fix the highlighted fields.', 'err'); return; }

      const email = document.getElementById('sEmail').value.trim().toLowerCase();
      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        setErr('sEmail', true);
        const e2 = document.getElementById('e-sEmail');
        if (e2) { e2.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> An account with this email already exists.'; e2.classList.add('show'); }
        if (window.showToast) showToast('Account already exists — try logging in.', 'err');
        return;
      }

      const btn = document.getElementById('sSubmit');
      const old = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account…';

      const goalEl = document.querySelector('input[name="goal"]:checked');
      const newUser = {
        name: document.getElementById('sName').value.trim(),
        email,
        pass: document.getElementById('sPass').value,
        phone: (document.getElementById('sPhone')?.value || '').trim(),
        goal: goalEl ? goalEl.value : 'General Fitness',
        role: 'user',
        plan: 'Starter',
        joined: new Date().toISOString().slice(0, 10)
      };

      setTimeout(() => {
        users.push(newUser);
        saveUsers(users);
        setSession(newUser, true);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Account created!';
        if (window.showToast) showToast(`Welcome to Stackly, ${newUser.name.split(' ')[0]}! 🎉`, 'ok');
        setTimeout(() => location.href = 'dashboard.html', 900);
      }, 1000);
    });
  }

  /* ---------- redirect if already logged in ---------- */
  const onAuthPage = /login|signup/i.test(location.pathname);
  if (onAuthPage && getSession()) {
    const s = getSession();
    // only auto-redirect when arriving fresh (not after logout)
    if (!sessionStorage.getItem('stackly_skip_redirect')) {
      location.replace(s.role === 'admin' ? 'admin.html' : 'dashboard.html');
    } else {
      sessionStorage.removeItem('stackly_skip_redirect');
    }
  }
})();
