/**
 * HepoMarket – Motor de Dados Completo v5
 * Autenticação · Mensagens · Links de Afiliados · Estatísticas · Notificações
 */
const HepoAuth = {
  // Clear any previously stored products on version change
  _clearOldProducts() {
    const vKey = 'hepo_version';
    const current = 'v10';
    if (localStorage.getItem(vKey) !== current) {
      localStorage.removeItem('hepo_admin_products');
      localStorage.setItem(vKey, current);
    }
  },

  K: {
    users:    'hepo_users',
    session:  'hepo_session',
    orders:   'hepo_orders',
    bank:     'hepo_bank',
    products: 'hepo_admin_products',
    recovery: 'hepo_recovery_tokens',
    messages: 'hepo_messages',
    notifs:   'hepo_notifications',
    clicks:   'hepo_link_clicks',
    invites:  'hepo_invites',
    emailcfg: 'hepo_emailjs_config',
    adminProds: 'hepo_admin_products',
  },

  CEO: {
    email: 'ceo@hepomarket.ao',
    password: '%0HnzV7#nt7p',
    nome: 'HepoMarket – CEO',
    role: 'ceo',
    id: 0,
  },

  // ══════════════════ UTILIZADORES ══════════════════
  getUsers()  { this._clearOldProducts();
    return JSON.parse(localStorage.getItem(this.K.users)||'[]'); },
  _getUsers() { try { return JSON.parse(localStorage.getItem(this.K.users)||'[]'); } catch { return []; } },
  saveUsers(a) { localStorage.setItem(this.K.users, JSON.stringify(a)); },
  getUserById(id) { return this.getUsers().find(u=>u.id===id)||null; },
  getUserByEmail(e) { return this.getUsers().find(u=>u.email.toLowerCase()===e.toLowerCase())||null; },

  register(data) {
    const users = this.getUsers();
    if (users.find(u=>u.email.toLowerCase()===data.email.toLowerCase()))
      return { error:'Este e-mail já está registado. Faça login.' };
    // Gera código de referência único
    const refCode = 'HM-' + data.role.substring(0,3).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    const user = {
      id: Date.now(),
      registeredAt: new Date().toISOString(),
      status: data.role==='cliente' ? 'ativo' : 'pendente',
      refCode,
      clickStats: { total:0, produtos:0, loja:0, convites:0 },
      ...data,
    };
    users.push(user);
    this.saveUsers(users);
    // Notifica CEO de novo registo
    this.addNotification(0, {
      tipo:'novo_registo', titulo:'Novo '+(data.role==='parceiro'?'Parceiro':data.role==='afiliado'?'Afiliado':'Cliente')+' registado',
      corpo:`${data.nome||data.nomeCompleto} (${data.email}) registou-se como ${data.role}.`,
      fromId: user.id, link:'#',
    });
    // Verifica se veio por convite
    if (data.invitedBy) {
      this.trackClick(data.invitedBy, 'convites');
    }
    return { success:true, user };
  },

  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u=>u.id===id);
    if (idx===-1) return false;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return true;
  },

  deleteUser(id) { this.saveUsers(this.getUsers().filter(u=>u.id!==id)); },

  // ══════════════════ SESSÃO ══════════════════
  getSession() { try { return JSON.parse(sessionStorage.getItem(this.K.session)||'null'); } catch { return null; } },
  setSession(u) {
    sessionStorage.setItem(this.K.session, JSON.stringify(u));
    if (u.role==='ceo') sessionStorage.setItem('hepoAdminAuth','true');
  },
  logout() { sessionStorage.removeItem(this.K.session); sessionStorage.removeItem('hepoAdminAuth'); },

  // ══════════════════ LOGIN ══════════════════
  login(email, password, expectedRole) {
    email = email.trim().toLowerCase();
    if (email===this.CEO.email.toLowerCase() && password===this.CEO.password) {
      if (expectedRole && expectedRole!=='ceo')
        return { error:'Estas credenciais são do CEO. Selecione "CEO".' };
      this.setSession({...this.CEO});
      return { success:true, user:{...this.CEO} };
    }
    const user = this.getUserByEmail(email);
    if (!user) return { error:'E-mail não encontrado. Crie uma conta.' };
    if (user.password!==password) return { error:'Palavra-passe incorrecta.' };
    if (expectedRole && user.role!==expectedRole)
      return { error:`Esta conta é do tipo "${user.role}". Selecione o separador correcto.` };
    // Contas pendentes de parceiro/afiliado podem entrar para ver o dashboard
    // (o dashboard mostra banner de pendente). Apenas clientes ficam bloqueados se pendente.
    if (user.status==='pendente' && user.role==='cliente')
      return { error:'Conta a aguardar verificação. Verifique o seu e-mail.' };
    if (user.status==='suspenso')
      return { error:'Conta suspensa. Contacte: suporte@hepomarket.ao' };
    const session = { id:user.id, email:user.email, nome:user.nome||user.nomeCompleto, role:user.role, status:user.status };
    this.setSession(session);
    return { success:true, user:session };
  },

  // ══════════════════ RECUPERAÇÃO ══════════════════
  requestPasswordRecovery(email) {
    email = email.trim().toLowerCase();
    if (email===this.CEO.email.toLowerCase())
      return { error:'Para recuperar acesso CEO: mvicetaca@gmail.com' };
    const user = this.getUserByEmail(email);
    if (!user) return { error:'E-mail não encontrado.' };
    const token = Math.floor(1000+Math.random()*9000).toString();
    const tokens = JSON.parse(localStorage.getItem(this.K.recovery)||'{}');
    tokens[email] = { token, expiresAt: Date.now()+15*60*1000 };
    localStorage.setItem(this.K.recovery, JSON.stringify(tokens));
    return { success:true, token };
  },
  verifyRecoveryToken(email, token) {
    const tokens = JSON.parse(localStorage.getItem(this.K.recovery)||'{}');
    const e = tokens[email.trim().toLowerCase()];
    if (!e) return { error:'Sem pedido de recuperação.' };
    if (Date.now()>e.expiresAt) return { error:'Código expirado.' };
    if (e.token!==token.trim()) return { error:'Código incorrecto.' };
    return { success:true };
  },
  resetPassword(email, token, newPassword) {
    const v = this.verifyRecoveryToken(email, token);
    if (v.error) return v;
    if (newPassword.length<8) return { error:'Mínimo 8 caracteres.' };
    email = email.trim().toLowerCase();
    const users = this.getUsers();
    const idx = users.findIndex(u=>u.email.toLowerCase()===email);
    if (idx===-1) return { error:'Utilizador não encontrado.' };
    users[idx].password = newPassword;
    this.saveUsers(users);
    const tokens = JSON.parse(localStorage.getItem(this.K.recovery)||'{}');
    delete tokens[email];
    localStorage.setItem(this.K.recovery, JSON.stringify(tokens));
    return { success:true };
  },

  // ══════════════════ PROTEÇÃO ══════════════════
  requireAuth(allowedRoles) {
    const s = this.getSession();
    if (!s) {
      sessionStorage.setItem('hepo_redirect_after_login', window.location.pathname.split('/').pop());
      window.location.replace('login.html'); return null;
    }
    if (allowedRoles && !allowedRoles.includes(s.role)) {
      alert('⚠️ Acesso negado para: '+s.role);
      window.location.replace(s.role==='ceo'?'admin.html':'dashboard.html'); return null;
    }
    return s;
  },

  // ══════════════════ PEDIDOS ══════════════════
  getOrders() { try { return JSON.parse(localStorage.getItem(this.K.orders)||'[]'); } catch { return []; } },
  saveOrders(a) { localStorage.setItem(this.K.orders, JSON.stringify(a)); },
  addOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      id: '#HM-'+new Date().getFullYear()+'-'+String(orders.length+1).padStart(4,'0'),
      createdAt: new Date().toISOString(), status:'pendente', ...order,
    };
    orders.push(newOrder);
    this.saveOrders(orders);
    if (order.userId) {
      const users = this.getUsers();
      const idx = users.findIndex(u=>u.id===order.userId);
      if (idx!==-1) { users[idx].totalOrders=(users[idx].totalOrders||0)+1; users[idx].totalGasto=(users[idx].totalGasto||0)+order.total; this.saveUsers(users); }
    }
    // Notifica CEO
    this.addNotification(0, { tipo:'novo_pedido', titulo:'Novo Pedido: '+newOrder.id, corpo:`${order.nomeCliente} fez um pedido de ${this.formatMoney(order.total)}.`, link:'pedidos' });
    // Se veio por afiliado, regista comissão
    if (order.refCode) {
      const users = this.getUsers();
      const aff = users.find(u=>u.refCode===order.refCode);
      if (aff) {
        const comissao = Math.round(order.total * 0.05); // 5% afiliado
        users[users.indexOf(aff)].comissoesPendentes = (aff.comissoesPendentes||0)+comissao;
        users[users.indexOf(aff)].totalVendas = (aff.totalVendas||0)+1;
        this.saveUsers(users);
        this.addNotification(aff.id, { tipo:'comissao', titulo:'Nova comissão!', corpo:`Recebeu uma comissão de ${this.formatMoney(comissao)} pelo pedido ${newOrder.id}.`, link:'comissoes' });
      }
    }
    return newOrder;
  },
  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o=>o.id===orderId);
    if (idx===-1) return false;
    const old = orders[idx].status;
    orders[idx].status = status; orders[idx].updatedAt = new Date().toISOString();
    this.saveOrders(orders);
    // Notifica cliente
    if (orders[idx].userId) {
      const labels = { processando:'A ser processado',entregue:'Entregue com sucesso ✅',cancelado:'Cancelado' };
      this.addNotification(orders[idx].userId, {
        tipo:'status_pedido', titulo:'Pedido '+orderId+' actualizado',
        corpo:'O seu pedido está agora: '+(labels[status]||status), link:'pedidos'
      });
    }
    return true;
  },

  // ══════════════════ MENSAGENS IN-APP ══════════════════
  getMessages() { try { return JSON.parse(localStorage.getItem(this.K.messages)||'[]'); } catch { return []; } },
  saveMessages(a) { localStorage.setItem(this.K.messages, JSON.stringify(a)); },

  sendMessage({ fromId, toId, assunto, corpo, fromNome }) {
    const msgs = this.getMessages();
    const msg = {
      id: 'msg-'+Date.now(),
      fromId: fromId===0?0:parseInt(fromId),
      toId: toId==='all'?'all':parseInt(toId),
      fromNome: fromNome || (fromId===0?'HepoMarket – CEO':'Utilizador'),
      assunto, corpo,
      sentAt: new Date().toISOString(),
      readBy: [],
    };
    msgs.push(msg);
    this.saveMessages(msgs);
    // Notificação para destinatário
    const notifTargets = toId==='all' ? this.getUsers().map(u=>u.id) : [parseInt(toId)];
    notifTargets.forEach(uid => {
      this.addNotification(uid, { tipo:'mensagem', titulo:'Nova mensagem: '+assunto, corpo: corpo.substring(0,80)+'...', link:'mensagens' });
    });
    return msg;
  },

  getMessagesFor(userId) {
    const msgs = this.getMessages();
    userId = userId===0?0:parseInt(userId);
    return msgs.filter(m =>
      m.toId==='all' || m.toId===userId || m.fromId===userId
    ).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
  },

  getInboxFor(userId) {
    userId = userId===0?0:parseInt(userId);
    return this.getMessages().filter(m =>
      m.toId==='all' || m.toId===userId
    ).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
  },

  markRead(msgId, userId) {
    const msgs = this.getMessages();
    const m = msgs.find(m=>m.id===msgId);
    if (m && !m.readBy.includes(userId)) { m.readBy.push(userId); this.saveMessages(msgs); }
  },

  getUnreadCount(userId) {
    userId = userId===0?0:parseInt(userId);
    return this.getInboxFor(userId).filter(m=>!m.readBy.includes(userId)).length;
  },

  // ══════════════════ NOTIFICAÇÕES ══════════════════
  getNotifications() { try { return JSON.parse(localStorage.getItem(this.K.notifs)||'[]'); } catch { return []; } },
  saveNotifications(a) { localStorage.setItem(this.K.notifs, JSON.stringify(a)); },

  addNotification(userId, data) {
    const notifs = this.getNotifications();
    notifs.unshift({ id:'n-'+Date.now()+Math.random(), userId: userId===0?0:parseInt(userId), lida:false, createdAt:new Date().toISOString(), ...data });
    // Máx 100 notificações
    if (notifs.length>100) notifs.splice(100);
    this.saveNotifications(notifs);
  },

  getNotificationsFor(userId) {
    userId = userId===0?0:parseInt(userId);
    return this.getNotifications().filter(n=>n.userId===userId);
  },

  markNotifRead(id) {
    const n = this.getNotifications();
    const item = n.find(x=>x.id===id);
    if (item) { item.lida=true; this.saveNotifications(n); }
  },

  clearNotifications(userId) {
    userId = userId===0?0:parseInt(userId);
    this.saveNotifications(this.getNotifications().filter(n=>n.userId!==userId));
  },

  getUnreadNotifCount(userId) {
    userId = userId===0?0:parseInt(userId);
    return this.getNotificationsFor(userId).filter(n=>!n.lida).length;
  },

  // ══════════════════ LINKS E ESTATÍSTICAS DE CLIQUES ══════════════════
  trackClick(refCode, tipo='produtos') {
    const users = this.getUsers();
    const idx = users.findIndex(u=>u.refCode===refCode);
    if (idx===-1) return;
    if (!users[idx].clickStats) users[idx].clickStats = { total:0, produtos:0, loja:0, convites:0 };
    users[idx].clickStats[tipo] = (users[idx].clickStats[tipo]||0)+1;
    users[idx].clickStats.total = (users[idx].clickStats.total||0)+1;
    this.saveUsers(users);
    // Registo detalhado
    const clicks = JSON.parse(localStorage.getItem(this.K.clicks)||'[]');
    clicks.push({ refCode, tipo, at: new Date().toISOString() });
    localStorage.setItem(this.K.clicks, JSON.stringify(clicks.slice(-500)));
  },

  getBaseUrl() {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  },

  generateLinks(refCode) {
    const base = this.getBaseUrl();
    return {
      produtos: base + 'products.html?ref=' + refCode,
      loja:     base + 'index.html?ref=' + refCode,
      convite:  base + 'register.html?invite=' + refCode,
    };
  },

  // ══════════════════ CONVITES ══════════════════
  getInviteInfo(refCode) {
    const user = this.getUsers().find(u=>u.refCode===refCode);
    if (!user) return null;
    return { nome: user.nome||user.nomeCompleto, role: user.role, loja: user.loja||'' };
  },

  // ══════════════════ DADOS BANCÁRIOS ══════════════════
  getBank() { try { return JSON.parse(localStorage.getItem(this.K.bank)||'[]'); } catch { return []; } },
  saveBank(a) { localStorage.setItem(this.K.bank, JSON.stringify(a)); },

  // ══════════════════ PRODUTOS (CEO) ══════════════════
  getAdminProducts() { try { return JSON.parse(localStorage.getItem(this.K.products)||'[]'); } catch { return []; } },
  saveAdminProducts(a) { localStorage.setItem(this.K.products, JSON.stringify(a)); },

  addAdminProduct(p) {
    const prods = this.getAdminProducts();
    const newP = { id:'adm-'+Date.now(), addedAt:new Date().toISOString(), editedAt:null, ...p };
    prods.unshift(newP);
    this.saveAdminProducts(prods);
    return newP;
  },

  updateAdminProduct(id, updates) {
    const prods = this.getAdminProducts();
    const idx = prods.findIndex(p=>p.id===id);
    if (idx===-1) return false;
    prods[idx] = { ...prods[idx], ...updates, editedAt: new Date().toISOString() };
    this.saveAdminProducts(prods);
    return true;
  },

  clearAllProducts() {
    localStorage.removeItem(this.K.adminProds || 'hepo_admin_products');
  },
  removeAdminProduct(id) {
    this.saveAdminProducts(this.getAdminProducts().filter(p=>p.id!==id));
  },

  // ══════════════════ CONFIG EMAILJS ══════════════════
  getEmailConfig() { try { return JSON.parse(localStorage.getItem(this.K.emailcfg)||'null'); } catch { return null; } },
  saveEmailConfig(cfg) { localStorage.setItem(this.K.emailcfg, JSON.stringify(cfg)); },

  // ══════════════════ UTILIDADES ══════════════════
  formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  },
  formatDateShort(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'});
  },
  formatMoney(v) { return parseInt(v||0).toLocaleString('pt-PT')+' Kz'; },
  timeAgo(iso) {
    if (!iso) return '';
    const d = (Date.now()-new Date(iso))/1000;
    if (d<60) return 'agora mesmo';
    if (d<3600) return Math.floor(d/60)+'m atrás';
    if (d<86400) return Math.floor(d/3600)+'h atrás';
    return Math.floor(d/86400)+'d atrás';
  },
};

