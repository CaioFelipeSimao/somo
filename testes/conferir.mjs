// Confere o site antes de publicar: gera a versão de publicação, abre num servidor local com as mesmas
// proteções da Vercel (vercel.json) e testa no "PC" e no "celular" o que já quebrou alguma vez.
// Uso: npm run conferir      (sai com erro se algum item falhar)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirNavegador } from '../scripts/navegador.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pasta = path.join(raiz, '.conferir');
let BASE = ''; // a porta é escolhida na hora (uma livre), para dois testes poderem rodar juntos
const espera = ms => new Promise(ok => setTimeout(ok, ms));
let falhas = 0;
const item = (ok, texto, detalhe = '') => { if (!ok) falhas++; console.log(`${ok ? '  ok ' : '  FALHOU'}  ${texto}${!ok && detalhe ? ` (${detalhe})` : ''}`); };

// 1. versão de publicação (sem exigir a chave e o endereço, que só existem na publicação de verdade)
console.log('Gerando a versão de publicação…');
execSync(`npx vite build --outDir "${pasta}" --emptyOutDir --logLevel error`, { cwd: raiz, stdio: 'inherit', env: { ...process.env, P0_SEM_CHAVE: '1' }, shell: true });

// 2. servidor local com os cabeçalhos do vercel.json (sem HTTPS obrigatório, que não existe em localhost)
const cabecalhos = JSON.parse(fs.readFileSync(path.join(raiz, 'vercel.json'), 'utf8')).headers[0].headers
  .filter(h => h.key !== 'Strict-Transport-Security')
  .map(h => h.key === 'Content-Security-Policy' ? { ...h, value: h.value.replace('; upgrade-insecure-requests', '') } : h);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const servidor = http.createServer((pedido, resposta) => {
  let rota = decodeURIComponent(pedido.url.split('?')[0]);
  if (rota === '/') rota = '/index.html';
  if (!path.extname(rota)) rota += '.html'; // como o cleanUrls da Vercel: /privacidade → privacidade.html
  const arquivo = path.join(pasta, rota);
  if (!arquivo.startsWith(pasta) || !fs.existsSync(arquivo)) { // como a Vercel: endereço que não existe mostra o 404.html
    resposta.statusCode = 404; cabecalhos.forEach(h => resposta.setHeader(h.key, h.value));
    resposta.setHeader('Content-Type', TIPOS['.html']); resposta.end(fs.readFileSync(path.join(pasta, '404.html'))); return;
  }
  cabecalhos.forEach(h => resposta.setHeader(h.key, h.value));
  resposta.setHeader('Content-Type', TIPOS[path.extname(arquivo)] || 'application/octet-stream');
  resposta.end(fs.readFileSync(arquivo));
}).listen(0);
await new Promise(ok => servidor.once('listening', ok));
BASE = `http://localhost:${servidor.address().port}`;

const navegador = await abrirNavegador(['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']);
const VISTAS = [['PC', { width: 1707, height: 960 }], ['celular', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]];

