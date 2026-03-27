/* ============================================
   app.js — Awaki Tchalim Portfolio
   ============================================ */

(function () {
  'use strict';

  /* =========================================
     1. CUSTOM CURSOR
     ========================================= */
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');

  if (cursor && trail && window.matchMedia('(pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.style.left = tx + 'px';
      cursor.style.top  = ty + 'px';
    });

    function animateTrail() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      trail.style.left = cx + 'px';
      trail.style.top  = cy + 'px';
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
  }

  /* =========================================
     2. NAVBAR SCROLL + ACTIVE LINK
     ========================================= */
  const navbar    = document.getElementById('navbar');
  const navLinksA = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach((sec) => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinksA.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }

  /* =========================================
     3. BURGER MENU
     ========================================= */
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('open');
    navbar.classList.toggle('menu-open');
    // Keep burger above the full-screen drawer
    burger.style.zIndex = navLinks.classList.contains('open') ? '1000' : '';
  });

  navLinksA.forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      navbar.classList.remove('menu-open');
      burger.style.zIndex = '';
    });
  });

  /* =========================================
     4. PARTICLE CANVAS
     ========================================= */
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const PARTICLE_COUNT = 90;
  const COLORS_DARK  = ['#3d8cff', '#00e5c8', '#9b5de5', '#4a9fff'];
  const COLORS_LIGHT = ['#2563eb', '#0d9488', '#7c3aed', '#3b82f6'];

  function getParticleColors() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? COLORS_LIGHT : COLORS_DARK;
  }
  var COLORS = getParticleColors();

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 1.8 + 0.4;
    this.a  = Math.random() * 0.6 + 0.1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.life  = 0;
    this.maxLife = Math.random() * 400 + 200;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > this.maxLife) this.reset();
  };
  Particle.prototype.draw = function () {
    const fade = Math.min(this.life / 40, 1) * Math.min(1, (this.maxLife - this.life) / 40);
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.globalAlpha = (isLightMode ? this.a * 1.8 : this.a) * fade;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger
    particles.push(p);
  }

  // Connection lines
  function drawConnections() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const isLt = document.documentElement.getAttribute('data-theme') === 'light';
          const alpha = (1 - dist / 120) * (isLt ? 0.2 : 0.12);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#2563eb' : '#3d8cff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);

    // Gradient bg overlay — adapt to theme
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const grad = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.3, H * 0.3, H * 0.8);
    if (isLight) {
      grad.addColorStop(0, 'rgba(37,99,235,0.04)');
      grad.addColorStop(1, 'rgba(245,243,240,0)');
    } else {
      grad.addColorStop(0, 'rgba(20,35,70,0.4)');
      grad.addColorStop(1, 'rgba(8,12,20,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Refresh particle colors on theme change
    COLORS = getParticleColors();

    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* =========================================
     5. COUNTER ANIMATION (Hero Stats)
     ========================================= */
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    const heroSection = document.getElementById('hero');
    const rect = heroSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      statsAnimated = true;
      statNums.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const dur = 1400;
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.floor(ease * target);
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

  /* =========================================
     6. REVEAL ON SCROLL
     ========================================= */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sib, i) => {
          if (sib === entry.target) delay = i * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* =========================================
     7. SKILL BAR ANIMATION
     ========================================= */
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(b => barObserver.observe(b));

  /* =========================================
     8. THEME TOGGLE (Dark / Light)
     ========================================= */
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot    = document.documentElement;

  // Read saved preference or system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem('at-theme');
    if (saved) return saved;
    return 'dark';
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('at-theme', theme);
  }

  // Initial apply already done via inline script; just ensure toggle state matches
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'dark';
      const next    = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Listen for OS-level theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('at-theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  /* =========================================
     9. LANGUAGE SWITCH (EN / FR)
     ========================================= */
  const langBtn  = document.getElementById('langToggle');
  const langIcon = document.getElementById('langIcon');
  const htmlEl   = document.documentElement;

  let currentLang = localStorage.getItem('at-lang') || 'fr';
  applyLang(currentLang);

  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'fr' : 'en';
    localStorage.setItem('at-lang', currentLang);
    applyLang(currentLang);
  });

  function applyLang(lang) {
    htmlEl.setAttribute('data-lang', lang);
    langIcon.textContent = lang === 'en' ? 'FR' : 'EN';

    // Update all elements with data-en / data-fr attributes (text content)
    document.querySelectorAll('[data-en][data-fr]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) {
        // Avoid touching inputs/textareas for inner content
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
          el.innerHTML = val;
        }
      }
    });

    // Update CV download links (href switches based on language)
    document.querySelectorAll('[data-href-en][data-href-fr]').forEach(el => {
      el.setAttribute('href', el.getAttribute('data-href-' + lang));
    });

    // Update placeholders
    document.querySelectorAll('[data-placeholder-en][data-placeholder-fr]').forEach(el => {
      el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });

    // Update document title & meta
    if (lang === 'fr') {
      document.title = 'Awaki Tchalim — Ingénieur Full-Stack Senior';
      document.querySelector('meta[name="description"]').setAttribute('content',
        'Ingénieur logiciel Full-Stack Senior avec 10+ ans d\'expérience. Expert Laravel, Vue.js, Docker, APIs REST. Disponible pour opportunités internationales.');
    } else {
      document.title = 'Awaki Tchalim — Senior Full-Stack Software Engineer';
      document.querySelector('meta[name="description"]').setAttribute('content',
        'Senior Full-Stack Software Engineer with 10+ years of experience. Expert in Laravel, Vue.js, Docker, REST APIs. Available for remote international opportunities.');
    }
  }

  /* =========================================
     10. LAZY-LOAD reCAPTCHA (when contact section enters viewport)
     ========================================= */
  (function lazyRecaptcha() {
    const contactSection = document.getElementById('contact');
    if (!contactSection || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        const s = document.createElement('script');
        s.src = 'https://www.google.com/recaptcha/api.js?render=6LexYpksAAAAAHWYz41fg60p20yzY6bqvK6AxEjF';
        document.head.appendChild(s);
      }
    }, { rootMargin: '200px' });
    obs.observe(contactSection);
  })();

  /* =========================================
     11. CONTACT FORM (AJAX + reCAPTCHA)
     ========================================= */
  const form     = document.getElementById('contactForm');
  const formMsg  = document.getElementById('formMsg');
  const submitBtn = document.getElementById('formSubmitBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name    = document.getElementById('cf-name').value.trim();
      const email   = document.getElementById('cf-email').value.trim();
      const subject = document.getElementById('cf-subject').value.trim() || 'Portfolio Contact';
      const message = document.getElementById('cf-message').value.trim();
      
      if (!name || !email || !message) {
        showFormMsg(currentLang === 'fr' ? 'Veuillez remplir tous les champs requis.' : 'Please fill in all required fields.', 'error');
        return;
      }

      // Get reCAPTCHA response (v3)
      let recaptchaResponse = '';
      if (typeof grecaptcha !== 'undefined') {
        try {
          recaptchaResponse = await new Promise((resolve) => {
            grecaptcha.ready(() => {
              grecaptcha.execute('6LexYpksAAAAAHWYz41fg60p20yzY6bqvK6AxEjF', {action: 'submit'})
                .then(resolve)
                .catch(() => resolve(''));
            });
          });
        } catch (e) {
          console.error(e);
        }
      }

      if (!recaptchaResponse) {
        showFormMsg(currentLang === 'fr' ? 'La validation reCAPTCHA a échoué (côté client).' : 'reCAPTCHA validation failed (client side).', 'error');
        return;
      }

      // Disable button
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = currentLang === 'fr' ? 'Envoi en cours...' : 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('g-recaptcha-response', recaptchaResponse);
      formData.append('lang', currentLang);

      try {
        const response = await fetch('https://awaki.tchalim.dev/contact.php', {
          method: 'POST',
          body: formData
        });

        let result;
        try {
          result = await response.json();
        } catch(err) {
          throw new Error('Invalid JSON from server');
        }

        if (result.success) {
          showFormMsg(
            currentLang === 'fr' ? "Votre message a bien été envoyé ! Merci." : "Your message has been successfully sent! Thank you.",
            'success'
          );
          form.reset();
        } else {
          showFormMsg(result.message || (currentLang === 'fr' ? "Une erreur côté serveur s'est produite." : "A server error occurred."), 'error');
        }
      } catch (error) {
        showFormMsg(currentLang === 'fr' ? "Erreur réseau ou réponse invalide." : "Network error or invalid response.", 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showFormMsg(msg, type) {
    formMsg.textContent = msg;
    formMsg.className   = 'form-msg ' + type;
    formMsg.style.display = 'block';
    setTimeout(() => { formMsg.style.display = 'none'; }, 8000);
  }

  /* =========================================
     11. SMOOTH SCROLL FOR ALL ANCHOR LINKS
     ========================================= */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =========================================
     12. AVATAR IMAGE FALLBACK
     ========================================= */
  const avatarImg = document.querySelector('.avatar-img');
  if (avatarImg) {
    avatarImg.addEventListener('error', () => {
      // Generate CSS-only initials avatar if image fails
      const parent = avatarImg.parentElement;
      avatarImg.style.display = 'none';
      const initials = document.createElement('div');
      initials.style.cssText = `
        width:100%;height:100%;display:flex;align-items:center;justify-content:center;
        font-family:'Outfit',sans-serif;font-size:3rem;font-weight:900;
        background:linear-gradient(135deg,#3d8cff,#00e5c8);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      `;
      initials.textContent = 'AT';
      parent.appendChild(initials);
    });
  }

  /* =========================================
     13. LIGHTBOX
     ========================================= */
  const lightbox         = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose    = document.getElementById('lightbox-close');
  const avatarTrigger    = document.getElementById('avatarTrigger');

  function openLightbox() {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (avatarTrigger) {
    avatarTrigger.addEventListener('click', openLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

})();

