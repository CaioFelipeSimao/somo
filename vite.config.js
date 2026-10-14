import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Na Vercel o endereço do site vem sozinho (ela informa o domínio de produção na publicação);
// o VITE_SITE_URL do .env só é preciso para publicar em outro lugar ou num domínio próprio antes de ligá-lo lá.
if (!process.env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL)
  process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

// Sem a chave do Web3Forms o formulário não envia nada: a publicação para aqui em vez de ir ao ar com um formulário morto.
// Para testar a versão de publicação mesmo assim: P0_SEM_CHAVE=1 npm run build
const exigirChave = () => ({
  name: 'exigir-chave-do-formulario',
  apply: 'build',
  buildStart() {
    const config = readFileSync(new URL('./src/config.js', import.meta.url), 'utf8');
    if (config.includes('COLE_AQUI_A_CHAVE') && !process.env.P0_SEM_CHAVE)
      this.error('Falta a chave do Web3Forms em src/config.js. Crie a chave em web3forms.com com o e-mail do projeto e cole no lugar de COLE_AQUI_A_CHAVE.');
    if ((config.includes('COLE_AQUI_O_EMAIL') || config.includes('COLE_AQUI_OS_DIAS')) && !process.env.P0_SEM_CHAVE)
      this.error('Faltam o e-mail de privacidade e o prazo do pedido em src/config.js (EMAIL_PRIVACIDADE e DIAS_PEDIDO). Eles aparecem na página de privacidade.');
    // a prévia do link (WhatsApp, redes) precisa do endereço completo do site
    const env = loadEnv('production', fileURLToPath(new URL('.', import.meta.url)), 'VITE_');
    const site = env.VITE_SITE_URL ?? '';
    if ((!/^https:\/\/[^/]+$/.test(site) || site.includes('COLE_AQUI')) && !process.env.P0_SEM_CHAVE)
      this.error('Falta o endereço do site em .env (VITE_SITE_URL=https://seu-dominio, sem barra no fim). Ele vai na prévia do link do WhatsApp.');
  }
});

// no computador, /privacidade abre a página como na Vercel (lá o vercel.json faz isso)
const enderecosLimpos = () => ({
  name: 'enderecos-limpos',
  configureServer(servidor) {
    servidor.middlewares.use((pedido, _r, seguir) => { if (/^\/privacidade\/?(\?|$)/.test(pedido.url)) pedido.url = '/privacidade.html'; seguir(); });
  }
});

// a letra principal é avisada no <head> de cada página (preload): o navegador baixa junto com o resto,
// sem esperar o CSS chegar para descobrir que precisa dela
const preCarregarFonte = () => ({
  name: 'pre-carregar-fonte',
  apply: 'build',
  transformIndexHtml(html, ctx) {
    const fonte = Object.keys(ctx.bundle ?? {}).find(n => n.includes('schibsted-grotesk-latin-wght-normal') && n.endsWith('.woff2'));
    if (!fonte) return html;
    return html.replace('</head>', `  <link rel="preload" href="/${fonte}" as="font" type="font/woff2" crossorigin>\n</head>`);
  }
});

// contador de visitas da Vercel (sem cookies): só entra no build feito na Vercel, onde o endereço existe;
// no PC, nos testes e na prévia do celular ele não aparece
const contadorVisitas = () => ({
  name: 'contador-visitas',
  apply: 'build',
  transformIndexHtml: html => process.env.VERCEL
    ? html.replace('</body>', '  <script defer src="/_vercel/insights/script.js"></script>\n</body>')
    : html
});

// duas páginas: a landing e a de privacidade
export default defineConfig({
  plugins: [react(), exigirChave(), enderecosLimpos(), preCarregarFonte(), contadorVisitas()],
  build: { rollupOptions: { input: { main: 'index.html', privacidade: 'privacidade.html', erro: '404.html' } } }
});
