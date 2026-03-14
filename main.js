/* ============================================================
   Nova Dev — Main JavaScript
   Form handler + UI interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Audit Form Handler ── */
  var form       = document.getElementById('auditForm');
  var successMsg = document.getElementById('successMsg');
  var errorMsg   = document.getElementById('errorMsg');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('.btn-submit');
    var originalBtnText = btn.innerHTML;

    // Reset previous messages
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';
    btn.innerHTML  = '⏳ Sending your request…';
    btn.disabled   = true;

    // Collect form data
    var data = new FormData(form);

    // ── Netlify Forms submission (works on Netlify hosting) ──
    fetch('/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(data).toString()
    })
      .then(function (response) {
        if (response.ok) {
          form.style.display    = 'none';
          successMsg.style.display = 'block';
          // Scroll to success message
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Netlify form failed: ' + response.status);
        }
      })
      .catch(function (err) {
        console.warn('Netlify form failed, trying mailto fallback:', err);

        // ── Mailto fallback ──
        var fname   = (form.querySelector('[name="fname"]')   || {}).value || '';
        var lname   = (form.querySelector('[name="lname"]')   || {}).value || '';
        var email   = (form.querySelector('[name="email"]')   || {}).value || '';
        var company = (form.querySelector('[name="company"]') || {}).value || '';
        var website = (form.querySelector('[name="website"]') || {}).value || '';
        var phone   = (form.querySelector('[name="phone"]')   || {}).value || '';
        var service = (form.querySelector('[name="service"]') || {}).value || '';
        var message = (form.querySelector('[name="message"]') || {}).value || '';

        var subject = encodeURIComponent('Free Website Audit Request – ' + company);
        var body    = encodeURIComponent(
          'Name:    ' + fname + ' ' + lname + '\n' +
          'Email:   ' + email                     + '\n' +
          'Company: ' + company                   + '\n' +
          'Website: ' + website                   + '\n' +
          'Phone:   ' + phone                     + '\n' +
          'Service: ' + service                   + '\n\n' +
          'Goals / Message:\n' + message
        );

        window.location.href = 'mailto:admin@novatvhub.com?subject=' + subject + '&body=' + body;

        form.style.display       = 'none';
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .finally(function () {
        btn.innerHTML = originalBtnText;
        btn.disabled  = false;
      });
  });

  /* ── Animate stats counter on scroll ── */
  var counters = document.querySelectorAll('.stat .num');
  var animated = false;

  function animateCounters() {
    if (animated) return;
    var statsEl = document.querySelector('.stats');
    if (!statsEl) return;
    var rect = statsEl.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      animated = true;
      counters.forEach(function (el) {
        var raw   = el.textContent.trim();
        var num   = parseFloat(raw.replace(/[^0-9.]/g, ''));
        var suffix = raw.replace(/[0-9.]/g, '');
        if (isNaN(num)) return;
        var start    = 0;
        var duration = 1400;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          var current  = Math.round(eased * num * 10) / 10;
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = raw; // restore exact original
        }
        requestAnimationFrame(step);
      });
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters(); // run once on load too

})();
