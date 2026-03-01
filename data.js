// ============================================================
// HepoMarket — Camada de Dados Global (localStorage)
// CEO: Maximino Vicetaca Hepo Evaristo | +244 952 100 356
// ============================================================

const DB = {

  // ==================== PRODUTOS ====================
  getProdutos() { return JSON.parse(localStorage.getItem('hm_produtos') || '[]'); },
  saveProdutos(arr) { localStorage.setItem('hm_produtos', JSON.stringify(arr)); this._dispatch('produtos'); },
  addProduto(p) {
    const arr = this.getProdutos();
    p.id = Date.now().toString(); p.criadoEm = new Date().toISOString();
    arr.push(p); this.saveProdutos(arr); return p;
  },
  updateProduto(id, data) { this.saveProdutos(this.getProdutos().map(p => p.id===id?{...p,...data,id}:p)); },
  removeProduto(id) { this.saveProdutos(this.getProdutos().filter(p=>p.id!==id)); },

  // ==================== SERVICOS ====================
  getServicos() { return JSON.parse(localStorage.getItem('hm_servicos') || '[]'); },
  saveServicos(arr) { localStorage.setItem('hm_servicos', JSON.stringify(arr)); this._dispatch('servicos'); },
  addServico(s) {
    const arr = this.getServicos();
    s.id = Date.now().toString(); s.criadoEm = new Date().toISOString();
    arr.push(s); this.saveServicos(arr); return s;
  },
  updateServico(id, data) { this.saveServicos(this.getServicos().map(s => s.id===id?{...s,...data,id}:s)); },
  removeServico(id) { this.saveServicos(this.getServicos().filter(s=>s.id!==id)); },

  // ==================== CLIENTES ====================
  getClientes() { return JSON.parse(localStorage.getItem('hm_clientes') || '[]'); },
  saveClientes(arr) { localStorage.setItem('hm_clientes', JSON.stringify(arr)); this._dispatch('clientes'); },
  addCliente(c) {
    const arr = this.getClientes();
    c.id = Date.now().toString(); c.criadoEm = new Date().toISOString(); c.status = 'ativo';
    arr.push(c); this.saveClientes(arr);
    this.addNotificacao({ tipo:'cliente', titulo:'Novo Cliente', mensagem:`${c.nome} registou-se como cliente`, link:'clientes' });
    return c;
  },
  updateCliente(id, data) { this.saveClientes(this.getClientes().map(c => c.id===id?{...c,...data,id}:c)); },
  removeCliente(id) { this.saveClientes(this.getClientes().filter(c=>c.id!==id)); },
  getClienteByToken(token) { return this.getClientes().find(c=>c.token===token)||null; },
  getClienteByTel(tel) { return this.getClientes().find(c=>c.tel===tel)||null; },

  // ==================== PARCEIROS ====================
  getParceiros() { return JSON.parse(localStorage.getItem('hm_parceiros') || '[]'); },
  saveParceiros(arr) { localStorage.setItem('hm_parceiros', JSON.stringify(arr)); this._dispatch('parceiros'); },
  addParceiro(p) {
    const arr = this.getParceiros();
    p.id = Date.now().toString(); p.criadoEm = new Date().toISOString();
    p.status = 'pendente'; p.totalVendas = 0; p.totalComissoes = 0;
    arr.push(p); this.saveParceiros(arr);
    this.addNotificacao({ tipo:'parceiro', titulo:'Novo Pedido de Parceiro', mensagem:`${p.nome} submeteu pedido de afiliacao`, link:'aprovacoes' });
    return p;
  },
  updateParceiro(id, data) { this.saveParceiros(this.getParceiros().map(p => p.id===id?{...p,...data,id}:p)); },
  removeParceiro(id) { this.saveParceiros(this.getParceiros().filter(p=>p.id!==id)); },
  aprovarParceiro(id) { this.updateParceiro(id,{status:'ativo',aprovadoEm:new Date().toISOString()}); },
  rejeitarParceiro(id) { this.updateParceiro(id,{status:'rejeitado',rejeitadoEm:new Date().toISOString()}); },
  getParceiroByToken(token) { return this.getParceiros().find(p=>p.token===token)||null; },
  getParceiroByTel(tel) { return this.getParceiros().find(p=>p.tel===tel)||null; },

  // ==================== PEDIDOS ====================
  getPedidos() { return JSON.parse(localStorage.getItem('hm_pedidos') || '[]'); },
  savePedidos(arr) { localStorage.setItem('hm_pedidos', JSON.stringify(arr)); this._dispatch('pedidos'); },
  addPedido(p) {
    const arr = this.getPedidos();
    p.id = Date.now().toString(); p.criadoEm = new Date().toISOString();
    p.status = 'pendente'; p.numero = 'PED-' + Date.now().toString().slice(-6);
    arr.push(p); this.savePedidos(arr);
    this.addNotificacao({ tipo:'pedido', titulo:'Novo Pedido', mensagem:`${p.numero} de ${p.nomeCliente||'Cliente'} — ${p.produto||''}`, link:'pedidos' });
    return p;
  },
  updatePedido(id, data) { this.savePedidos(this.getPedidos().map(p => p.id===id?{...p,...data,id}:p)); },
  removePedido(id) { this.savePedidos(this.getPedidos().filter(p=>p.id!==id)); },
  aprovarPedido(id) { this.updatePedido(id,{status:'confirmado',confirmadoEm:new Date().toISOString()}); },
  rejeitarPedido(id) { this.updatePedido(id,{status:'cancelado',canceladoEm:new Date().toISOString()}); },
  entregarPedido(id) { this.updatePedido(id,{status:'entregue',entregueEm:new Date().toISOString()}); },

  // ==================== CONVITES ====================
  getConvites() { return JSON.parse(localStorage.getItem('hm_convites') || '[]'); },
  saveConvites(arr) { localStorage.setItem('hm_convites', JSON.stringify(arr)); },
  gerarConvite(criadorId, criadorNome, tipo) {
    const code = 'HM' + Math.random().toString(36).substring(2,8).toUpperCase();
    const base = (typeof location !== 'undefined') ? location.href.replace(/[^/]*$/,'') : '';
    const convite = {
      id: Date.now().toString(), code, criadorId, criadorNome,
      tipo: tipo||'parceiro', criadoEm: new Date().toISOString(), usado: false,
      url: base + 'cadastro.html?ref=' + code + '&tipo=' + (tipo||'parceiro')
    };
    const arr = this.getConvites(); arr.unshift(convite); this.saveConvites(arr);
    return convite;
  },
  usarConvite(code) {
    const arr = this.getConvites(); const idx = arr.findIndex(c=>c.code===code);
    if (idx>=0) { arr[idx].usado=true; arr[idx].usadoEm=new Date().toISOString(); this.saveConvites(arr); return arr[idx]; }
    return null;
  },
  getConvite(code) { return this.getConvites().find(c=>c.code===code)||null; },

  // ==================== DADOS BANCARIOS ====================
  getDadosBancarios() {
    return JSON.parse(localStorage.getItem('hm_banking') || JSON.stringify({
      iban:'', titular:'Maximino Vicetaca', banco:'', swift:'',
      multicaixa:'', referenciaMulticaixa:'', paypal:'', outro:'',
      instrucoes:'Após o pagamento, envie o comprovativo via WhatsApp.',
      metodos:{ iban:true, multicaixa:true, paypal:false, dinheiro:true }
    }));
  },
  saveDadosBancarios(d) { localStorage.setItem('hm_banking', JSON.stringify(d)); this._dispatch('banking'); },

  // ==================== NOTIFICACOES ====================
  getNotificacoes() { return JSON.parse(localStorage.getItem('hm_notificacoes') || '[]'); },
  addNotificacao(n) {
    const arr = this.getNotificacoes();
    n.id = Date.now().toString(); n.criadoEm = new Date().toISOString(); n.lida = false;
    arr.unshift(n);
    localStorage.setItem('hm_notificacoes', JSON.stringify(arr.slice(0,60)));
    this._dispatch('notificacoes');
  },
  marcarNotificacaoLida(id) {
    const arr = this.getNotificacoes().map(n=>n.id===id?{...n,lida:true}:n);
    localStorage.setItem('hm_notificacoes', JSON.stringify(arr)); this._dispatch('notificacoes');
  },
  marcarTodasLidas() {
    const arr = this.getNotificacoes().map(n=>({...n,lida:true}));
    localStorage.setItem('hm_notificacoes', JSON.stringify(arr)); this._dispatch('notificacoes');
  },
  getNotificacoesNaoLidas() { return this.getNotificacoes().filter(n=>!n.lida).length; },

  // ==================== MENSAGENS ====================
  getMensagens() { return JSON.parse(localStorage.getItem('hm_mensagens') || '[]'); },
  addMensagem(m) {
    const arr = this.getMensagens();
    m.id = Date.now().toString(); m.criadoEm = new Date().toISOString(); m.lida = false;
    arr.unshift(m);
    localStorage.setItem('hm_mensagens', JSON.stringify(arr)); this._dispatch('mensagens');
    this.addNotificacao({ tipo:'mensagem', titulo:'Nova Mensagem', mensagem:`De ${m.nome||'Visitante'}: ${(m.texto||'').substring(0,50)}`, link:'mensagens' });
  },
  marcarMensagemLida(id) {
    const arr = this.getMensagens().map(m=>m.id===id?{...m,lida:true}:m);
    localStorage.setItem('hm_mensagens', JSON.stringify(arr)); this._dispatch('mensagens');
  },
  getMensagensNaoLidas() { return this.getMensagens().filter(m=>!m.lida).length; },
  responderMensagem(id, resposta) {
    const arr = this.getMensagens().map(m=>m.id===id?{...m,resposta,respondidoEm:new Date().toISOString(),lida:true}:m);
    localStorage.setItem('hm_mensagens', JSON.stringify(arr)); this._dispatch('mensagens');
  },

  // ==================== CONFIGURACOES ====================
  getConfig() {
    return JSON.parse(localStorage.getItem('hm_config') || JSON.stringify({
      tema:'light', corAcento:'#0078D4',
      fundoTipo:'gradiente', fundoCor1:'#e8f0fe', fundoCor2:'#c2d4f8', fundoImagem:null,
      nomeEmpresa:'HepoMarket', slogan:'Renda Extra com Segurança',
      whatsapp:'244952100356', telefone:'+244 952 100 356', email:'', endereco:'Cacuaco, Luanda, Angola',
      facebook:'', instagram:'', tiktok:'', youtube:'',
      taxaComissao:10, moeda:'Kz',
      ceoPerfil:{ nome:'Maximino Vicetaca', cargo:'CEO & Fundador', tel:'+244 952 100 356', foto:null }
    }));
  },
  saveConfig(c) { localStorage.setItem('hm_config', JSON.stringify(c)); this._dispatch('config'); },

  // ==================== STATS ====================
  getStats() {
    const pedidos = this.getPedidos();
    const parceiros = this.getParceiros();
    const produtos = this.getProdutos();
    return {
      produtos: produtos.length, servicos: this.getServicos().length,
      clientes: this.getClientes().length, parceiros: parceiros.length,
      parceirosAtivos: parceiros.filter(p=>p.status==='ativo').length,
      parceirosPendentes: parceiros.filter(p=>p.status==='pendente').length,
      pedidosTotal: pedidos.length, pedidosPendentes: pedidos.filter(p=>p.status==='pendente').length,
      pedidosConfirmados: pedidos.filter(p=>p.status==='confirmado').length,
      pedidosEntregues: pedidos.filter(p=>p.status==='entregue').length,
      mensagensNaoLidas: this.getMensagensNaoLidas(),
      notificacoesNaoLidas: this.getNotificacoesNaoLidas(),
      totalValorProdutos: produtos.reduce((s,p)=>s+(parseFloat(p.preco)||0),0),
      receitaTotal: pedidos.filter(p=>p.status==='entregue').reduce((s,p)=>s+(parseFloat(p.total)||0),0),
      convites: this.getConvites().length
    };
  },

  _dispatch(type) { window.dispatchEvent(new CustomEvent('hm_update',{detail:type})); }
};

