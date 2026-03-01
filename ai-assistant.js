// HepoMarket — Assistente Virtual
// CEO: Maximino Vicetaca Hepo Evaristo | +244 952 100 356

function botResponse(msg) {
  const m = msg.toLowerCase();
  const cfg = (typeof DB !== 'undefined') ? DB.getConfig() : { whatsapp:'244952100356', nomeEmpresa:'HepoMarket' };
  const wa = `<a href="https://wa.me/${cfg.whatsapp}" target="_blank" style="color:#0078D4;font-weight:700">WhatsApp CEO</a>`;

  if (m.includes('afiliado') || m.includes('parceiro') || m.includes('como ganhar') || m.includes('renda extra'))
    return `Para ser afiliado HepoMarket, preencha o formulário na nossa <a href="cadastro.html" style="color:#0078D4">página de cadastro</a>. É rápido e gratuito! 🤝`;
  if (m.includes('produto') || m.includes('comprar') || m.includes('catálogo'))
    return `Veja todos os produtos disponíveis na <a href="produtos.html" style="color:#0078D4">página de produtos</a>. Para comprar, clique em "Comprar via WhatsApp". 📦`;
  if (m.includes('pagamento') || m.includes('pagar') || m.includes('multicaixa') || m.includes('iban'))
    return `Aceitamos pagamentos via <strong>IBAN</strong> e <strong>Multicaixa Express</strong>. Contacte o ${wa} para detalhes. 💳`;
  if (m.includes('contacto') || m.includes('telefone') || m.includes('whatsapp') || m.includes('falar'))
    return `Fale directamente com o CEO Maximino Vicetaca: ${wa} | 📞 +244 952 100 356`;
  if (m.includes('comissão') || m.includes('ganho') || m.includes('percentagem'))
    return `As comissões variam consoante o tipo de parceria. Contacte o ${wa} para saber as percentagens actuais. 💰`;
  if (m.includes('localização') || m.includes('sede') || m.includes('onde') || m.includes('morada'))
    return `A HepoMarket está sediada em <strong>Cacuaco, Luanda</strong>, Angola. 📍`;
  if (m.includes('ceo') || m.includes('dono') || m.includes('responsável') || m.includes('fundador'))
    return `O CEO da HepoMarket é <strong>Maximino Vicetaca Hepo Evaristo</strong>. Contacto: ${wa}`;
  if (m.includes('termos') || m.includes('condições') || m.includes('politica'))
    return `Consulte os nossos <a href="termos.html" style="color:#0078D4">Termos e Condições</a>. 📄`;
  if (m.includes('olá') || m.includes('ola') || m.includes('bom dia') || m.includes('boa') || m.includes('hi') || m.includes('hello'))
    return `Olá! Bem-vindo à <strong>${cfg.nomeEmpresa}</strong>! 👋 Posso ajudá-lo com produtos, afiliação, pagamentos ou contactos. O que precisa?`;
  if (m.includes('obrigad'))
    return `De nada! Estamos sempre à disposição. Se precisar de mais ajuda, não hesite em perguntar! 😊`;
  if (m.includes('preço') || m.includes('valor') || m.includes('custo'))
    return `Os preços variam por produto. Consulte a <a href="produtos.html" style="color:#0078D4">nossa loja</a> ou contacte o ${wa} para orçamento personalizado.`;

  return `Sou o assistente da <strong>${cfg.nomeEmpresa}</strong>. Posso ajudá-lo com:<br>• 📦 Produtos e preços<br>• 🤝 Tornar-se afiliado<br>• 💳 Formas de pagamento<br>• 📞 Contactos CEO<br><br>O que deseja saber?`;
}
