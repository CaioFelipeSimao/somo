// Janela "Dúvidas" no celular, com toques de verdade (não .click() por código): a pessoa está no meio da página,
// toca em "Dúvidas", lê as 8 perguntas até o fim, fecha (pelo botão ou tocando fora) e volta para onde estava.
// Cada toque confere antes qual elemento está debaixo do dedo, e cada abertura confere que a janela abriu:
// sem isso um item pode passar porque outra coisa fez o trabalho (o fundo fechou no lugar do botão, a janela nem reabriu).
// Limite conhecido: a janela é rolada por código, não arrastando o dedo; o arrasto que escapa para a página não é testado.
// `preparar(p)` existe só para a prova de que os itens falham: ela injeta defeitos na página antes de abrir.
export async function conferirDuvidas({ navegador, BASE, item, espera, preparar }) {
  for (const [largura, alturaTela] of [[360, 640], [390, 844]]) {
    const p = await navegador.newPage();
    await p.setViewport({ width: largura, height: alturaTela, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    if (preparar) await preparar(p);
    await p.goto(BASE, { waitUntil: 'networkidle0' });
    const t = `${largura}x${alturaTela}`;

    // o elemento está inteiro na tela (e dentro da janela, se pedido) e é ele mesmo que recebe o dedo no centro
    const vistoInteiro = (sel, naJanela) => p.evaluate((s, nj) => {
      const e = document.querySelector(s), r = e.getBoundingClientRect(), j = document.querySelector('dialog.ajuda').getBoundingClientRect();
      const lim = nj ? { l: j.left, t: j.top, r: j.right, b: j.bottom } : { l: 0, t: 0, r: innerWidth, b: innerHeight };
      const dentro = r.width > 0 && r.left >= lim.l - 1 && r.top >= lim.t - 1 && r.right <= lim.r + 1 && r.bottom <= lim.b + 1;
      const x = r.left + r.width / 2, y = r.top + r.height / 2, emCima = dentro ? document.elementFromPoint(x, y) : null;
      const est = getComputedStyle(e);
      return { ok: dentro && !!emCima && e.contains(emCima) && est.visibility === 'visible' && +est.opacity > 0.5, x, y, emCima: emCima ? `${emCima.tagName}.${emCima.className}` : null };
    }, sel, naJanela);
    // toca só se o dedo cai no próprio elemento; senão não toca e devolve false
    const tocar = async sel => { const v = await vistoInteiro(sel, false); if (v.ok) { await p.touchscreen.tap(v.x, v.y); await espera(400); } return v.ok; };
    const aberta = () => p.evaluate(() => document.querySelector('dialog.ajuda').open);
    // abre pela aba e confere; se não abriu, os itens seguintes desta tela não valem nada e param aqui
    const abrir = async quando => { const ok = await tocar('.barra-ajuda') && await aberta(); item(ok, `${t}: tocar em "Dúvidas" abre a janela (${quando})`); return ok; };
    // a rolagem suave do Chrome pausa ~450 ms antes do fim: só conta como parada depois de 600 ms no mesmo lugar
    const rolagemParada = async () => {
      let y = null, iguais = 0;
      for (let i = 0; i < 60 && iguais < 4; i++) { await espera(150); const agora = await p.evaluate(() => Math.round(scrollY)); iguais = agora === y ? iguais + 1 : 0; y = agora; }
      return y;
    };

    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 2500); });
    const y0 = await rolagemParada();
    const botao = await p.evaluate(() => Math.round(document.querySelector('.barra-ajuda').getBoundingClientRect().height));
    const botaoVisto = await vistoInteiro('.barra-ajuda', false);
    item(botaoVisto.ok && botao >= 44, `${t}: "Dúvidas" está na tela no meio da página, livre, com 44 px de altura para o dedo`, `${botao} px, sob o dedo: ${botaoVisto.emCima}`);
    if (!await abrir('primeira vez')) { await p.close(); continue; }

    const caixa = await p.evaluate(() => {
      const d = document.querySelector('dialog.ajuda'), r = d.getBoundingClientRect();
      return { margem: Math.round(Math.min(r.left, innerWidth - r.right, r.top, innerHeight - r.bottom)), lateral: d.scrollWidth - d.clientWidth, pagina: document.documentElement.scrollWidth - innerWidth };
    });
    item(caixa.margem >= 8 && caixa.lateral <= 0 && caixa.pagina <= 0, `${t}: a janela cabe na tela, com margem, sem rolagem para o lado (nela nem na página)`, JSON.stringify(caixa));
    const fecharAntes = await vistoInteiro('.ajuda-fechar', true);
    item(fecharAntes.ok, `${t}: o botão "Fechar" aparece inteiro e livre ao abrir`, `sob o dedo: ${fecharAntes.emCima}`);

    const lista = await p.evaluate(() => {
      const d = document.querySelector('dialog.ajuda');
      const legivel = e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return e.textContent.trim() && s.visibility === 'visible' && +s.opacity > 0.5 && r.height > 0; };
      const pares = [...d.querySelectorAll('.ajuda-lista > div')].map(x => legivel(x.querySelector('dt')) && legivel(x.querySelector('dd')));
      const letra = Math.min(...[...d.querySelectorAll('.ajuda-lista dt, .ajuda-lista dd')].map(e => parseFloat(getComputedStyle(e).fontSize)));
      return { total: pares.length, legiveis: pares.filter(Boolean).length, letra, atalhos: getComputedStyle(d.querySelector('.ajuda-atalhos')).display };
    });
    item(lista.total === 8 && lista.legiveis === 8, `${t}: as 8 perguntas estão na janela, cada uma com resposta visível`, `${lista.legiveis} de ${lista.total} visíveis`);
    item(lista.letra >= 14, `${t}: letra das perguntas e respostas com 14 px ou mais`, `${lista.letra} px`);
    item(lista.atalhos === 'none', `${t}: atalhos de teclado não aparecem em tela de toque`, lista.atalhos);

    await p.evaluate(() => { const d = document.querySelector('dialog.ajuda'); d.scrollTop = d.scrollHeight; }); // rola por código (ver limite no topo)
    await espera(300);
    const ultima = await vistoInteiro('.ajuda-lista > div:last-child dd', true), pedido = await vistoInteiro('.ajuda .btn', true), fecharFim = await vistoInteiro('.ajuda-fechar', true);
    item(ultima.ok && pedido.ok, `${t}: rolando a janela até o fim, a última resposta e o botão do pedido aparecem inteiros, sem nada por cima`, `sob a resposta: ${ultima.emCima}; sob o botão: ${pedido.emCima}`);
    item(fecharFim.ok, `${t}: no fim da leitura o botão "Fechar" continua na tela, livre`, `sob o dedo: ${fecharFim.emCima}`);

    const tocouFechar = fecharFim.ok && await tocar('.ajuda-fechar');
    const y1 = await rolagemParada();
    item(tocouFechar && !await aberta() && Math.abs(y1 - y0) <= 2, `${t}: tocar em "Fechar" fecha e a página fica onde estava`, `tocou: ${tocouFechar}, aberta: ${await aberta()}, rolagem ${y0} → ${y1}`);

    if (!await abrir('de novo, para o fundo escuro')) { await p.close(); continue; }
    const fundo = await p.evaluate(h => { const e = document.elementFromPoint(3, h / 2); return e?.matches('dialog.ajuda') ? null : `${e?.tagName}.${e?.className}`; }, alturaTela);
    if (!fundo) { await p.touchscreen.tap(3, Math.round(alturaTela / 2)); await espera(400); }
    const y2 = await rolagemParada();
    item(!fundo && !await aberta() && Math.abs(y2 - y0) <= 2, `${t}: tocar no fundo escuro fecha e a página fica onde estava`, fundo ? `o ponto não é o fundo: ${fundo}` : `aberta: ${await aberta()}, rolagem ${y0} → ${y2}`);

    if (!await abrir('de novo, para o pedido')) { await p.close(); continue; }
    await p.evaluate(() => { const d = document.querySelector('dialog.ajuda'); d.scrollTop = d.scrollHeight; }); await espera(300);
    const tocouPedido = await tocar('.ajuda .btn');
    await rolagemParada();
    // o começo do formulário para logo abaixo da barra presa (barra + 8 px, o scroll-padding da página), com 4 px de folga
    const form = await p.evaluate(() => ({ aberta: document.querySelector('dialog.ajuda').open, topo: Math.round(document.querySelector('#formulario').getBoundingClientRect().top), barra: document.querySelector('.barra').offsetHeight }));
    item(tocouPedido && !form.aberta && Math.abs(form.topo - (form.barra + 8)) <= 4,
      `${t}: "Quero meu mês arrumado" da janela fecha e leva ao começo do formulário`, `tocou: ${tocouPedido}, ${JSON.stringify(form)}`);
    await p.close();
  }
}
