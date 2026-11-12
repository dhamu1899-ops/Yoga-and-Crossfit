/* ============================================================
   STACKLY — contact.js (validated contact form)
   ============================================================ */
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const rules = {
    cName: v => v.trim().length >= 3,
    cEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    cPhone: v => v.trim() === '' || /^(\+91[- ]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')) || /^[\d]{10,15}$/.test(v.replace(/\D/g, '')),
    cSubject: v => v !== '',
    cMsg: v => v.trim().length >= 10,
    cAgree: v => v === true
  };

  const showErr = (id, bad) => {
    const f = document.getElementById(id);
    const e = document.getElementById('e-' + id);
    if (!f) return;
    if (f.type === 'checkbox') { if (e) e.classList.toggle('show', bad); return; }
    f.classList.toggle('err', bad);
    if (!bad) f.classList.add('ok');
    if (e) e.classList.toggle('show', bad);
  };

  const validateField = id => {
    const f = document.getElementById(id);
    if (!f) return true;
    const val = f.type === 'checkbox' ? f.checked : f.value;
    const ok = rules[id] ? rules[id](val) : true;
    showErr(id, !ok);
    return ok;
  };

  // live validation after first touch
  Object.keys(rules).forEach(id => {
    const f = document.getElementById(id);
    if (!f) return;
    const ev = (f.tagName === 'SELECT' || f.type === 'checkbox') ? 'change' : 'blur';
    f.addEventListener(ev, () => validateField(id));
    f.addEventListener('input', () => {
      if (f.classList.contains('err') || (f.id === 'cAgree' && document.getElementById('e-cAgree')?.classList.contains('show'))) validateField(id);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    Object.keys(rules).forEach(id => {
      const ok = validateField(id);
      if (!ok && !firstBad) firstBad = document.getElementById(id);
    });

    if (firstBad) {
      firstBad.focus({ preventScroll: false });
      if (window.showToast) showToast('Please fix the highlighted fields.', 'err');
      return;
    }

    const btn = document.getElementById('cSubmit');
    const old = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';

    // demo submit (no backend) — simulate API call
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      if (window.showToast) showToast('Thanks! A coach will reach out within 24 hours.', 'ok');
      form.reset();
      document.querySelectorAll('.input-stack').forEach(i => i.classList.remove('ok', 'err'));
      document.querySelectorAll('.field-err').forEach(i => i.classList.remove('show'));
      setTimeout(() => { btn.innerHTML = old; btn.disabled = false; }, 2600);
    }, 1300);
  });
})();
