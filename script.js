// ===== Scius Homepage — behaviour =====

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
