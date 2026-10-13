/* Cena 3D: a planilha de vendas se desmonta em fichas e se remonta no painel, conforme a rolagem.
   Segue as regras da skill cena-explodida-scroll: toda ficha é um sólido (frente de papel, verso pintado, laterais com espessura),
   cada ficha tem estados (m = montada na planilha, s = solta, e = explodida, c = encaixada no painel), e o GSAP move
   proxies que são copiados para os objetos 3D. Diferente dos outros props, o fim NÃO volta ao m: ele é a segunda montagem (c),
   com o mesmo rigor de encaixe (fichas face a face, sem fresta). */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LINHAS, LUCRO, real, ehErro } from '../dados';

gsap.registerPlugin(ScrollTrigger);

const LARG = [44, 120, 120, 120, 120, 120], ALT = 36, PROF = 8;   // coluna dos números de linha + A a E, em unidades (1 unidade = 1 px no plano z = 0)
const COR = { papel: '#fbfbf8', cab: '#eceef1', grade: '#d9dbe0', lado: '#cfd2d8', texto: '#15171c', apagado: '#4a505c', marca: '#ffe86b', erro: '#b42318', azul: '#2148c0', cinza: '#858a95' };
const FONTE = '"Schibsted Grotesk Variable", "Helvetica Neue", Arial, sans-serif';
const PASSO = 136, BASE = -LUCRO[0].fichas * ALT / 2;   // distância entre as barras; pé das barras
export const TEMPOS = [0, .6, 1.3, 3, 4.35];   // início de cada ato na linha do tempo (para as frases)

/* números pseudoaleatórios fixos: a explosão é a mesma em toda visita */
let semente = 7;
const rnd = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
const entre = (a, b) => a + (b - a) * rnd();

