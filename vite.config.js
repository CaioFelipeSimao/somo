import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Sem a chave do Web3Forms o formulário não envia nada: a publicação para aqui em vez de ir ao ar com um formulário morto.
// Para testar a versão de publicação mesmo assim: P0_SEM_CHAVE=1 npm run build
const exigirChave = () => ({
  name: 'exigir-chave-do-formulario',
  apply: 'build',
  buildStart() {
    const config = readFileSync(new URL('./src/config.js', import.meta.url), 'utf8');
    if (config.includes('COLE_AQUI') && !process.env.P0_SEM_CHAVE)
      this.error('Falta a chave do Web3Forms em src/config.js. Crie a chave em web3forms.com com o e-mail do projeto e cole no lugar de COLE_AQUI_A_CHAVE.');
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

// duas páginas: a landing e a de privacidade
export default defineConfig({
  plugins: [react(), exigirChave(), enderecosLimpos()],
  build: { rollupOptions: { input: { main: 'index.html', privacidade: 'privacidade.html', erro: '404.html' } } }
});