// ==================== UTILITARIOS ====================
function imageParaBase64(file) {
  return new Promise((res,rej) => {
    if (!file) { res(null); return; }
    const r = new FileReader();
    r.onload = e => res(e.target.result); r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function formatarKz(v) {
  const n = parseFloat(v)||0;
  const m = (typeof DB!=='undefined')?DB.getConfig().moeda||'Kz':'Kz';
  return n.toLocaleString('pt-AO')+' '+m;
}
function formatarData(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-AO',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function formatarDataRelativa(iso) {
  if (!iso) return '-';
  const diff = Date.now()-new Date(iso).getTime();
  const mins = Math.floor(diff/60000);
  if (mins<1) return 'Agora mesmo';
  if (mins<60) return `Ha ${mins}m`;
  const hrs = Math.floor(mins/60);
  if (hrs<24) return `Ha ${hrs}h`;
  const days = Math.floor(hrs/24);
  if (days<7) return `Ha ${days}d`;
  return formatarData(iso);
}
function gerarToken() { return Math.random().toString(36).substring(2)+Date.now().toString(36); }

// ==================== AUTH CEO ====================
const Auth = {
  _getCreds() { return JSON.parse(localStorage.getItem('hm_creds')||JSON.stringify({user:'Maximino',pass:'hepo2025'})); },
  login(u,p) { const c=this._getCreds(); if(u===c.user&&p===c.pass){sessionStorage.setItem('hm_auth','1');return true;} return false; },
  logout() { sessionStorage.removeItem('hm_auth'); },
  isLogged() { return sessionStorage.getItem('hm_auth')==='1'; },
  guard() { if(!this.isLogged()) window.location.href='login.html'; },
  alterarSenha(s) { const c=this._getCreds(); c.pass=s; localStorage.setItem('hm_creds',JSON.stringify(c)); },
  alterarUtilizador(u) { const c=this._getCreds(); c.user=u; localStorage.setItem('hm_creds',JSON.stringify(c)); },
  getUtilizador() { return this._getCreds().user; }
};

// ==================== AUTH CLIENTE ====================
const AuthCliente = {
  _key:'hm_cliente_auth',
  login(id,token) { sessionStorage.setItem(this._key,JSON.stringify({id,token})); },
  logout() { sessionStorage.removeItem(this._key); },
  getSession() { try{return JSON.parse(sessionStorage.getItem(this._key)||'null');}catch{return null;} },
  isLogged() { return !!this.getSession(); },
  guard() { if(!this.isLogged()) window.location.href='cliente-login.html'; },
  getCliente() { const s=this.getSession(); if(!s)return null; return DB.getClienteByToken(s.token); }
};

// ==================== AUTH PARCEIRO ====================
const AuthParceiro = {
  _key:'hm_parceiro_auth',
  login(id,token) { sessionStorage.setItem(this._key,JSON.stringify({id,token})); },
  logout() { sessionStorage.removeItem(this._key); },
  getSession() { try{return JSON.parse(sessionStorage.getItem(this._key)||'null');}catch{return null;} },
  isLogged() { return !!this.getSession(); },
  guard() { if(!this.isLogged()) window.location.href='parceiro-login.html'; },
  getParceiro() { const s=this.getSession(); if(!s)return null; return DB.getParceiroByToken(s.token); }
};

// ==================== CARRINHO ====================
const Carrinho = {
  _k:'hm_carrinho',
  get(){return JSON.parse(localStorage.getItem(this._k)||'[]');},
  save(a){localStorage.setItem(this._k,JSON.stringify(a));window.dispatchEvent(new CustomEvent('hm_update',{detail:'carrinho'}));},
  add(item){
    const a=this.get();const i=a.findIndex(x=>x.prodId===item.prodId);
    if(i>=0)a[i].qtd=(a[i].qtd||1)+1;else{item.qtd=1;a.push(item);}
    this.save(a);
  },
  setQtd(id,q){let a=this.get().map(x=>x.prodId===id?{...x,qtd:Math.max(0,parseInt(q)||0)}:x).filter(x=>x.qtd>0);this.save(a);},
  remove(id){this.save(this.get().filter(x=>x.prodId!==id));},
  clear(){this.save([]);},
  count(){return this.get().reduce((s,x)=>s+(x.qtd||1),0);},
  subtotal(){return this.get().reduce((s,x)=>s+(parseFloat(x.preco)||0)*(x.qtd||1),0);}
};

// ==================== CUPOES ====================
const Cupoes = {
  getAll(){return JSON.parse(localStorage.getItem('hm_cupoes')||'[]');},
  save(a){localStorage.setItem('hm_cupoes',JSON.stringify(a));},
  add(c){const a=this.getAll();c.id=Date.now().toString();c.criadoEm=new Date().toISOString();c.usos=0;a.push(c);this.save(a);return c;},
  update(id,d){this.save(this.getAll().map(c=>c.id===id?{...c,...d}:c));},
  remove(id){this.save(this.getAll().filter(c=>c.id!==id));},
  validar(codigo){
    const c=this.getAll().find(x=>x.ativo&&x.codigo&&x.codigo.toUpperCase()===(codigo||'').toUpperCase().trim());
    if(!c)return{ok:false,msg:'Cupão inválido ou inexistente'};
    if(c.maxUsos&&c.usos>=c.maxUsos)return{ok:false,msg:'Cupão atingiu o limite de usos'};
    if(c.validade&&new Date(c.validade)<new Date())return{ok:false,msg:'Cupão expirado'};
    return{ok:true,cupao:c};
  },
  usar(id){const c=this.getAll().find(x=>x.id===id);if(c)this.update(id,{usos:(c.usos||0)+1});}
};
