import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
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
  }
});

export default defineConfig({ plugins: [react(), exigirChave()] });
