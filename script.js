document.addEventListener('DOMContentLoaded', () => {
  /** Update this number when the client's WhatsApp changes */
  const WHATSAPP_NUMBER = '15551234567';
  const DEFAULT_WA_MESSAGE = 'Hello, I want to place an order with ABD SPORTS.';

  /* ─── WhatsApp helpers ─── */
  const waUrl = (text) => {
    const q = encodeURIComponent((text || '').trim());
    return `https://wa.me/${WHATSAPP_NUMBER}${q ? `?text=${q}` : ''}`;
  };

  const applyWhatsAppLinks = () => {
    document.querySelectorAll('[data-wa-product]').forEach((el) => {
      const name = el.getAttribute('data-wa-product');
      if (!name) return;
      el.setAttribute('href', waUrl(`Hello, I want to order the ${name} from ABD SPORTS.`));
    });
    document.querySelectorAll('[data-wa-message]').forEach((el) => {
      const msg = el.getAttribute('data-wa-message');
      if (msg) el.setAttribute('href', waUrl(msg));
    });
  };

  applyWhatsAppLinks();

  /* ─── Element references ─── */
  const siteHeader         = document.querySelector('.site-header');
  const nav                = document.getElementById('mainNav');
  const navToggle          = document.getElementById('navToggle');
  const revealTargets      = document.querySelectorAll('.reveal');
  const galleryItems       = document.querySelectorAll('.gallery-item');
  const contactForm        = document.getElementById('contactForm');
  const whatsappButton     = document.getElementById('whatsappButton');
  const carouselViewport   = document.getElementById('productCarouselViewport');
  const carouselPrev       = document.querySelector('[data-carousel-prev]');
  const carouselNext       = document.querySelector('[data-carousel-next]');
  const fadeLeft           = document.querySelector('[data-fade-left]');
  const fadeRight          = document.querySelector('[data-fade-right]');
  const indicatorThumb     = document.getElementById('carouselIndicatorThumb');
  const backToTop          = createBackToTop();
  const scrollOffset       = 100;
  const prefersReduced     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Floating WhatsApp button ─── */
  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      window.open(waUrl(DEFAULT_WA_MESSAGE), '_blank', 'noopener,noreferrer');
    });
  }

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      closeMobileNav();
    });
  });

  /* ─── Scroll-driven state (header + back-to-top) ─── */
  const updateScrollState = () => {
    const y = window.scrollY;
    siteHeader.classList.toggle('scrolled', y > 24);
    backToTop.classList.toggle('visible', y > 480);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  /* ─── Mobile nav ─── */
  const toggleMobileNav = () => {
    if (!nav || !navToggle) return;
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  };

  const closeMobileNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle) navToggle.addEventListener('click', toggleMobileNav);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });

  /* ─── Section reveal on scroll ─── */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 70);
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  revealTargets.forEach((el) => sectionObserver.observe(el));

  /* ─── Card reveal on scroll ─── */
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.remove('card-reveal-pending');
            entry.target.classList.add('card-reveal-visible');
          }, i * 55);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
  );

  document.querySelectorAll('.product-card, .service-card').forEach((card) => {
    card.classList.add('card-reveal-pending');
    cardObserver.observe(card);
  });

  /* ─── Gallery reveal ─── */
  const galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.remove('gallery-reveal-pending');
            entry.target.classList.add('gallery-reveal-visible');
          }, i * 90);
          galleryObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  galleryItems.forEach((item) => {
    item.classList.add('gallery-reveal-pending');
    galleryObserver.observe(item);
  });

  /* ─── Carousel ─── */
  const syncCarousel = () => {
    if (!carouselViewport) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselViewport;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const atStart   = scrollLeft <= 8;
    const atEnd     = scrollLeft >= maxScroll - 8;

    fadeLeft?.classList.toggle('is-visible',  !atStart && maxScroll > 0);
    fadeRight?.classList.toggle('is-visible', !atEnd   && maxScroll > 0);

    if (carouselPrev) {
      carouselPrev.disabled = atStart || maxScroll <= 0;
      carouselPrev.setAttribute('aria-disabled', String(carouselPrev.disabled));
    }
    if (carouselNext) {
      carouselNext.disabled = atEnd || maxScroll <= 0;
      carouselNext.setAttribute('aria-disabled', String(carouselNext.disabled));
    }

    if (indicatorThumb) {
      const track = indicatorThumb.parentElement;
      if (track && scrollWidth > clientWidth + 1) {
        const trackW  = track.clientWidth;
        const thumbW  = Math.max(36, (clientWidth / scrollWidth) * trackW);
        const x = maxScroll > 0 ? (scrollLeft / maxScroll) * (trackW - thumbW) : 0;
        indicatorThumb.style.width     = `${thumbW}px`;
        indicatorThumb.style.transform = `translateX(${x}px)`;
      }
    }
  };

  if (carouselViewport) {
    const scrollCarousel = (dir) => {
      const firstCard = carouselViewport.querySelector('.product-card');
      const track     = carouselViewport.querySelector('.carousel-track');
      const gap       = track ? parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') : 0;
      const cardW     = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
      const step      = Math.max(240, Math.round(cardW || carouselViewport.clientWidth * 0.72));
      carouselViewport.scrollBy({ left: dir * step, behavior: prefersReduced ? 'auto' : 'smooth' });
    };

    carouselPrev?.addEventListener('click', () => scrollCarousel(-1));
    carouselNext?.addEventListener('click', () => scrollCarousel(1));

    carouselViewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollCarousel(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollCarousel(1); }
    });

    carouselViewport.addEventListener('scroll', syncCarousel, { passive: true });
    window.addEventListener('resize', syncCarousel, { passive: true });
    syncCarousel();
  }

  /* ─── Contact form ─── */
  if (contactForm) {
    const feedback = contactForm.querySelector('.form-feedback');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameField    = contactForm.querySelector('#contactName');
      const emailField   = contactForm.querySelector('#contactEmail');
      const messageField = contactForm.querySelector('#contactMessage');
      const fields       = [nameField, emailField, messageField];
      let valid = true;

      fields.forEach((f) => {
        f.classList.remove('input-error');
        if (!f.value.trim()) { valid = false; f.classList.add('input-error'); }
      });

      if (emailField?.value.trim() && !validateEmail(emailField.value)) {
        valid = false;
        emailField.classList.add('input-error');
      }

      if (!valid) {
        if (feedback) {
          feedback.textContent = 'Please fill in all fields with a valid email address.';
          feedback.classList.add('error');
        }
        return;
      }

      contactForm.reset();
      if (feedback) {
        feedback.textContent = 'Thanks for reaching out! We will be in touch soon.';
        feedback.classList.remove('error');
      }
    });
  }

  /* ─── Helpers ─── */
  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function createBackToTop() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
    return btn;
  }
});
