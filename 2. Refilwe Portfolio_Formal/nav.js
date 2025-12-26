document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

  if (!navAnchors.length) return;

  // Mobile menu toggle
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Close mobile menu when a nav link is clicked
  navAnchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#0') return;
      if (href.startsWith('#')) {
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          const header = document.querySelector('.navbar');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });

          // close mobile nav after clicking
          if (nav) nav.classList.remove('open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (nav) nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Scrollspy: highlight the nav link for the section nearest the top of viewport
  const header = document.querySelector('.navbar');
  const headerHeight = () => (header ? header.offsetHeight : 0);
  const sections = Array.from(document.querySelectorAll('section[id]'));
  // include top anchor (hero) if present
  const topEl = document.getElementById('top') || document.querySelector('.hero');

  function getTargets() {
    const t = sections.slice();
    if (topEl && !t.includes(topEl)) t.unshift(topEl);
    return t.filter(Boolean);
  }

  function updateActiveLink() {
    const targets = getTargets();
    let closest = null;
    let closestDistance = Infinity;
    const offset = headerHeight() + 12;
    targets.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      // distance from header line
      const distance = Math.abs(rect.top - offset);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = el;
      }
    });

    const id = closest && closest.id ? closest.id : 'top';
    navAnchors.forEach(function (a) {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + id);
    });
  }

  // throttle via rAF
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // also update on resize and on load
  window.addEventListener('resize', function () { updateActiveLink(); });
  updateActiveLink();

  // Floating back-to-top FAB behaviour
  const fab = document.querySelector('.back-to-top-fab');
  if (fab) {
    // show when scrolled down
    const toggleFab = function () {
      if (window.pageYOffset > 300) fab.classList.add('show');
      else fab.classList.remove('show');
    };
    // throttle toggle on scroll via rAF
    let fabTick = false;
    window.addEventListener('scroll', function () {
      if (!fabTick) {
        window.requestAnimationFrame(function () { toggleFab(); fabTick = false; });
        fabTick = true;
      }
    }, { passive: true });
    // initial check
    toggleFab();

    // smooth scroll to top on click; account for header if needed
    fab.addEventListener('click', function (e) {
      e.preventDefault();
      const header = document.querySelector('.navbar');
      const headerHeight = header ? header.offsetHeight : 0;
      // scroll to very top - header not relevant for top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Typing effect for titles: apply to .hero-title and all .section-title elements.
  (function setupTypingForTitles() {
    const nodes = Array.from(document.querySelectorAll('.hero-title, .section-title'));
    if (!nodes.length) return;

    const defaultOptions = {
      typingSpeed: 80,
      deletingSpeed: 40,
      pauseAfterTyped: 1200,
      pauseAfterDeleted: 600,
      initialDelay: 600,
      stagger: 400
    };

    nodes.forEach(function (el, idx) {
      const text = el.textContent.trim();
      el.dataset.fullText = text;
      el.textContent = '';
      el.classList.add('typing');

      let i = 0;
      let deleting = false;

      function tick() {
        if (!deleting) {
          i++;
          el.textContent = text.slice(0, i);
          if (i >= text.length) {
            deleting = true;
            setTimeout(tick, defaultOptions.pauseAfterTyped);
            return;
          }
          setTimeout(tick, defaultOptions.typingSpeed);
        } else {
          i--;
          el.textContent = text.slice(0, i);
          if (i <= 0) {
            deleting = false;
            setTimeout(tick, defaultOptions.pauseAfterDeleted);
            return;
          }
          setTimeout(tick, defaultOptions.deletingSpeed);
        }
      }

      // stagger start so titles don't all type at once
      setTimeout(tick, defaultOptions.initialDelay + idx * defaultOptions.stagger);
    });
  })();
});
