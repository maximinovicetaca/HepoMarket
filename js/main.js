// ===== HEPOMARKET MAIN JS =====

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

// Animate on scroll
const observerOpts = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 100);
    }
  });
}, observerOpts);
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// Counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('pt-PT');
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(e.target);
    }
  });
});
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== CART =====
let cart = JSON.parse(localStorage.getItem('hepoCart') || '[]');

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty++; }
  else { cart.push({ ...product, qty: 1 }); }
  localStorage.setItem('hepoCart', JSON.stringify(cart));
  updateCartCount();
  showToast(`✓ ${product.name} adicionado ao carrinho!`);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== FEATURED PRODUCTS (real images) =====
// ─── Produtos: promoções SEMPRE em primeiro lugar ───
const sampleProducts = []; // Produtos removidos – adicione via painel CEO

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const isSubpage = window.location.pathname.includes('/pages/');

  // Apenas produtos adicionados pelo CEO — zero produtos de exemplo
  let adminProds = [];
  try { adminProds = JSON.parse(localStorage.getItem('hepo_admin_products')||'[]'); } catch(e){}

  const catIcons = {beleza:'💄',casa:'🏠',moda:'👜',bebe:'🍼',outro:'📦',eletronicos:'📱'};
  const catColors = {beleza:'#ec4899',casa:'#10b981',moda:'#8b5cf6',bebe:'#f59e0b',eletronicos:'#6366f1',outro:'#0078d4'};

  // Promoções sempre primeiro
  const promoFirst = [
    ...adminProds.filter(p=>p.promo||((p.badge||'').toLowerCase().includes('promo'))),
    ...adminProds.filter(p=>!p.promo&&!((p.badge||'').toLowerCase().includes('promo'))),
  ].map(p=>({
    id:'adm-'+p.id, name:p.nome,
    price:parseInt(p.preco||0).toLocaleString('pt-PT')+' Kz',
    oldPrice:p.precoAntigo?parseInt(p.precoAntigo).toLocaleString('pt-PT')+' Kz':'',
    icon:catIcons[p.cat]||'🛍️', color:catColors[p.cat]||'#0078d4',
    partner:p.parceiro||'HepoMarket', rating:'★★★★★',
    badge:p.badge||'', promo:p.promo||false, isAdmin:true,
  }));

  // Empty state
  if (!promoFirst.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-muted);">
      <div style="font-size:3.5rem;margin-bottom:1rem;">🛍️</div>
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:.5rem;color:rgba(200,210,235,.8);">Ainda sem produtos disponíveis</div>
      <p style="font-size:.88rem;">Os produtos serão adicionados em breve pelo CEO.</p>
    </div>`;
    return;
  }

  grid.innerHTML = promoFirst.map(p => {
    const imgSrc = p.isAdmin ? p.img : (imgBase + p.img);
    const promoBar = p.promo ? `<div style="background:linear-gradient(90deg,#ef4444,#f59e0b);color:#fff;font-size:.7rem;font-weight:700;text-align:center;padding:.2rem;letter-spacing:.5px;">⚡ PROMOÇÃO ESPECIAL ⚡</div>` : '';
    const oldPriceHtml = p.oldPrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:.78rem;margin-left:.35rem;">${p.oldPrice}</span>` : '';
    return `
    <div class="product-card ${p.promo?'promo-card':''}" style="cursor:pointer${p.promo?';border-color:rgba(239,68,68,.35);':''}" onclick="window.location='${isSubpage?'':'pages/'}products.html'">
      ${promoBar}
      <div class="product-img" style="padding:0;overflow:hidden;position:relative;">
        ${p.badge ? `<div class="product-badge" style="${p.promo?'background:linear-gradient(90deg,#ef4444,#f59e0b);':''}">${p.badge}</div>` : ''}
        ${imgSrc ? `<img src="${imgSrc}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;display:block;transition:transform .4s ease;" onerror="this.style.display='none';this.parentElement.style.background='rgba(0,120,212,0.1)'" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">` : `<div style="width:100%;height:180px;background:rgba(0,120,212,.1);display:flex;align-items:center;justify-content:center;font-size:3rem;">📦</div>`}
      </div>
      <div class="product-info">
        <div class="product-rating">${p.rating}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-partner">por ${p.partner}</div>
        <div class="product-footer">
          <span><span class="product-price" style="${p.promo?'color:#ef4444;':''}">${p.price}</span>${oldPriceHtml}</span>
          <button class="add-cart-btn" onclick='event.stopPropagation();addToCart({id:${JSON.stringify(p.id)},name:${JSON.stringify(p.name)},price:${JSON.stringify(p.price)},partner:${JSON.stringify(p.partner)},emoji:"📦"})'>+ Carrinho</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
renderProducts();
updateCartCount();

