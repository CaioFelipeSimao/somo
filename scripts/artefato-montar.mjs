// Prévia para o celular (Artefato do Claude): npm run artefato gera .artefato/somo.html, que é publicado no mesmo link.
// Junta a build de um pedaço só num HTML único para o Artefato (sem doctype/html/head/body: o Artefato põe).
import fs from 'node:fs';
import path from 'node:path';
const [dist, foto, saida] = process.argv.slice(2);
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const titulo = html.match(/<title>[\s\S]*?<\/title>/)[0];
const pegar = re => { const m = html.match(re); if (!m) throw new Error('nao achei ' + re); return path.join(dist, m[1]); };
const css = fs.readFileSync(pegar(/href="\/?(assets\/[^"]+\.css)"/), 'utf8');
let js = fs.readFileSync(pegar(/src="\/?(assets\/[^"]+\.js)"/), 'utf8');
const dado = 'data:image/webp;base64,' + fs.readFileSync(foto).toString('base64');
const antes = (js.match(/\/caio\.webp/g) || []).length;
js = js.split('/caio.webp').join(dado).replace(/<\/script/gi, '<\/script');
const pagina = `${titulo}\n<meta name="color-scheme" content="light">\n<style>${css}</style>\n<div id="root"></div>\n<script type="module">${js}</script>\n`;
fs.writeFileSync(saida, pagina);
console.log('foto trocada', antes, 'vezes; tamanho', (pagina.length / 1024 / 1024).toFixed(2), 'MB');
