/**
 * SOS Direct – script.js (v2 SPA)
 * Slider manuel (flèches + dots) | Menu mobile | Modales | Formulaire AJAX
 */

(function () {
  'use strict';

  /* ─── ANNÉE ─── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── MENU MOBILE ─── */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a, button').forEach(el =>
      el.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
    // Fermer menu si clic hors
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ─── HEADER SCROLL ─── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,.14)'
        : '0 1px 8px rgba(0,0,0,.08)';
    }, { passive: true });
  }

  /* ─── ACTIVE NAV LINK ─── */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (sections.length && navLinks.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const match = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  /* ─── ACTIVE NAV ON SUB-PAGES ─── */
  const path = window.location.pathname;
  if (path.includes('/services/')) {
    navLinks.forEach(l => l.classList.remove('active'));
    const svcLink = document.querySelector('.nav-link[data-i18n="nav_services"]');
    if (svcLink) svcLink.classList.add('active');
  } else if (path.includes('/primes')) {
    navLinks.forEach(l => l.classList.remove('active'));
    const primesLink = document.querySelector('.nav-link[data-i18n="nav_primes"]');
    if (primesLink) primesLink.classList.add('active');
  }

  /* ─── HERO SLIDER ─── */
  const slides   = Array.from(document.querySelectorAll('.slide'));
  const dots     = Array.from(document.querySelectorAll('.slider__dot'));
  const btnPrev  = document.getElementById('sliderPrev');
  const btnNext  = document.getElementById('sliderNext');
  let current    = 0;
  let timer      = null;
  const INTERVAL = 5000;

  function go(idx) {
    slides[current].classList.remove('slide--active');
    dots[current].classList.remove('slider__dot--active');
    dots[current].setAttribute('aria-selected', 'false');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('slide--active');
    dots[current].classList.add('slider__dot--active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => go(current + 1), INTERVAL);
  }
  function stopAuto() { clearInterval(timer); }

  if (slides.length > 1) {
    // Flèches
    if (btnPrev) btnPrev.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
    if (btnNext) btnNext.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });

    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
    });

    // Swipe tactile
    let touchX = 0;
    const sliderEl = document.getElementById('slider');
    if (sliderEl) {
      sliderEl.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
      sliderEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) { stopAuto(); go(dx < 0 ? current + 1 : current - 1); startAuto(); }
      }, { passive: true });
    }

    // Pause au survol
    if (sliderEl) {
      sliderEl.addEventListener('mouseenter', stopAuto);
      sliderEl.addEventListener('mouseleave', startAuto);
    }

    startAuto();
  }

  /* ─── MODALES ─── */
  function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    // Focus le bouton de fermeture pour l'accessibilité
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  // Ouvrir via data-modal
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      openModal(trigger.dataset.modal);
    });
  });

  // Fermer via bouton close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
  });

  // Fermer via clic sur l'overlay (fond)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Fermer via Echap
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal-overlay:not([hidden])');
      if (open) closeModal(open);
    }
  });

  // Fermer et scroller vers #contact quand on clique un .modal-cta
  document.querySelectorAll('.modal-cta').forEach(cta => {
    cta.addEventListener('click', () => {
      const open = document.querySelector('.modal-overlay:not([hidden])');
      if (open) closeModal(open);
    });
  });

  /* ─── SCROLL TO TOP ─── */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.hidden = window.scrollY <= 400;
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ─── FORMULAIRE CONTACT ─── */
  const contactForm  = document.getElementById('contactForm');
  const contactFeedback = document.getElementById('contactFeedback');
  const contactSubmit   = document.getElementById('contactSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Validation
      let valid = true;
      contactForm.querySelectorAll('[required]').forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) { field.style.borderColor = '#f87171'; valid = false; }
      });
      if (!valid) {
        showMsg(contactFeedback, 'error', 'Veuillez remplir tous les champs obligatoires (*).');
        return;
      }

      contactSubmit.disabled = true;
      contactSubmit.textContent = 'Envoi en cours…';

      try {
        const res  = await fetch('contact.php', { method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (data.success) {
          showMsg(contactFeedback, 'success', '✅ Votre message a bien été envoyé ! Nous vous répondrons rapidement.');
          contactForm.reset();
        } else {
          showMsg(contactFeedback, 'error', '❌ Erreur lors de l\'envoi. Appelez-nous directement : +32 484 826 826');
        }
      } catch {
        showMsg(contactFeedback, 'error', '❌ Problème de connexion. Appelez-nous : +32 484 826 826');
      } finally {
        contactSubmit.disabled = false;
        contactSubmit.textContent = 'Envoyer ma demande';
      }
    });
  }

  function showMsg(el, type, msg) {
    if (!el) return;
    el.textContent = msg;
    el.className   = 'form-feedback ' + type;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

})();