// ===== NEWSLETTER =====
document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('✓ Subscrito com sucesso! Obrigado.');
  e.target.reset();
});

// ===== AI ASSISTANT =====
const aiToggle = document.getElementById('aiToggle');
const aiChat = document.getElementById('aiChat');
const aiClose = document.getElementById('aiClose');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
const aiMessages = document.getElementById('aiMessages');

aiToggle?.addEventListener('click', () => aiChat?.classList.toggle('open'));
aiClose?.addEventListener('click', () => aiChat?.classList.remove('open'));

const aiResponses = {
  keywords: {
    'parceiro': 'Para se tornar parceiro da HepoMarket, aceda à página de Parceiros e preencha o formulário de cadastro. Após validação, terá acesso ao painel exclusivo! 🤝',
    'afiliado': 'O programa de afiliados permite ganhar comissões por cada venda realizada através do seu link. Aceda a "Afiliados" para se cadastrar! 💰',
    'pagamento': 'Aceitamos Multicaixa Express, transferência bancária (BPC/BAI/BFA/Standard Bank), TPA, e pagamento na entrega. 💳',
    'contacto': 'Pode contactar-nos pelo telefone 952 100 356, e-mail mvicetaca@gmail.com ou WhatsApp. Estamos em Cacuaco, Luanda! 📞',
    'entrega': 'Entregamos em toda Luanda em 24-48h e nas províncias em 3-7 dias úteis. 🚚',
    'ceo': 'O CEO da HepoMarket é Maximino Vicetaca Hepo Evaristo, fundador e visionário por trás desta plataforma! 👔',
    'desconto': 'Temos promoções semanais! Subscreva a newsletter para receber alertas de descontos exclusivos. 🎁',
    'carrinho': 'Para adicionar produtos ao carrinho, clique no botão "+ Carrinho" em qualquer produto. Pode ver o seu carrinho no canto superior direito! 🛒',
    'registar': 'Para criar uma conta, clique em "Cadastrar" no menu superior. É rápido e gratuito! ✅',
    'angola': 'A HepoMarket é uma plataforma 100% angolana com sede em Cacuaco, Luanda. Orgulhosamente ao serviço de Angola! 🇦🇴',
  },
  default: [
    'Obrigado pela sua mensagem! Como gerente automático da HepoMarket, estou aqui para ajudar. Pode perguntar sobre parceiros, afiliados, pagamentos, entregas ou produtos! 😊',
    'Entendido! Para questões específicas, pode contactar a nossa equipa pelo 952 100 356 ou mvicetaca@gmail.com. Em que mais posso ajudar? 📧',
    'Boa pergunta! A HepoMarket é a plataforma líder em Angola para comércio digital. Estou a processar a sua consulta. Precisará de mais alguma informação? 🤔',
    'Olá! Sou o Hepo Assistant, sempre pronto para ajudar. Pode explorar os nossos produtos, tornar-se parceiro ou afiliado. Como posso ajudá-lo hoje? ✨',
  ]
};

function getAiResponse(message) {
  const msg = message.toLowerCase();
  for (const [key, response] of Object.entries(aiResponses.keywords)) {
    if (msg.includes(key)) return response;
  }
  return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
}

function sendAiMessage() {
  const msg = aiInput?.value?.trim();
  if (!msg) return;

  // User message
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user';
  userDiv.textContent = msg;
  aiMessages?.appendChild(userDiv);
  aiInput.value = '';

  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-msg bot typing';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  aiMessages?.appendChild(typingDiv);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();
    const botDiv = document.createElement('div');
    botDiv.className = 'ai-msg bot';
    botDiv.textContent = getAiResponse(msg);
    aiMessages?.appendChild(botDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }, 1200 + Math.random() * 800);
}

aiSend?.addEventListener('click', sendAiMessage);
aiInput?.addEventListener('keypress', (e) => e.key === 'Enter' && sendAiMessage());

// ===== PAGE INDICATOR =====
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href')?.includes(currentPage)) {
    a.classList.add('active');
  }
});


// ── Apply saved design theme & custom bg ──
(function applyGlobalSettings(){
  try{
    const t=JSON.parse(localStorage.getItem('hepo_site_theme')||'{}');
    if(t.design&&t.design!=='default') document.body.classList.add('design-'+t.design);
    if(t.fontSize) document.documentElement.style.fontSize=t.fontSize+'px';
  }catch(e){}
  try{
    const bg=localStorage.getItem('hepo_hero_bg');
    if(bg){
      const el=document.querySelector('.hero-bg-img');
      if(el) el.style.backgroundImage='url("'+bg+'")';
      // Also set on body::before via inline style workaround
      const st=document.createElement('style');
      st.textContent='body::before{background-image:url("'+bg+'")!important}';
      document.head.appendChild(st);
    }
  }catch(e){}
})();
