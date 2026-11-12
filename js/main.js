/* ============================================================
   STACKLY — main.js (preloader, nav, animations, utilities)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Preloader (Loader Page per spec) ---------- */
  const pre = document.getElementById('preloader');
  const hidePre = () => {
    if (!pre) return;
    pre.classList.add('done');
    document.body.classList.remove('no-scroll');
    setTimeout(() => pre.remove(), 700);
  };
  if (pre) {
    document.body.classList.add('no-scroll');
    // Spec: 2–5s range, hide as soon as content is interactive
    const started = Date.now();
    const finish = () => {
      const elapsed = Date.now() - started;
      const wait = Math.max(0, 1400 - elapsed); // minimum show time ~1.4s
      setTimeout(hidePre, wait);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    setTimeout(hidePre, 4500); // hard timeout fallback — never infinite
  }

  /* ---------- Navbar scroll state ---------- */
  const nav = document.querySelector('.navbar-stack');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    // scroll progress
    const bar = document.getElementById('scrollProgress');
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    // back to top
    const bt = document.getElementById('backTop');
    if (bt) bt.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile full-screen menu + scroll lock ---------- */
  const burger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const lockBg = () => document.body.classList.add('menu-open');
  const unlockBg = () => document.body.classList.remove('menu-open');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.contains('menu-open');
      open ? unlockBg() : lockBg();
      burger.setAttribute('aria-expanded', String(!open));
    });
    // stagger items
    mobileMenu.querySelectorAll('.m-item').forEach((el, i) => {
      el.style.transitionDelay = (0.06 * i + 0.1) + 's';
    });
    // close on link click
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', unlockBg));
    // close on Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') unlockBg(); });
    // close on resize to desktop
    window.addEventListener('resize', () => { if (window.innerWidth >= 992) unlockBg(); });
  }

  /* ---------- Desktop dropdowns (hover + click + a11y) ---------- */
  document.querySelectorAll('.nav-item-drop').forEach(item => {
    const trigger = item.querySelector('.nav-link-stack');
    const menu = item.querySelector('.dropdown-menu-stack');
    if (!trigger || !menu) return;
    let t;
    const open = () => { clearTimeout(t); menu.classList.add('show'); trigger.setAttribute('aria-expanded', 'true'); };
    const close = () => { t = setTimeout(() => { menu.classList.remove('show'); trigger.setAttribute('aria-expanded', 'false'); }, 120); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    trigger.addEventListener('click', e => {
      e.preventDefault();
      menu.classList.contains('show') ? (menu.classList.remove('show'), trigger.setAttribute('aria-expanded', 'false')) : open();
    });
    menu.addEventListener('mouseenter', open);
    menu.addEventListener('mouseleave', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.classList.remove('show'); trigger.setAttribute('aria-expanded', 'false'); } });
  });

  /* ---------- Mobile sub-menus (accordion) ---------- */
  document.querySelectorAll('[data-msub]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.dataset.msub);
      if (!sub) return;
      const isOpen = sub.classList.contains('open');
      document.querySelectorAll('.m-sub.open').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('[data-msub]').forEach(b => {
        const ic = b.querySelector('.caret'); if (ic) ic.style.transform = '';
      });
      if (!isOpen) {
        sub.classList.add('open');
        const ic = btn.querySelector('.caret'); if (ic) ic.style.transform = 'rotate(180deg)';
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Panels (charts/bars) ---------- */
  const panels = document.querySelectorAll('.panel');
  if ('IntersectionObserver' in window && panels.length) {
    const pio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); pio.unobserve(en.target); }
      });
    }, { threshold: 0.25 });
    panels.forEach(p => pio.observe(p));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCount = el => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.dec | 0);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1800;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const v = target * eased;
      el.textContent = prefix + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  } else counters.forEach(runCount);

  /* ---------- Testimonials slider ---------- */
  const slides = document.querySelectorAll('.testi-slide');
  if (slides.length) {
    const dots = document.querySelectorAll('.tdot');
    let idx = 0, timer;
    const go = i => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === idx));
      dots.forEach((d, k) => d.classList.toggle('on', k === idx));
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 6000); };
    document.getElementById('tPrev')?.addEventListener('click', () => { go(idx - 1); auto(); });
    document.getElementById('tNext')?.addEventListener('click', () => { go(idx + 1); auto(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    auto();
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const ans = item.querySelector('.faq-a');
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });

  /* ---------- Hero parallax (mouse) ---------- */
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.matchMedia('(pointer:fine)').matches) {
    document.querySelector('.hero')?.addEventListener('mousemove', e => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroVisual.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      heroVisual.style.transform = '';
    });
  }

  /* ---------- Newsletter / generic demo forms ---------- */
  document.querySelectorAll('form[data-demo]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      const btn = f.querySelector('button[type=submit]');
      const old = btn ? btn.innerHTML : '';
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...'; btn.disabled = true; }
      setTimeout(() => {
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!'; }
        showToast('Thanks! We will get back to you shortly.', 'ok');
        f.reset();
        setTimeout(() => { if (btn) { btn.innerHTML = old; btn.disabled = false; } }, 2200);
      }, 1100);
    });
  });

  /* ---------- Toast helper ---------- */
  window.showToast = function (msg, type) {
    let t = document.getElementById('globalToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'globalToast';
      t.className = 'toast-auth';
      document.body.appendChild(t);
    }
    t.className = 'toast-auth' + (type === 'err' ? ' err' : '');
    t.innerHTML = `<i class="fa-solid ${type === 'err' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${msg}</span>`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ---------- Back to top ---------- */
  document.getElementById('backTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Active nav link ---------- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link-stack, .f-links a, .side-nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path) a.classList.add('active');
  });
  // dropdown items + their parent triggers
  document.querySelectorAll('.dropdown-menu-stack a, .m-sub a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase().split('#')[0];
    if (href && href === path) {
      a.classList.add('active');
      a.closest('.nav-item-drop')?.querySelector(':scope > .nav-link-stack')?.classList.add('active');
    }
  });

  /* ---------- Marquee duplication (seamless) ---------- */
  document.querySelectorAll('.marquee').forEach(m => {
    m.innerHTML += m.innerHTML;
  });

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Logged-in navbar (hide Log in / Join Now, show user) ---------- */
  const readSession = () => {
    try {
      return JSON.parse(sessionStorage.getItem('stackly_session')) ||
             JSON.parse(localStorage.getItem('stackly_session'));
    } catch { return null; }
  };
  const session = readSession();
  if (session) {
    const first = (session.name || 'Member').split(' ')[0];
    const dash = session.role === 'admin' ? 'admin.html' : 'dashboard.html';

    const doLogout = () => {
      try {
        sessionStorage.removeItem('stackly_session');
        localStorage.removeItem('stackly_session');
      } catch {}
      if (window.showToast) showToast('Logged out successfully. See you soon!', 'ok');
      setTimeout(() => location.replace('index.html'), 700);
    };

    // desktop nav: swap auth buttons for a user chip + logout
    const cta = document.querySelector('.nav-cta');
    if (cta) {
      cta.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach(a => a.remove());
      if (!cta.querySelector('.nav-user')) {
        const chip = document.createElement('a');
        chip.href = dash;
        chip.className = 'nav-user';
        chip.innerHTML = `<span class="nu-avatar">${first.charAt(0).toUpperCase()}</span>${first}`;
        chip.title = 'Open dashboard';
        const out = document.createElement('button');
        out.type = 'button';
        out.className = 'nav-logout';
        out.setAttribute('aria-label', 'Log out');
        out.title = 'Log out';
        out.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
        out.addEventListener('click', doLogout);
        cta.insertBefore(chip, cta.querySelector('.hamburger'));
        cta.insertBefore(out, cta.querySelector('.hamburger'));
      }
    }

    // mobile overlay menu: replace auth CTAs
    const mCta = document.querySelector('.m-cta');
    if (mCta && !mCta.querySelector('[data-mlogout]')) {
      mCta.innerHTML = `
        <div class="nav-user justify-content-center" style="pointer-events:none">
          <span class="nu-avatar">${first.charAt(0).toUpperCase()}</span>${first}
        </div>
        <a href="${dash}" class="btn btn-primary-stack btn-lg"><i class="fa-solid fa-gauge-high"></i> My Dashboard</a>
        <button type="button" class="btn btn-ghost btn-lg" data-mlogout><i class="fa-solid fa-right-from-bracket"></i> Log out</button>`;
      mCta.querySelector('[data-mlogout]')?.addEventListener('click', doLogout);
    }

    // footer quick links + 404 quick links: drop auth entries when signed in
    document.querySelectorAll('.f-links a, .quick-links a').forEach(a => {
      const h = (a.getAttribute('href') || '').toLowerCase();
      if (h === 'login.html' || h === 'signup.html') a.remove();
    });
  }
})();
