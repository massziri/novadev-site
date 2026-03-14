/* ============================================================
   Nova Dev — Main JavaScript
   Form handler (SMTP via Netlify Function) + UI interactions
   ============================================================ */

(function() {
  'use strict';

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
  const form = document.getElementById('audit-form');
  const btnSubmit = document.querySelector('.btn-submit');
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');

  if (form && btnSubmit) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Reset messages
      successMsg.style.display = 'none';
      errorMsg.style.display = 'none';

      // Disable button and show loading state
      btnSubmit.disabled = true;
      const originalText = btnSubmit.textContent;
      btnSubmit.textContent = '⏳ Sending...';

      // Collect form data
      const formData = {
        fname: form.fname.value.trim(),
        lname: form.lname.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        website: form.website.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        message: form.message.value.trim()
      };

      // Client-side validation
      if (!formData.fname || !formData.email || !formData.message) {
        errorMsg.textContent = '⚠️ Please fill in all required fields (Name, Email, Message).';
        errorMsg.style.display = 'block';
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errorMsg.textContent = '⚠️ Please enter a valid email address.';
        errorMsg.style.display = 'block';
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
        return;
      }

      try {
        // Send to Netlify function
        const response = await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success
          successMsg.style.display = 'block';
          form.reset();
          
          // Scroll to success message
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Reset button after delay
          setTimeout(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
          }, 2000);

        } else {
          // Server returned error
          errorMsg.textContent = `⚠️ ${result.error || 'Something went wrong. Please try again or email us directly at admin@novatvhub.com'}`;
          errorMsg.style.display = 'block';
          
          // Log detailed error for debugging
          if (result.detail) {
            console.error('Server error detail:', result.detail);
          }
          
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalText;
        }

      } catch (error) {
        // Network or other error
        console.error('Form submission error:', error);
        errorMsg.textContent = '⚠️ Network error. Please check your connection and try again, or contact us directly at admin@novatvhub.com';
        errorMsg.style.display = 'block';
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
      }
    });
  }

  // ── Stats Counter Animation ────────────────────────────────
  const stats = document.querySelectorAll('.stat .num');
  let animated = false;

  function animateCounters() {
    if (animated) return;
    
    stats.forEach(stat => {
      const rect = stat.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animated = true;
        const text = stat.textContent;
        
        // Only animate numbers, not text like "3×"
        if (text.includes('+')) {
          const target = parseInt(text);
          animateCount(stat, 0, target, 1500, '+');
        } else if (text.includes('%')) {
          const target = parseInt(text);
          animateCount(stat, 0, target, 1500, '%');
        } else if (text.includes('×')) {
          const target = parseInt(text);
          animateCount(stat, 0, target, 1500, '×');
        } else if (text.includes('h')) {
          const target = parseInt(text);
          animateCount(stat, 0, target, 1500, 'h');
        }
      }
    });
  }

  function animateCount(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, 16);
  }

  // Check on scroll and on load
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters(); // run once on load too

})();
