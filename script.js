document.addEventListener('DOMContentLoaded', () => {
  const siteHeader = document.querySelector('.site-header');
  const nav = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  const revealTargets = document.querySelectorAll('.reveal');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const contactForm = document.getElementById('contactForm');
  const backToTop = createBackToTop();
  const whatsappButton = document.getElementById('whatsappButton');
  const scrollOffset = 100;

  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      window.open('https://wa.me/15551234567', '_blank', 'noopener,noreferrer');
    });
  }

  const scrollToId = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      event.preventDefault();
      scrollToId(targetId);
      closeMobileNav();
    });
  });

  const observers = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 70);
          observers.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  revealTargets.forEach((element) => observers.observe(element));

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    siteHeader.classList.toggle('scrolled', scrollTop > 24);
    backToTop.classList.toggle('visible', scrollTop > 480);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  const toggleMobileNav = () => {
    if (!nav || !navToggle) return;
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const closeMobileNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => toggleMobileNav());
  }

  const carouselViewport = document.getElementById('productCarouselViewport');
  const carouselPrev = document.querySelector('[data-carousel-prev]');
  const carouselNext = document.querySelector('[data-carousel-next]');
  const fadeLeft = document.querySelector('[data-fade-left]');
  const fadeRight = document.querySelector('[data-fade-right]');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateCarouselFades = () => {
    if (!carouselViewport) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselViewport;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const atStart = scrollLeft <= 8;
    const atEnd = scrollLeft >= maxScroll - 8;

    fadeLeft?.classList.toggle('is-visible', !atStart && maxScroll > 0);
    fadeRight?.classList.toggle('is-visible', !atEnd && maxScroll > 0);
  };

  if (carouselViewport) {
    const scrollCarousel = (direction) => {
      const step = Math.max(240, Math.round(carouselViewport.clientWidth * 0.72));
      carouselViewport.scrollBy({
        left: direction * step,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    };

    carouselPrev?.addEventListener('click', () => scrollCarousel(-1));
    carouselNext?.addEventListener('click', () => scrollCarousel(1));

    carouselViewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCarousel(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCarousel(1);
      }
    });

    carouselViewport.addEventListener('scroll', updateCarouselFades, { passive: true });
    window.addEventListener('resize', updateCarouselFades, { passive: true });
    updateCarouselFades();
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeMobileNav();
    }
  });

  const productCards = document.querySelectorAll('.product-card, .service-card');
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.remove('card-reveal-pending');
            entry.target.classList.add('card-reveal-visible');
          }, index * 50);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
  );

  productCards.forEach((card) => {
    card.classList.add('card-reveal-pending');
    cardObserver.observe(card);
  });

  const galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.remove('gallery-reveal-pending');
            entry.target.classList.add('gallery-reveal-visible');
          }, index * 90);
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

  if (contactForm) {
    const feedback = contactForm.querySelector('.form-feedback');
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nameField = contactForm.querySelector('#contactName');
      const emailField = contactForm.querySelector('#contactEmail');
      const messageField = contactForm.querySelector('#contactMessage');
      const fields = [nameField, emailField, messageField];
      let isValid = true;

      fields.forEach((field) => {
        field.classList.remove('input-error');
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('input-error');
        }
      });

      if (emailField && emailField.value.trim() && !validateEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('input-error');
      }

      if (!isValid) {
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

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function createBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(button);
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    return button;
  }
});
