gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavigation();
  initAnimations();
  initPortfolioFilter();
  initMagneticButtons();
  initMarqueePerformance();
  initHeroPerson();
  initStatsCounter();
});

function initCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || window.innerWidth < 1024) return;

  gsap.set(cursor, { x: -100, y: -100 });

  const setCursorX = gsap.quickTo(cursor, "x", { duration: 0.04, ease: "power2.out" });
  const setCursorY = gsap.quickTo(cursor, "y", { duration: 0.04, ease: "power2.out" });

  window.addEventListener('mousemove', (e) => {
    setCursorX(e.clientX);
    setCursorY(e.clientY);
  });

  const hoverTargets = document.querySelectorAll('a, button, .btn, .project-card, .person-clean-thumb, .filter-btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hover');
    });
  });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('is-clicking');
  });
  window.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicking');
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

function initNavigation() {
  const navbar = document.getElementById('mainNavbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  // Label menu yang punya dropdown (ada panah) hanya buka/tutup submenu, jadi tidak ikut menutup menu
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-link')).filter(link => !link.closest('.accordion-trigger'));

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
    });
  }
}

function initAnimations() {
  gsap.from('.headline-kinetic .word', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out',
    delay: 0.2
  });

  gsap.from('.hero-subheadline, .hero-ctas', {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.reveal-text', {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 80%'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.reveal-up', {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 75%'
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out'
  });

  const marqueeWrapper = document.querySelector('.portfolio-marquee-wrapper');
  if (marqueeWrapper) {
    gsap.from(marqueeWrapper, {
      scrollTrigger: {
        trigger: marqueeWrapper,
        start: 'top 85%'
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  }
}

function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const categories = item.getAttribute('data-category');
        if (filter === 'all' || categories.includes(filter)) {
          gsap.to(item, { opacity: 1, scale: 1, duration: 0.4, display: 'block' });
        } else {
          gsap.to(item, { opacity: 0, scale: 0.95, duration: 0.4, display: 'none' });
        }
      });
    });
  });
}

function initMagneticButtons() {
  if (window.innerWidth < 1024) return;

  const magneticBtns = document.querySelectorAll('.magnetic-btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initMarqueePerformance() {
  const wrappers = document.querySelectorAll('.clients-marquee-wrapper, .portfolio-marquee-wrapper');
  if (!wrappers.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const tracks = entry.target.querySelectorAll('.clients-marquee-track, .portfolio-marquee-track');
        tracks.forEach(track => {
          track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      });
    }, {
      rootMargin: '100px 0px 100px 0px',
      threshold: 0
    });

    wrappers.forEach(w => observer.observe(w));
  }

  wrappers.forEach(w => {
    w.addEventListener('touchstart', () => {
      const tracks = w.querySelectorAll('.clients-marquee-track, .portfolio-marquee-track');
      tracks.forEach(t => t.style.animationPlayState = 'paused');
    }, { passive: true });

    w.addEventListener('touchend', () => {
      const tracks = w.querySelectorAll('.clients-marquee-track, .portfolio-marquee-track');
      tracks.forEach(t => t.style.animationPlayState = 'running');
    }, { passive: true });

    w.addEventListener('touchcancel', () => {
      const tracks = w.querySelectorAll('.clients-marquee-track, .portfolio-marquee-track');
      tracks.forEach(t => t.style.animationPlayState = 'running');
    }, { passive: true });
  });
}

function initHeroPerson() {
  const images = document.querySelectorAll('.person-clean-img');
  const thumbs = document.querySelectorAll('.person-clean-thumb');
  const badgeEl = document.getElementById('personHeroBadge');
  const nameEl = document.getElementById('personHeroName');
  const roleEl = document.getElementById('personHeroRole');
  const stage = document.querySelector('.hero-person-clean-wrapper');

  if (!images.length || !thumbs.length) return;

  let currentIndex = 0;
  let timer = null;

  function setPerson(index) {
    if (index === currentIndex && images[index].classList.contains('active')) return;

    images.forEach(img => img.classList.remove('active'));
    thumbs.forEach(btn => btn.classList.remove('active'));

    const targetImg = images[index];
    const targetThumb = thumbs[index];

    if (targetImg) {
      targetImg.classList.add('active');
      const newBadge = targetImg.getAttribute('data-badge');
      const newName = targetImg.getAttribute('data-name');
      const newRole = targetImg.getAttribute('data-role');

      if (badgeEl && newBadge) {
        gsap.to(badgeEl, {
          opacity: 0,
          y: -4,
          duration: 0.15,
          onComplete: () => {
            badgeEl.textContent = newBadge;
            gsap.to(badgeEl, { opacity: 1, y: 0, duration: 0.25 });
          }
        });
      }

      if (nameEl && newName) {
        gsap.to(nameEl, {
          opacity: 0,
          y: -4,
          duration: 0.15,
          onComplete: () => {
            nameEl.textContent = newName;
            gsap.to(nameEl, { opacity: 1, y: 0, duration: 0.25 });
          }
        });
      }

      if (roleEl && newRole) {
        gsap.to(roleEl, {
          opacity: 0,
          y: -4,
          duration: 0.15,
          onComplete: () => {
            roleEl.textContent = newRole;
            gsap.to(roleEl, { opacity: 1, y: 0, duration: 0.25 });
          }
        });
      }
    }

    if (targetThumb) {
      targetThumb.classList.add('active');
    }

    currentIndex = index;
  }

  thumbs.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setPerson(idx);
      resetAutoCycle();
    });
  });

  function startAutoCycle() {
    timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setPerson(nextIndex);
    }, 4500);
  }

  function resetAutoCycle() {
    clearInterval(timer);
    startAutoCycle();
  }

  if (stage) {
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', () => startAutoCycle());
  }

  startAutoCycle();
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const triggerEl = document.querySelector('.stats-horizontal-inline') || document.querySelector('.about-section');
  if (!statNumbers.length || !triggerEl || typeof ScrollTrigger === 'undefined') return;

  ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      statNumbers.forEach(el => {
        const targetValue = parseInt(el.getAttribute('data-target') || el.textContent, 10);
        if (isNaN(targetValue)) return;

        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: targetValue,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(counterObj.val);
          }
        });
      });
    }
  });
}