function cabe(ctx, texto, max) {
  if (ctx.measureText(texto).width <= max) return texto;
  let t = texto;
  while (t.length > 1 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
}

function textura(texto, larg, tipo, aniso) {
  const k = 4, cv = document.createElement('canvas');
  cv.width = larg * k; cv.height = ALT * k;
  const x = cv.getContext('2d'); x.scale(k, k);
  x.fillStyle = tipo === 'cab' ? COR.cab : tipo === 'marca' ? COR.marca : COR.papel;
  x.fillRect(0, 0, larg, ALT);
  x.strokeStyle = COR.grade; x.lineWidth = 1; x.strokeRect(.5, .5, larg - 1, ALT - 1);
  if (texto) {
    const forte = tipo === 'erro' || tipo === 'titulo';
    // letra um pouco maior e mais cheia: inclinada, a de 13 px fina sumia
    x.font = `${forte ? 650 : 500} 14px ${FONTE}`;
    x.fillStyle = tipo === 'erro' ? COR.erro : tipo === 'cab' ? COR.apagado : COR.texto;
    x.textBaseline = 'middle';
    const centro = tipo === 'cab';
    x.textAlign = centro ? 'center' : 'left';
    x.fillText(cabe(x, texto, larg - 12), centro ? larg / 2 : 6, ALT / 2 + .5);
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = aniso;
  return tx;
}

export function montarCena({ secao, vista, canvas, rotulos, onAto }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  // filtro para imagem vista de lado no máximo que a placa de vídeo aceitar (até 16): texto inclinado fica nítido
  const aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 100, 6000); camera.position.set(0, 0, 1800);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0aa, 1.6));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4); sol.position.set(-500, 700, 900); scene.add(sol);

  const ajuste = new THREE.Group(), conjunto = new THREE.Group();   // ajuste = cabe na tela (refeito no resize); conjunto = câmera da história
  scene.add(ajuste); ajuste.add(conjunto);
  // celular em pé: explosão alta e zoom menor, para a planilha e o painel caberem na largura
  // ponytail: o formato é escolhido ao montar; girar o celular no meio da cena não refaz a grade (recarregar refaz)
  const retrato = vista.clientWidth < vista.clientHeight;
  const Z = retrato ? { ini: .95, solta: .9, exp: 1, fim: .9 } : { ini: 1.25, solta: 1.15, exp: 1, fim: 1.45 };
  // no celular o painel final ocupa a largura toda: o zoom do fim sai do tamanho real da vista
  // (painel com rótulos tem ~700 x 520 unidades), limitado pela altura
  if (retrato) {
    const w = vista.clientWidth, h = vista.clientHeight, ajusteIni = Math.min(w / 640, h / 1060);
    if (w && h) {
      Z.fim = Math.min(w * .94 / 700, h * .82 / 520) / ajusteIni;
      // planilha inclinada tem ~680 x 440 unidades na tela
      Z.ini = Math.min(w * .96 / 680, h * .8 / 440) / ajusteIni;
      Z.solta = Z.ini * .94;
    }
  }
  const C = { rx: -24, ry: 14, rz: -3, zoom: Z.ini };   // proxy da câmera do conjunto (graus)

  const geos = [], mats = [], texs = [];
  const matLado = new THREE.MeshLambertMaterial({ color: COR.lado }); mats.push(matLado);
  const matVersoPapel = new THREE.MeshBasicMaterial({ color: COR.papel }); mats.push(matVersoPapel);
  const geoDe = {};
  const caixa = larg => geoDe[larg] || (geos.push(geoDe[larg] = new THREE.BoxGeometry(larg, ALT, PROF)), geoDe[larg]);

  /* ===== fichas: 11 linhas x 6 colunas ===== */
  const totalL = LARG.reduce((a, b) => a + b, 0), fichas = [];
  for (let r = 0; r <= 10; r++) {
    let x0 = -totalL / 2;
    for (let c = 0; c < LARG.length; c++) {
      const larg = LARG[c], v = r === 0 ? (c ? 'ABCDE'[c - 1] : '') : c === 0 ? String(r) : LINHAS[r - 1][c - 1];
      const tipo = r === 0 || c === 0 ? 'cab' : r === 1 ? 'titulo' : ehErro(v) ? 'erro' : c === 5 && v ? 'marca' : 'texto';
      const ruido = r === 0 || c === 0 || !v || tipo === 'erro' || tipo === 'marca' || r >= 9;
      const tex = textura(v, larg, tipo, aniso); texs.push(tex);
      const frente = new THREE.MeshBasicMaterial({ map: tex });
      const lado = ruido ? matLado.clone() : matLado, verso = ruido ? matVersoPapel.clone() : new THREE.MeshBasicMaterial({ color: COR.cinza });
      [frente, lado, verso].forEach(m => mats.push(m));
      const mesh = new THREE.Mesh(caixa(larg), [lado, lado, lado, lado, frente, verso]);
      conjunto.add(mesh);
      const m = { x: x0 + larg / 2, y: (5 - r) * ALT, z: 0, rx: 0, ry: 0, rz: 0, a: 1 };
      fichas.push({ mesh, r, c, ruido, tipo, verso, m, p: { ...m } });
      x0 += larg;
    }
  }

  /* ===== as 31 fichas úteis viram as barras; ordenadas pela posição na planilha para cruzarem pouco ===== */
  const uteis = fichas.filter(f => !f.ruido).sort((a, b) => a.m.x - b.m.x || b.m.y - a.m.y);
  const precisa = LUCRO.reduce((s, l) => s + l.fichas, 0);
  if (uteis.length !== precisa) console.warn(`cena: ${uteis.length} fichas úteis para ${precisa} lugares nas barras`);
  let i = 0;
  LUCRO.forEach((barra, k) => {
    for (let n = 0; n < barra.fichas && i < uteis.length; n++, i++) {
      const f = uteis[i];
      f.barra = k; f.nivel = n;
      f.painel = { x: (k - (LUCRO.length - 1) / 2) * PASSO, y: BASE + n * ALT + ALT / 2, z: 0, rx: 0, ry: 180, rz: 0, a: 1 };   // de costas: o verso pintado vira a barra
      if (k === 0) f.verso.color.set(COR.azul);
    }
  });

  /* ===== poses intermediárias ===== */
  // solta: as fichas se descolam em onda, os erros primeiro e mais alto
  fichas.forEach(f => {
    const onda = Math.sin(f.r * .8 + f.c * 1.3) * .5 + .5;
    f.s = { ...f.m, z: 14 + 34 * onda + (f.tipo === 'erro' ? 60 : 0), rx: entre(-6, 6), ry: entre(-8, 8), rz: f.tipo === 'erro' ? entre(-14, 14) : entre(-3, 3) };
  });
  // explodida: as úteis numa grade 8 x 4 com profundidades alternadas (nenhuma esconde a outra); o ruído sai para fora e cai
  const [COLS, LINS, LX, LY] = retrato ? [3, 11, 420, 1000] : [7, 5, 1040, 580];
  const vagas = [];
  for (let l = 0; l < LINS; l++) for (let c = 0; c < COLS; c++)
    {
      // profundidade alternada, com a perspectiva compensada: a ficha mais perto da câmera parece maior e fugiria do centro
      const z = ((c + l) % 3 - 1) * 70, k = 1 - z / 1800;
      vagas.push({ x: ((c - (COLS - 1) / 2) * LX / COLS + (l % 2 ? 24 : -24)) * k, y: ((LINS - 1) / 2 - l) * LY / LINS * k, z });
    }
  const livres = [...vagas];
  uteis.forEach(f => {
    let melhor = 0, dist = Infinity;
    livres.forEach((v, j) => { const d = (v.x - f.m.x * LX / 640) ** 2 + (v.y - f.m.y * LY / 380) ** 2; if (d < dist) { dist = d; melhor = j; } });
    const v = livres.splice(melhor, 1)[0];
    // giros moderados: a ficha mostra a face (de perfil ela vira um fiapo); umas poucas já mostram o verso pintado
    f.e = { ...v, rx: entre(-24, 24), ry: entre(-32, 32) + (rnd() < .25 ? 180 : 0), rz: entre(-15, 15), a: 1 };
  });
  // o ruído não se espalha: cai direto da planilha e some, então a vista explodida fica só com as fichas úteis (sem oclusão)
  fichas.filter(f => f.ruido).forEach(f => {
    f.d = { x: f.m.x * 1.25, y: f.m.y - 1000, z: entre(60, 220), rx: entre(-160, 160), ry: entre(-120, 120), rz: entre(-90, 90), a: 0 };
  });

  /* ===== linha do tempo ===== */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' }, onUpdate: () => { sujo = true; atualizarAto(); } });
  tl.to({}, { duration: .35 }, 0);
  fichas.forEach((f, j) => tl.to(f.p, { ...f.s, duration: .7, ease: 'power2.out' }, .35 + (f.r + f.c) * .03));
  tl.to(C, { rx: -26, ry: 6, rz: -2, zoom: Z.solta, duration: 1 }, .35);
  // explode: as úteis vão para a grade no ar; o ruído cai e some ao mesmo tempo
  uteis.forEach(f => tl.to(f.p, { ...f.e, duration: .8 }, 1.45 + rnd() * .3));
  fichas.filter(f => f.ruido).forEach(f => tl.to(f.p, { ...f.d, duration: .9, ease: 'power2.in' }, 1.3 + (f.tipo === 'erro' ? 0 : .15) + rnd() * .3));
  tl.to(C, { rx: -10, ry: -14, rz: 2, zoom: Z.exp, duration: 1.1 }, 1.3);
  // reagrupa: cada barra de baixo para cima, viradas de costas, até o encaixe exato
  uteis.forEach(f => tl.to(f.p, { ...f.painel, duration: .85, ease: 'power3.inOut' }, 3.05 + f.barra * .1 + f.nivel * .04));
  tl.to(C, { rx: 0, ry: 0, rz: 0, zoom: Z.fim, duration: 1.3 }, 3.05);
  const R = { a: 0 };   // os rótulos do painel
  tl.to(R, { a: 1, duration: .45, ease: 'power1.out' }, 4.35);
  tl.to({}, { duration: .9 }, 4.8);

  /* ===== rótulos do painel (HTML por cima, ancorados nas barras) ===== */
  rotulos.replaceChildren();
  const etiquetas = LUCRO.map((l, k) => {
    const valor = document.createElement('span'), nome = document.createElement('span');
    valor.className = 'rotulo-valor' + (k === 0 ? ' top' : ''); valor.textContent = real(l.valor);
    nome.className = 'rotulo-nome'; nome.textContent = l.produto;
    rotulos.append(valor, nome);
    return { valor, nome, topo: new THREE.Vector3((k - (LUCRO.length - 1) / 2) * PASSO, BASE + l.fichas * ALT + 16, 0), pe: new THREE.Vector3((k - (LUCRO.length - 1) / 2) * PASSO, BASE - 18, 0) };
  });
  const v3 = new THREE.Vector3();
  const naTela = (p, el) => {
    v3.copy(p); conjunto.localToWorld(v3); v3.project(camera);
    el.style.transform = `translate(-50%, -50%) translate(${(v3.x * .5 + .5) * largura}px, ${(-v3.y * .5 + .5) * altura}px)`;
  };

  /* ===== desenho sob demanda ===== */
  let sujo = true, largura = 1, altura = 1, atoAtual = -1;
  const rad = THREE.MathUtils.degToRad;
  function aplicar() {
    for (const f of fichas) {
      const p = f.p, o = f.mesh;
      o.position.set(p.x, p.y, p.z); o.rotation.set(rad(p.rx), rad(p.ry), rad(p.rz));
      if (f.ruido) {
        o.visible = p.a > .01;
        if (o.visible) for (const m of o.material) { m.transparent = p.a < 1; m.opacity = p.a; }
      }
    }
    conjunto.rotation.set(rad(C.rx), rad(C.ry), rad(C.rz)); conjunto.scale.setScalar(C.zoom);
    rotulos.style.opacity = R.a; rotulos.style.visibility = R.a > .01 ? 'visible' : 'hidden';
    if (R.a > .01) { conjunto.updateMatrixWorld(true); etiquetas.forEach(e => { naTela(e.topo, e.valor); naTela(e.pe, e.nome); }); }
  }
  function atualizarAto() {
    const t = tl.time();
    let n = 0; TEMPOS.forEach((ini, k) => { if (t >= ini) n = k; });
    if (n !== atoAtual) { atoAtual = n; onAto?.(n); }
  }
  const desenhar = () => { if (!sujo) return; sujo = false; aplicar(); renderer.render(scene, camera); };
  gsap.ticker.add(desenhar);

  function tamanho() {
    largura = vista.clientWidth; altura = vista.clientHeight; if (!largura || !altura) return;
    // desenha 25% acima da resolução da tela (até 2x): bordas e letras mais limpas; no celular o teto continua 2x
    renderer.setPixelRatio(Math.min(devicePixelRatio * 1.25, 2)); renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura; camera.fov = 2 * Math.atan(altura / 2 / 1800) * 180 / Math.PI; camera.updateProjectionMatrix();
    ajuste.scale.setScalar(Math.max(.2, retrato ? Math.min(largura / 640, altura / 1060) : Math.min(largura / 1100, altura / 700, 1.2)));
    sujo = true;
  }
  let rt = 0;
  // ScrollTrigger.refresh() reposiciona a página: chamar a cada mudança de altura do palco (no celular a legenda muda
  // de altura a cada ato) interrompia a rolagem no meio. Os gatilhos dependem da seção, não do palco: só recalcula
  // quando a largura muda (girar o celular, redimensionar a janela).
  let larguraAntes = vista.clientWidth;
  const obs = new ResizeObserver(() => {
    tamanho();
    if (vista.clientWidth === larguraAntes) return;
    larguraAntes = vista.clientWidth; clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 150);
  });
  obs.observe(vista); tamanho();

  const gatilho = ScrollTrigger.create({ trigger: secao, start: 'top top', end: 'bottom bottom', scrub: .6, animation: tl });
  atualizarAto();

  /* sondas para a verificação: ir a um instante e medir oclusão entre fichas visíveis */
  const sonda = {
    duracao: tl.duration(),
    ir(t) { tl.time(t); sujo = true; desenhar(); },
    oclusao() {
      conjunto.updateMatrixWorld(true);
      const caixas = fichas.filter(f => f.mesh.visible && f.p.a > .5).map(f => {
        const g = f.mesh.geometry; g.computeBoundingBox(); const b = g.boundingBox, pts = [];
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(f.mesh.matrixWorld).project(camera));
        const xs = pts.map(p => (p.x * .5 + .5) * largura), ys = pts.map(p => (-p.y * .5 + .5) * altura);
        return { f, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
      });
      const ruins = [];
      for (let a = 0; a < caixas.length; a++) for (let b = a + 1; b < caixas.length; b++) {
        const A = caixas[a], B = caixas[b], w = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), h = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
        if (w <= 0 || h <= 0) continue;
        const menor = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0));
        if (w * h / menor > .15) ruins.push([A.f.r + ':' + A.f.c, B.f.r + ':' + B.f.c, +(w * h / menor).toFixed(2)]);
      }
      const fora = caixas.filter(c => c.x0 < 0 || c.y0 < 0 || c.x1 > largura || c.y1 > altura).map(c => c.f.r + ':' + c.f.c);
      return { pares: ruins, fora };
    }
  };
  window.__cenaPlanilha = sonda;

  return () => {
    gatilho.kill(); tl.kill(); gsap.ticker.remove(desenhar); obs.disconnect(); clearTimeout(rt);
    geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); texs.forEach(t => t.dispose());
    renderer.dispose(); rotulos.replaceChildren();
    if (window.__cenaPlanilha === sonda) delete window.__cenaPlanilha;
  };
}
