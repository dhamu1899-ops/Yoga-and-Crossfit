/* ============================================================
   STACKLY — admin.js (admin dashboard logic)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Auth gate (admin only) ---------- */
  const Auth = window.StacklyAuth || {};
  const session = (Auth.getSession && Auth.getSession()) || null;
  if (!session) { location.replace('login.html'); return; }
  if (session.role !== 'admin') { location.replace('dashboard.html'); return; }

  document.body.classList.remove('no-scroll');

  const first = (session.name || 'Admin').split(' ')[0];
  const t1 = document.getElementById('aNameSide'); if (t1) t1.textContent = session.name || 'Admin';
  const t2 = document.getElementById('aNameTop'); if (t2) t2.textContent = session.name || 'Admin';
  const aw = document.getElementById('adminWelcome');
  if (aw) aw.textContent = `Studio Report, ${first} 📊`;

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

  /* ---------- Sidebar (mobile) ---------- */
  const side = document.getElementById('side');
  const ov = document.getElementById('sideOverlay');
  const closeSide = () => { side?.classList.remove('open'); ov?.classList.remove('show'); document.body.classList.remove('no-scroll'); };
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    side?.classList.add('open'); ov?.classList.add('show'); document.body.classList.add('no-scroll');
  });
  ov?.addEventListener('click', closeSide);
  side?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.innerWidth < 1200) closeSide(); }));

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
    toast('Admin logged out.');
    setTimeout(() => location.replace('index.html'), 900);
  });

  /* ---------- Modal helpers ---------- */
  const openModal = id => document.getElementById(id)?.classList.add('show');
  const closeModal = id => document.getElementById(id)?.classList.remove('show');
  document.querySelectorAll('.modal-backdrop-stack').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
    m.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => m.classList.remove('show')));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop-stack.show').forEach(m => m.classList.remove('show'));
  });
  document.getElementById('notifBtn')?.addEventListener('click', () => openModal('notifModal'));

  /* ---------- Members data ---------- */
  let members = [
    { name: 'Rahul Verma', email: 'rahul.v@mail.com', plan: 'Performance', joined: 'Jun 15, 2025', sessions: 86, status: 'active', img: 12 },
    { name: 'Priya Sharma', email: 'priya.s@mail.com', plan: 'Elite', joined: 'Mar 02, 2025', sessions: 124, status: 'active', img: 44 },
    { name: 'Karthik Iyer', email: 'karthik.i@mail.com', plan: 'Performance', joined: 'Jan 20, 2025', sessions: 97, status: 'active', img: 52 },
    { name: 'Ananya Rao', email: 'ananya.r@mail.com', plan: 'Starter', joined: 'Sep 11, 2026', sessions: 12, status: 'pending', img: 25 },
    { name: 'Vignesh Kumar', email: 'vignesh.k@mail.com', plan: 'Starter', joined: 'Oct 28, 2026', sessions: 5, status: 'pending', img: 15 },
    { name: 'Meera Joshi', email: 'meera.j@mail.com', plan: 'Elite', joined: 'Feb 14, 2025', sessions: 142, status: 'active', img: 47 },
    { name: 'Suresh Babu', email: 'suresh.b@mail.com', plan: 'Starter', joined: 'Aug 03, 2026', sessions: 9, status: 'inactive', img: 33 },
    { name: 'Kavya Nair', email: 'kavya.n@mail.com', plan: 'Performance', joined: 'Nov 11, 2026', sessions: 1, status: 'active', img: 49 }
  ];

  const rowsEl = document.getElementById('memberRows');
  const countEl = document.getElementById('memberCount');

  const renderMembers = () => {
    if (!rowsEl) return;
    const q = (document.getElementById('memberFilter')?.value || '').toLowerCase();
    const st = document.getElementById('statusFilter')?.value || '';
    const list = members.filter(m =>
      (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.plan.toLowerCase().includes(q)) &&
      (!st || m.status === st)
    );
    rowsEl.innerHTML = list.map((m, i) => `
      <tr data-idx="${members.indexOf(m)}">
        <td><div class="cell-user">
          <img src="assets/img/avatar-${m.img}.webp" alt="${m.name}">
          <div><b>${m.name}</b><span>${m.email}</span></div>
        </div></td>
        <td><span class="pill info">${m.plan}</span></td>
        <td>${m.joined}</td>
        <td><b class="font-h">${m.sessions}</b></td>
        <td><span class="pill ${m.status}">${m.status}</span></td>
        <td><div class="row-actions">
          <button class="mini-btn act-view" title="View"><i class="fa-regular fa-eye"></i></button>
          <button class="mini-btn act-toggle" title="Toggle status"><i class="fa-solid fa-arrows-rotate"></i></button>
          <button class="mini-btn danger act-del" title="Remove"><i class="fa-regular fa-trash-can"></i></button>
        </div></td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:34px">No members match your filters.</td></tr>`;
    if (countEl) countEl.textContent = `Showing ${list.length} of ${members.length} members`;

    rowsEl.querySelectorAll('.act-view').forEach(b => b.addEventListener('click', e => {
      const idx = +e.target.closest('tr').dataset.idx;
      toast(`Opening profile: ${members[idx].name}`);
    }));
    rowsEl.querySelectorAll('.act-toggle').forEach(b => b.addEventListener('click', e => {
      const idx = +e.target.closest('tr').dataset.idx;
      const order = ['active', 'pending', 'inactive'];
      members[idx].status = order[(order.indexOf(members[idx].status) + 1) % 3];
      renderMembers();
      toast(`${members[idx].name} → ${members[idx].status}`);
    }));
    rowsEl.querySelectorAll('.act-del').forEach(b => b.addEventListener('click', e => {
      const idx = +e.target.closest('tr').dataset.idx;
      const name = members[idx].name;
      if (confirm(`Remove ${name} from the member list?`)) {
        members.splice(idx, 1);
        renderMembers();
        toast(`${name} removed.`, true);
      }
    }));
  };
  renderMembers();
  document.getElementById('memberFilter')?.addEventListener('input', renderMembers);
  document.getElementById('statusFilter')?.addEventListener('change', renderMembers);

  /* ---------- Classes data ---------- */
  let classes = [
    { name: 'CrossFit Engine', time: '6:30 AM', coach: 'Coach Arjun', booked: 16, cap: 16 },
    { name: 'Vinyasa Flow Yoga', time: '7:00 AM', coach: 'Coach Meera', booked: 12, cap: 16 },
    { name: 'Strength Lab', time: '6:00 PM', coach: 'Coach Daniel', booked: 10, cap: 14 },
    { name: 'HIIT Inferno', time: '7:15 PM', coach: 'Coach Sofia', booked: 14, cap: 16 },
    { name: 'Breathwork & Recovery', time: '8:30 PM', coach: 'Coach Meera', booked: 7, cap: 16 }
  ];

  const classRows = document.getElementById('classRows');
  const renderClasses = () => {
    if (!classRows) return;
    classRows.innerHTML = classes.map((c, i) => {
      const full = c.booked >= c.cap;
      return `<tr>
        <td><b class="font-h">${c.name}</b></td>
        <td><span class="sched-time" style="min-width:auto;display:inline-block;padding:6px 11px;font-size:12px">${c.time}</span></td>
        <td style="color:var(--muted)">${c.coach}</td>
        <td><span class="pill ${full ? 'pending' : 'active'}">${c.booked}/${c.cap}</span></td>
        <td><div class="row-actions">
          <button class="mini-btn cls-edit" data-i="${i}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="mini-btn danger cls-del" data-i="${i}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div></td>
      </tr>`;
    }).join('');

    classRows.querySelectorAll('.cls-edit').forEach(b => b.addEventListener('click', () => {
      const c = classes[+b.dataset.i];
      c.booked = c.booked >= c.cap ? c.cap - 1 : c.booked + 1;
      renderClasses();
      toast(`${c.name}: ${c.booked}/${c.cap} booked`);
    }));
    classRows.querySelectorAll('.cls-del').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      const name = classes[i].name;
      if (confirm(`Delete "${name}" from the schedule?`)) {
        classes.splice(i, 1);
        renderClasses();
        toast(`${name} removed from schedule.`, true);
      }
    }));
  };
  renderClasses();

  /* ---------- Add member ---------- */
  ['addMemberBtn', 'addMemberBtn2'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => openModal('memberModal')));

  document.getElementById('memberForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('mName');
    const email = document.getElementById('mEmail');
    let ok = true;
    const check = (el, valid) => {
      el.classList.toggle('err', !valid);
      document.getElementById('e-' + el.id)?.classList.toggle('show', !valid);
      if (!valid) ok = false;
    };
    check(name, name.value.trim().length >= 3);
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()));
    if (!ok) { toast('Please fix the highlighted fields.', true); return; }

    members.unshift({
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      plan: document.getElementById('mPlan').value,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      sessions: 0,
      status: document.getElementById('mStatus').value,
      img: [12,44,52,25,15,47,33,49,68][Math.floor(Math.random() * 9)]
    });
    e.target.reset();
    closeModal('memberModal');
    renderMembers();
    toast(`${members[0].name} added successfully.`);
  });

  /* ---------- Add class ---------- */
  ['addClassBtn', 'addClassBtn2'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => openModal('classModal')));

  document.getElementById('classForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('kName');
    const time = document.getElementById('kTime');
    let ok = true;
    [[name, name.value.trim().length >= 3], [time, time.value.trim().length >= 2]].forEach(([el, valid]) => {
      el.classList.toggle('err', !valid);
      document.getElementById('e-' + el.id)?.classList.toggle('show', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { toast('Please fix the highlighted fields.', true); return; }

    classes.push({
      name: name.value.trim(),
      time: time.value.trim(),
      coach: document.getElementById('kCoach').value,
      booked: 0,
      cap: +document.getElementById('kCap').value || 16
    });
    e.target.reset();
    document.getElementById('kCap').value = 16;
    closeModal('classModal');
    renderClasses();
    toast(`"${classes[classes.length - 1].name}" scheduled.`);
  });

  /* ---------- Messages ---------- */
  document.querySelectorAll('.msg-reply').forEach(b => b.addEventListener('click', () => toast('Opening mail composer… (demo)')));
  document.querySelectorAll('.msg-done').forEach(b => b.addEventListener('click', e => {
    const item = e.target.closest('.feed-item');
    item.style.opacity = '.45';
    b.disabled = true; b.textContent = 'Read ✓';
    toast('Message marked as read.');
  }));

  /* ---------- Misc ---------- */
  document.getElementById('avatarBtn')?.addEventListener('click', () => toast(`Signed in as ${session.email} (admin)`));
  document.getElementById('adminSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = e.target.value.trim();
      if (v) {
        document.getElementById('memberFilter').value = v;
        renderMembers();
        document.getElementById('members')?.scrollIntoView({ behavior: 'smooth' });
        toast(`Filtered members by “${v}”`);
      }
    }
  });

  /* ---------- Charts animation ---------- */
  setTimeout(() => {
    document.querySelectorAll('.bar').forEach(b => { b.style.height = (b.dataset.h || 50) + '%'; });
    document.querySelectorAll('.donut .val-c').forEach(c => {
      if (c.dataset.dash) c.setAttribute('stroke-dasharray', c.dataset.dash);
      if (c.dataset.rotate) c.style.transform = `rotate(${c.dataset.rotate}deg)`, c.style.transformOrigin = 'center';
    });
  }, 450);
  document.querySelectorAll('.panel').forEach(p => p.classList.add('in'));

  /* ---------- Reveal ---------- */
  setTimeout(() => document.querySelectorAll('.reveal').forEach(r => r.classList.add('in')), 200);
})();
