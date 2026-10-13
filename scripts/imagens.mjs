// Gera as imagens fixas do site a partir da marca: a prévia que aparece ao mandar o link no WhatsApp e nas
// redes (public/og.png, 1200 x 630) e o ícone que o celular usa ao salvar o site na tela inicial.
// Rodar de novo depois de mudar o título ou a marca: npm run imagens
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { peca, SIMBOLO } from '../src/marcaDesenho.js';
import { abrirNavegador } from './navegador.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fonte = 'data:font/woff2;base64,' + fs.readFileSync(path.join(raiz, 'node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2')).toString('base64');
const AZUL = '#2148c0', APOIO = '#dce3f5', APOIO_FORTE = '#b9c7ee', TINTA = '#15171c', FUNDO = '#f6f6f4';

// o mesmo padrão de peças do fundo do topo (bloco de 4 x 4 casas que se repete)
const C = 48, P = 40, M = (C - P) / 2;
const casa = (i, j, curvo) => peca(i * C + M, j * C + M, P, 7, 22, curvo);
const FORTE = [casa(1, 1, 'br'), casa(2, 1, 'bl'), casa(1, 2, 'tr'), casa(2, 2, 'tl'), casa(3, 3, 'tl'), casa(0, 0, 'br')].join('');
const LEVE = [casa(3, 0, 'bl'), casa(0, 3, 'tr'), casa(3, 1, 'tl'), casa(0, 2, 'br')].join('');

const base = corpo => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: S; src: url(${fonte}) format('woff2'); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; } body { font-family: S, Arial, sans-serif; color: ${TINTA}; }
</style>${corpo}`;

const prevista = base(`
<div style="position:relative;width:1200px;height:630px;background:${FUNDO};overflow:hidden">
  <svg width="1200" height="630" style="position:absolute;inset:0">
    <defs><pattern id="p" width="192" height="192" patternUnits="userSpaceOnUse"><path d="${LEVE}" fill="${APOIO}"/><path d="${FORTE}" fill="${APOIO_FORTE}"/></pattern>
    <linearGradient id="g" x1="0" x2="1"><stop offset=".45" stop-color="#000"/><stop offset=".75" stop-color="#fff"/></linearGradient>
    <mask id="m"><rect width="1200" height="630" fill="url(#g)"/></mask></defs>
    <rect width="1200" height="630" fill="url(#p)" mask="url(#m)"/>
  </svg>
  <div style="position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:16px">
    <svg width="56" height="56" viewBox="0 0 94 94"><path d="${SIMBOLO}" fill="${AZUL}"/></svg>
    <span style="font-size:48px;font-weight:800;letter-spacing:-.035em">Somô</span>
  </div>
  <h1 style="position:absolute;left:72px;top:190px;width:760px;font-size:76px;line-height:1.02;font-weight:700;letter-spacing:-.035em">
    <span style="background:#fff;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone">Seu mês de vendas arrumado, de presente.</span></h1>
  <p style="position:absolute;left:72px;bottom:64px;font-size:30px;color:#4a505c">Planilha bagunçada ou caderno: fotos das páginas bastam.</p>
  <div style="position:absolute;right:0;bottom:0;width:20px;height:630px;background:${AZUL}"></div>
</div>`);

// ícone: o símbolo azul sobre branco, com folga (o celular arredonda os cantos sozinho)
const icone = lado => base(`<div style="width:${lado}px;height:${lado}px;background:#fff;display:grid;place-items:center">
  <svg width="${Math.round(lado * .62)}" height="${Math.round(lado * .62)}" viewBox="0 0 94 94"><path d="${SIMBOLO}" fill="${AZUL}"/></svg></div>`);

const b = await abrirNavegador();
for (const [arquivo, html, w, h] of [['og.png', prevista, 1200, 630], ['apple-touch-icon.png', icone(180), 180, 180], ['icone-512.png', icone(512), 512, 512]]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(raiz, 'public', arquivo), clip: { x: 0, y: 0, width: w, height: h } });
  console.log('gerado public/' + arquivo);
  await p.close();
}
await b.close();
