/* ============================================================
   Nova Dev — Main JavaScript
   Form handler using Web3Forms API + UI interactions
   ============================================================ */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────
  //  ⚙️  WEB3FORMS ACCESS KEY
  //  Get your FREE key at: https://web3forms.com/
  //  Enter your email → they send you a key → paste it below
  // ─────────────────────────────────────────────────────────
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // ← replace this

  // ── Smooth Scroll ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Form Submission Handler ────────────────────────────────
  const form       = document.getElementById('auditForm');
  const btnSubmit  = form ? form.querySelector('.btn-submit') : null;
  const successMsg = document.getElementById('successMsg');
  const errorMsg   = document.getElementById('errorMsg');

  if (form && btnSubmit) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Reset messages
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg)   errorMsg.style.display   = 'none';

      // Button loading state
      btnSubmit.disabled    = true;
      const originalText    = btnSubmit.textContent;
      btnSubmit.textContent = '⏳ Sending…';

      // Collect form data
      const fname   = form.fname.value.trim();
      const lname   = form.lname.value.trim();
      const email   = form.email.value.trim();
      const company = form.company.value.trim();
      const website = form.website.value.trim();
      const phone   = form.phone   ? form.phone.value.trim()   : '';
      const service = form.service ? form.service.value        : '';
      const message = form.message ? form.message.value.trim() : '';

      // Client-side validation
      if (!fname || !email || !company || !website || !service) {
        showError('⚠️ Please fill in all required fields.');
        resetButton(btnSubmit, originalText);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('⚠️ Please enter a valid email address.');
        resetButton(btnSubmit, originalText);
        return;
      }

      try {
        const payload = {
          access_key:  WEB3FORMS_ACCESS_KEY,
          subject:     '🚀 New Free Audit Request — Nova Dev',
          from_name:   'Nova Dev Website',
          replyto:     email,
          name:        fname + ' ' + lname,
          email:       email,
          company:     company,
          website:     website,
          phone:       phone,
          service:     service,
          message:     message || '(no message)',
          botcheck:    ''      // honeypot — must be empty
        };

        const response = await fetch('https://api.web3forms.com/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          // ✅ Success → redirect to thank-you page
          window.location.href = '/thank-you';
        } else {
          showError('⚠️ ' + (result.message || 'Something went wrong. Please try again.'));
          resetButton(btnSubmit, originalText);
        }

      } catch (err) {
        console.error('Form error:', err);
        showError('⚠️ Network error. Please check your connection or email us at <strong>admin@novatvhub.com</strong>');
        resetButton(btnSubmit, originalText);
      }
    });
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.innerHTML     = msg;
      errorMsg.style.display = 'block';
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function resetButton(btn, text) {
    btn.disabled    = false;
    btn.textContent = text;
  }

  // ── Stats Counter Animation ────────────────────────────────
  const stats    = document.querySelectorAll('.stat .num');
  let   animated = false;

  function animateCounters() {
    if (animated) return;
    stats.forEach(stat => {
      const rect = stat.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animated = true;
        const text = stat.textContent;
        if      (text.includes('+')) animateCount(stat, 0, parseInt(text), 1500, '+');
        else if (text.includes('%')) animateCount(stat, 0, parseInt(text), 1500, '%');
        else if (text.includes('×')) animateCount(stat, 0, parseInt(text), 1500, '×');
        else if (text.includes('h')) animateCount(stat, 0, parseInt(text), 1500, 'h');
      }
    });
  }

  function animateCount(el, start, end, duration, suffix) {
    const increment = (end - start) / (duration / 16);
    let   current   = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { el.textContent = end + suffix; clearInterval(timer); }
      else                  el.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

})();
