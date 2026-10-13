import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Versão para Artefato: um arquivo só (sem divisão em pedaços, fontes e imagens embutidas).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: process.env.SAIDA, emptyOutDir: true,
    assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false,
    rolldownOptions: { output: { inlineDynamicImports: true } }
  }
});
