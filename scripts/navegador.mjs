// Acha o Chrome (ou Edge) instalado no computador, para os scripts de teste e de imagens.
// Para usar outro navegador: CHROME="caminho/do/navegador" npm run conferir
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATOS = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

export function abrirNavegador(args = []) {
  const executablePath = CANDIDATOS.find(c => c && fs.existsSync(c));
  if (!executablePath) throw new Error('Não achei o Chrome. Instale o Chrome ou defina CHROME com o caminho do navegador.');
  return puppeteer.launch({ executablePath, headless: 'new', args });
}