// ══════════════════ EmailJS – Envio Real de E-mails ══════════════════
const HepoEmail = {
  // Envia e-mail real via EmailJS (grátis – 200/mês)
  // Configuração em: emailjs.com
  async send({ to_email, to_name, subject, message, from_name='HepoMarket' }) {
    const cfg = HepoAuth.getEmailConfig();
    if (!cfg || !cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
      console.warn('EmailJS não configurado. Usando modo in-app.');
      return { success:false, reason:'not_configured' };
    }
    try {
      // Carrega SDK se necessário
      if (!window.emailjs) {
        await new Promise((res,rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
          s.onload=res; s.onerror=rej;
          document.head.appendChild(s);
        });
        emailjs.init({ publicKey: cfg.publicKey });
      }
      await emailjs.send(cfg.serviceId, cfg.templateId, {
        to_email, to_name: to_name||to_email, subject, message, from_name,
        reply_to: 'ceo@hepomarket.ao',
      });
      return { success:true };
    } catch(err) {
      console.error('EmailJS error:', err);
      return { success:false, reason: err.message };
    }
  },

  // Envia sempre in-app + tenta real se configurado
  async sendFull({ fromId=0, toId, toEmail, toName, assunto, corpo }) {
    // Sempre guarda in-app
    HepoAuth.sendMessage({ fromId, toId, fromNome:'HepoMarket – CEO', assunto, corpo });
    // Tenta e-mail real
    const r = await this.send({ to_email:toEmail, to_name:toName, subject:assunto, message:corpo });
    return r;
  },
};

// ══════════════════ Rastreamento de Links ══════════════════
// Executado em todas as páginas para capturar cliques de afiliados
(function trackRefOnLoad() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const invite = params.get('invite');
  if (ref) {
    sessionStorage.setItem('hepo_ref', ref);
    HepoAuth.trackClick(ref, window.location.pathname.includes('products')?'produtos':'loja');
  }
  if (invite) {
    sessionStorage.setItem('hepo_invite', invite);
    HepoAuth.trackClick(invite, 'convites');
  }
})();

window.HepoAuth = HepoAuth;
window.HepoEmail = HepoEmail;
