/*
  RK2 TINTAS — script principal do site
  Lê os produtos de products-data.js (window.RK2_PRODUCTS) e monta os
  cards da seção "Produtos" dinamicamente, além dos efeitos de interface
  (menu mobile, barra de progresso, animações ao rolar a página).
*/

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Menu mobile ----------
const toggle = document.getElementById('menuToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const isOpen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Renderização dos produtos ----------
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const produtos = window.RK2_PRODUCTS || [];

  grid.innerHTML = produtos.map((p, i) => `
    <div class="product-card" data-animate style="--d:${(i % 3) * 0.08}s">
      <div class="swatch" style="background:${p.color || '#1E2420'}"></div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      ${p.price ? `<p class="price mono">${p.price}</p>` : ''}
    </div>
  `).join('');
}
renderProducts();

// ---------- Barra de progresso de rolagem ----------
const progressBar = document.getElementById('scrollProgress');
const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ---------- Revelação de elementos ao rolar a página ----------
// (roda depois de renderProducts, pra pegar também os cards gerados)
const revealItems = document.querySelectorAll('[data-animate]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}