try {
  for (const [nome, vista] of VISTAS) {
    console.log(`\n${nome}`);
    const p = await navegador.newPage();
    await p.setViewport(vista);
    const erros = [];
    p.on('pageerror', e => erros.push(String(e)));
    p.on('console', m => { if (m.location()?.url?.includes('api.web3forms.com')) return; if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) erros.push(m.text()); });
    // o teste nunca manda pedido de verdade: o envio ao Web3Forms é barrado (vira a falha de rede que o teste confere)
    await p.setRequestInterception(true);
    p.on('request', r => (r.url().includes('api.web3forms.com') ? r.abort() : r.continue()));
    p.on('requestfailed', r => { if (!r.url().includes('api.web3forms.com')) erros.push(`falhou: ${r.url()}`); });
    await p.evaluateOnNewDocument(() => {
      window.__pulos = 0;
      new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__pulos += e.value; })).observe({ type: 'layout-shift', buffered: true });
    });

    // carrega com movimento normal: mede os pulos de layout enquanto o título digita e a planilha se arruma
    await p.goto(BASE, { waitUntil: 'networkidle0' });
    await espera(6000);
    const pulos = await p.evaluate(() => window.__pulos);
    item(pulos < 0.1, `a página não pula ao abrir (pulos: ${pulos.toFixed(3)}, limite 0,1)`);

    // percorre a página inteira (carrega a cena 3D e "E quanto sobrou?")
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    const altura = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < altura; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await espera(80); }
    await espera(1200);
    item(await p.evaluate(() => !!document.querySelector('canvas')), 'a cena 3D montou');
    item(await p.evaluate(() => !!document.querySelector('.sobra-volta')), '"E quanto sobrou?" carregou');
    // estilo de outra página não pode vazar para a landing (já esmagou o caderno x planilha dos sintomas)
    const caderno = await p.evaluate(() => Math.round(document.querySelector('.caderno').getBoundingClientRect().width));
    item(caderno > 100, 'o caderno dos sintomas tem largura normal', `${caderno} px`);
    const largura = await p.evaluate(() => document.documentElement.scrollWidth);
    item(largura <= vista.width, 'nada passa da largura da tela', `${largura} px`);

    // abas: com "pouco movimento" a rolagem é instantânea, então dá para medir onde cada clique parou
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const abas = await p.$$eval('.barra-abas a', as => as.map(a => a.textContent));
    for (const aba of abas) {
      await p.evaluate(t => { const a = [...document.querySelectorAll('.barra-abas a')].find(x => x.textContent === t); a.scrollIntoView({ inline: 'nearest', block: 'nearest' }); a.click(); }, aba);
      await espera(400);
      const r = await p.evaluate(t => {
        const a = [...document.querySelectorAll('.barra-abas a')].find(x => x.textContent === t);
        const bloco = document.getElementById(a.getAttribute('href').slice(1)).closest('.degraus-trilho, .cena, section, header');
        return { topo: Math.round(bloco.getBoundingClientRect().top), barra: document.querySelector('.barra').offsetHeight, ativa: document.querySelector('.barra-abas a.ativa')?.textContent };
      }, aba);
      item(Math.abs(r.topo - r.barra) <= 6 && r.ativa === aba, `aba "${aba}" leva ao começo da seção e fica marcada`, `parou a ${r.topo - r.barra} px, aba marcada: ${r.ativa}`);
    }

    // janela de dúvidas: abre, o foco entra nela e fecha com Esc
    await p.evaluate(() => document.querySelector('.barra-ajuda').click());
    await espera(200);
    item(await p.evaluate(() => document.querySelector('dialog.ajuda').open && document.querySelector('dialog.ajuda').contains(document.activeElement)), 'a janela de dúvidas abre com o foco dentro');
    await p.keyboard.press('Escape'); await espera(200);
    item(await p.evaluate(() => !document.querySelector('dialog.ajuda').open), 'Esc fecha a janela de dúvidas');

    if (nome === 'PC') {
      // atalhos de teclado: funcionam fora dos campos e não atrapalham quem digita
      await p.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
      await p.keyboard.press('3'); await espera(400);
      item(await p.evaluate(() => document.querySelector('.barra-abas a.ativa')?.textContent === 'Serviços'), 'a tecla 3 vai para Serviços');
      await p.focus('#f-nome'); await p.keyboard.type('Tânia 1?');
      item(await p.evaluate(() => document.querySelector('#f-nome').value === 'Tânia 1?' && !document.querySelector('dialog.ajuda').open), 'digitar num campo não dispara atalhos');
      await p.evaluate(() => { document.querySelector('#f-nome').value = ''; });
    }

    // formulário em branco: mostra os 3 avisos e leva o foco ao primeiro campo com problema
    await p.evaluate(() => sessionStorage.clear()); // tira o rascunho deixado pelo teste dos atalhos
    await p.reload({ waitUntil: 'networkidle0' });
    await p.evaluate(() => { document.querySelector('.ficha-form button[type="submit"]').click(); });
    await espera(300);
    const avisos = await p.evaluate(() => [...document.querySelectorAll('.ficha-form [id^="e-"]')].map(e => e.textContent.trim()).filter(Boolean));
    item(avisos.length === 3, 'formulário em branco mostra os 3 avisos', avisos.join(' | '));
    item(await p.evaluate(() => document.activeElement?.id === 'f-nome'), 'o foco vai para o primeiro campo com problema');
    // envio sem chave (a versão de teste não tem): a mensagem de falha aparece como texto corrido, não em colunas
    await p.evaluate(() => { const v = (sel, t) => { const e = document.querySelector(sel); const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, t); e.dispatchEvent(new Event('input', { bubbles: true })); }; v('#f-nome', 'Tânia Teste'); document.querySelector('#f-tipo-1').click(); v('#f-contato', '(12) 99999-0000'); });
    await espera(200);
    await p.evaluate(() => document.querySelector('.ficha-form button[type="submit"]').click()); await espera(400);
    const falha = await p.evaluate(() => { const e = document.querySelector('.status.erro'); return e ? { d: getComputedStyle(e).display, h: Math.round(e.getBoundingClientRect().height) } : null; });
    item(falha && falha.d !== 'grid' && falha.h < 160, 'a mensagem de falha no envio aparece inteira, em texto corrido', JSON.stringify(falha));
    await p.evaluate(() => sessionStorage.clear());

    // dados adulterados no navegador não quebram a página nem rodam código
    await p.evaluate(() => {
      sessionStorage.setItem('p0-rascunho', JSON.stringify({ nome: { x: 1 }, tipo: '<img src=x onerror="window.__xss=1">', contato: 123 }));
      sessionStorage.setItem('p0-enviado', JSON.stringify({ nome: '<img src=x onerror="window.__xss=1">', contato: ['a'] }));
    });
    const errosAntes = erros.length;
    await p.reload({ waitUntil: 'networkidle0' }); await espera(500);
    item(erros.length === errosAntes && await p.evaluate(() => !window.__xss), 'dados adulterados no navegador não quebram a página nem rodam código');
    await p.evaluate(() => sessionStorage.clear());

    item(erros.length === 0, 'nenhum erro na página, nenhum bloqueio das proteções', erros.slice(0, 3).join(' | '));
    await p.close();
  }

  // página de privacidade e prévia do link
  console.log('\nOutras páginas');
  const p = await navegador.newPage();
  const r = await p.goto(`${BASE}/privacidade`, { waitUntil: 'networkidle0' });
  item(r.status() === 200 && await p.evaluate(() => document.querySelector('h1')?.textContent === 'Privacidade'), 'a página /privacidade abre');
  await p.goto(`${BASE}/#formulario`, { waitUntil: 'networkidle0' }); await espera(1500);
  const formTopo = await p.evaluate(() => Math.round(document.getElementById('formulario').getBoundingClientRect().top - document.querySelector('.barra').offsetHeight));
  item(formTopo >= -2 && formTopo <= 40, 'link /#formulario (das outras páginas) para no formulário', `parou a ${formTopo} px`);
  const r404 = await p.goto(`${BASE}/endereco-que-nao-existe`, { waitUntil: 'networkidle0' });
  item(r404.status() === 404 && await p.evaluate(() => document.querySelector('.erro-ref')?.textContent === '#REF!' && !!document.querySelector('.erro-acoes a[href="/"]')), 'endereço que não existe mostra a página de erro com volta ao início');
  await p.goto(BASE, { waitUntil: 'networkidle0' });
  item(await p.evaluate(() => !!document.querySelector('.footer-miudo a[href="/privacidade"]')), 'o rodapé tem o link da privacidade');
  item(await p.evaluate(() => !!document.querySelector('meta[property="og:image"]') && !!document.querySelector('meta[name="description"]')), 'a prévia do link (descrição e imagem) está na página');
  item(fs.existsSync(path.join(pasta, 'og.png')), 'a imagem de prévia vai junto na publicação');
  await p.close();
} finally {
  await navegador.close();
  servidor.close();
}

console.log(falhas ? `\n${falhas} item(ns) falharam.` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
