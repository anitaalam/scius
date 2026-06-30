// ===== Scius — site behaviour =====

// Reveal footer: reserve scroll space below content equal to footer height
const footerEl = document.querySelector('.site-footer');
const pageContent = document.querySelector('.page-content');
const syncFooterSpace = () => {
  if (!footerEl || !pageContent) return;
  pageContent.style.marginBottom = footerEl.offsetHeight + 'px';
};
syncFooterSpace();
window.addEventListener('resize', syncFooterSpace, { passive: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFooterSpace);
window.addEventListener('load', syncFooterSpace);

// Header scroll state
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
  // Safety fallback: never leave content hidden
  setTimeout(() => reveals.forEach(el => el.classList.add('in')), 2500);
} else {
  reveals.forEach(el => el.classList.add('in'));
}

// Mobile nav
const mobileNav = document.getElementById('mobileNav');
const navToggle = document.querySelector('.nav-toggle');
const mobileNavClose = document.getElementById('mobileNavClose');
const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
if (mobileNav && navToggle) {
  const openNav = () => { mobileNav.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeNav = () => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; };
  navToggle.addEventListener('click', openNav);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeNav);
  // Close on link click
  mobileNav.querySelectorAll('.mobile-nav-links a, .mobile-nav-cta a').forEach(a => {
    a.addEventListener('click', closeNav);
  });
}

// Bio panel (team page)
(function () {
  const panel = document.getElementById('bioPanel');
  const overlay = document.getElementById('bioOverlay');
  const closeBtn = document.getElementById('bioClose');
  const content = document.getElementById('bioContent');
  if (!panel || !overlay) return;

  const cards = document.querySelectorAll('.tm-card[data-bio]');

  function openBio(slug) {
    const tpl = document.getElementById('bio-' + slug);
    if (!tpl) return;
    content.innerHTML = tpl.innerHTML;
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBio() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the LinkedIn link
      if (e.target.closest('.tm-li')) return;
      openBio(card.dataset.bio);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeBio);
  overlay.addEventListener('click', closeBio);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeBio();
  });
})();

// FAQ accordion (contact page)
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

// Work page: filter + pagination
(function () {
  const PER_PAGE = 6;
  const grid = document.getElementById('workGrid');
  const allCards = grid ? Array.from(grid.querySelectorAll('.work-card')) : [];
  const filterBtns = document.querySelectorAll('.filter-btn');
  const paginationNav = document.getElementById('workPagination');
  const numsWrap = document.getElementById('workPaginationNums');
  if (!grid || !allCards.length) return;

  let filtered = allCards;
  let currentPage = 1;

  function getFiltered() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const cat = activeBtn ? activeBtn.dataset.filter : 'all';
    if (cat === 'all') return allCards;
    return allCards.filter(c => c.dataset.category && c.dataset.category.split(' ').includes(cat));
  }

  function render() {
    filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    // Hide all, then show current page
    allCards.forEach(c => { c.hidden = true; });
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);
    pageItems.forEach(c => { c.hidden = false; });

    // Build pagination numbers
    numsWrap.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'pagination-num' + (i === currentPage ? ' active' : '');
      btn.dataset.page = i;
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; render(); });
      numsWrap.appendChild(btn);
    }

    // Prev / next
    const prevBtn = paginationNav.querySelector('.pagination-prev');
    const nextBtn = paginationNav.querySelector('.pagination-next');
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Show/hide pagination
    paginationNav.style.display = totalPages <= 1 ? 'none' : '';

    // Re-trigger reveal for newly visible cards
    pageItems.forEach(c => {
      c.classList.remove('in');
      void c.offsetWidth;
      c.classList.add('in');
    });
  }

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPage = 1;
      render();
    });
  });

  // Prev / next
  paginationNav.querySelector('.pagination-prev').addEventListener('click', () => { currentPage--; render(); });
  paginationNav.querySelector('.pagination-next').addEventListener('click', () => { currentPage++; render(); });

  render();
})();

// Count-up animation (about page — Our Impact)
(function () {
  const nums = document.querySelectorAll('.count-up');
  if (!nums.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const noComma = el.hasAttribute('data-no-comma');
    const duration = 2000;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = (noComma ? value.toString() : value.toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
})();

// Testimonial carousel (about page)
(function () {
  const slides = Array.from(document.querySelectorAll('.tst-slide'));
  const dotsWrap = document.getElementById('tst-dots');
  if (!slides.length || !dotsWrap) return;
  let i = 0;
  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Testimonial ' + (idx + 1));
    if (idx === 0) b.classList.add('active');
    b.addEventListener('click', () => go(idx));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  const prevBtn = document.querySelector('.tst-arrow.prev');
  const nextBtn = document.querySelector('.tst-arrow.next');
  if (prevBtn) prevBtn.addEventListener('click', () => go(i - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(i + 1));
  let timer = setInterval(() => go(i + 1), 6000);
  const tstEl = document.querySelector('.tst');
  if (tstEl) {
    tstEl.addEventListener('mouseenter', () => clearInterval(timer));
    tstEl.addEventListener('mouseleave', () => { timer = setInterval(() => go(i + 1), 6000); });
  }
})();

// ===== Blog Pagination =====
(() => {
  const pages = document.querySelectorAll('.insights-grid[data-page]');
  const nums = document.querySelectorAll('.pagination-num[data-page]');
  const prev = document.querySelector('.pagination-prev');
  const next = document.querySelector('.pagination-next');
  if (!pages.length) return;

  let current = 1;
  const total = pages.length;

  function showPage(n) {
    current = n;
    pages.forEach(p => {
      p.style.display = +p.dataset.page === n ? '' : 'none';
    });
    nums.forEach(b => {
      b.classList.toggle('active', +b.dataset.page === n);
    });
    if (prev) prev.disabled = n === 1;
    if (next) next.disabled = n === total;

    // Scroll to top of grid section
    const section = document.querySelector('.insights-grid-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nums.forEach(b => b.addEventListener('click', () => showPage(+b.dataset.page)));
  if (prev) prev.addEventListener('click', () => { if (current > 1) showPage(current - 1); });
  if (next) next.addEventListener('click', () => { if (current < total) showPage(current + 1); });
})();

// Parallax scroll for prefab images
(function () {
  const imgs = document.querySelectorAll('.parallax-img');
  if (!imgs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function update() {
    const wh = window.innerHeight;
    imgs.forEach(img => {
      const parent = img.parentElement;
      const rect = parent.getBoundingClientRect();
      // 0 when element enters bottom, 1 when it exits top
      const progress = 1 - (rect.bottom / (wh + rect.height));
      // Shift image between -15% and +15% of its extra height
      const shift = (progress - 0.5) * 30;
      const isHovered = parent.matches(':hover');
      const scale = isHovered ? 'scale(1.15)' : '';
      img.style.transform = 'translateY(' + shift + '%) ' + scale;
    });
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})();
