/* ============================================================
   STACKLY — dashboard.js (user dashboard logic)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Auth gate ---------- */
  const Auth = window.StacklyAuth || {};
  const session = (Auth.getSession && Auth.getSession()) || null;
  if (!session) { location.replace('login.html'); return; }
  if (session.role === 'admin') { location.replace('admin.html'); return; }

  document.body.classList.remove('no-scroll');

  /* ---------- Greeting ---------- */
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const first = (session.name || 'Athlete').split(' ')[0];
  const wt = document.getElementById('welcomeTitle');
  if (wt) wt.textContent = `${greet}, ${first} 👋`;
  const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  setTxt('uNameSide', session.name || 'Member');
  setTxt('uNameTop', session.name || 'Member');
  setTxt('uPlanSide', (session.plan || 'Starter') + ' plan');

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById('dashToast');
  const toast = (msg, err) => {
    if (!toastEl) return;
    toastEl.className = 'dash-toast' + (err ? ' err' : '');
    toastEl.querySelector('i').className = 'fa-solid ' + (err ? 'fa-circle-exclamation' : 'fa-circle-check');
    toastEl.querySelector('span').textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 3000);
  };
  window.dashToast = toast;

  /* ---------- Sidebar (mobile) ---------- */
  const side = document.getElementById('side');
  const ov = document.getElementById('sideOverlay');
  const closeSide = () => { side?.classList.remove('open'); ov?.classList.remove('show'); document.body.classList.remove('no-scroll'); };
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    side?.classList.add('open'); ov?.classList.add('show'); document.body.classList.add('no-scroll');
  });
  ov?.addEventListener('click', closeSide);
  side?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.innerWidth < 1200) closeSide(); }));

  /* ---------- Side nav active state ---------- */
  const sideLinks = document.querySelectorAll('.side-nav a[href^="#"]');
  sideLinks.forEach(l => l.addEventListener('click', () => {
    sideLinks.forEach(x => x.classList.remove('on'));
    l.classList.add('on');
    const title = l.textContent.trim().replace(/\d+$/, '').trim();
    const t = document.querySelector('.topbar h4'); if (t) t.textContent = title;
  }));

  /* ---------- Logout ---------- */
  document.getElementById('logoutBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (Auth.clearSession) Auth.clearSession();
    toast('Logged out successfully. See you soon!');
    setTimeout(() => location.replace('index.html'), 900);
  });

  /* ---------- Goal bars ---------- */
  document.querySelectorAll('.goal-fill').forEach(f => {
    setTimeout(() => { f.style.width = (f.dataset.w || 0) + '%'; }, 450);
  });

  /* ---------- Heatmap ---------- */
  const heat = document.getElementById('heat');
  if (heat) {
    const levels = [0, 0, 1, 0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 3, 0, 1, 2,
      0, 3, 4, 1, 0, 2, 3, 1, 4, 0, 2, 1, 3, 0, 4, 2, 1, 0, 3, 2,
      4, 1, 0, 3, 2, 4, 1, 3, 0, 2, 4, 3, 1, 0, 2, 4, 3, 2, 1, 0,
      4, 3, 2, 1, 0, 4, 3, 2, 1, 4, 3, 0, 2, 4, 3, 1, 0, 2, 4, 3,
      1, 2, 4, 3, 0, 1, 2, 4, 3, 4, 2, 1];
    levels.forEach((lv, i) => {
      const cell = document.createElement('i');
      if (lv) cell.className = 'l' + lv;
      cell.title = lv ? `${lv * 20 + 20} min trained` : 'Rest day';
      cell.style.transitionDelay = (i * 6) + 'ms';
      heat.appendChild(cell);
    });
  }

  /* ---------- Notifications modal ---------- */
  const nm = document.getElementById('notifModal');
  document.getElementById('notifBtn')?.addEventListener('click', () => nm?.classList.add('show'));
  nm?.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => nm.classList.remove('show')));
  nm?.addEventListener('click', e => { if (e.target === nm) nm.classList.remove('show'); });

  /* ---------- Search ---------- */
  document.getElementById('dashSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = e.target.value.trim();
      toast(q ? `Searching for “${q}”… (demo)` : 'Type something to search.', !q);
    }
  });

  /* ---------- Demo actions ---------- */
  const demo = (id, msg) => document.getElementById(id)?.addEventListener('click', () => toast(msg));
  demo('bookBtn', 'Opening class picker… (demo)');
  demo('upgradeBtn', 'Upgrade request sent — our team will call you.');
  demo('freezeBtn', 'Membership freeze scheduled for next cycle.');
  document.getElementById('avatarBtn')?.addEventListener('click', () => toast(`Logged in as ${session.email}`));

  /* ---------- Reveal trigger for dashboard (no IO delay) ---------- */
  setTimeout(() => document.querySelectorAll('.reveal').forEach(r => r.classList.add('in')), 200);
})();
