// Adaptado do Split Flap Text do React Bits (https://reactbits.dev/text-animations/split-flap-text):
// - mostra UM valor (text) e gira até ele quando aparece na tela e sempre que o valor muda;
// - espera o valor parar de mudar (espera, em ms) antes de girar: arrastando a calculadora, o painel não fica louco;
// - alinhado à direita em "largura" placas, como um placar; letras do giro só de números (o "R$" fica fora do painel);
// - tamanho que acompanha a tela, visual suíço (placa preta e reta) no SplitFlap.css;
// - leitor de tela lê o valor final num texto escondido; com pouco movimento, troca sem girar.
import { useEffect, useRef, useState } from 'react';
import './SplitFlap.css';

const GIRO = '0123456789.,';
const sorteia = () => GIRO.charAt(Math.floor(Math.random() * GIRO.length));
const alinha = (t, n) => String(t).padStart(n, ' ').slice(-n);
const placas = t => t.split('').map(c => ({ atual: c, proxima: c, girando: false, vez: 0 }));

export default function SplitFlap({ text, largura = 8, espera = 250, giros = 6, duracao = 0.09, defasagem = 0.05, className = '' }) {
  const alvo = alinha(text, largura);
  const [tiles, setTiles] = useState(() => placas(' '.repeat(largura)));
  const mostrado = useRef(' '.repeat(largura));
  const raiz = useRef(null);
  const [visivel, setVisivel] = useState(false);

  // só começa a girar quando o painel entra na tela
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisivel(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(raiz.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visivel || alvo === mostrado.current) return undefined;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let quadro = 0, cancelado = false;
    const timer = window.setTimeout(() => {
      if (calmo) { mostrado.current = alvo; setTiles(placas(alvo)); return; }
      const de = mostrado.current;
      const passoMs = duracao * 1000, defMs = defasagem * 1000;
      // cada placa que muda tem sua sequência: algumas letras sorteadas e, por fim, a certa
      const planos = alvo.split('').map((c, i) => (c === de[i] ? null : {
        i, de: de[i], alvo: c, seq: [...Array.from({ length: giros }, sorteia), c], inicio: i * defMs, passo: -1, fim: false
      })).filter(Boolean);
      const t0 = performance.now();
      const anda = agora => {
        if (cancelado) return;
        const mudancas = [];
        let segue = false;
        planos.forEach(p => {
          const dt = agora - t0 - p.inicio;
          if (dt < 0) { segue = true; return; }
          const passo = Math.floor(dt / passoMs);
          if (passo < p.seq.length) {
            segue = true;
            if (passo !== p.passo) { p.passo = passo; mudancas.push({ i: p.i, atual: passo === 0 ? p.de : p.seq[passo - 1], proxima: p.seq[passo], girando: true }); }
          } else if (!p.fim) { p.fim = true; mudancas.push({ i: p.i, atual: p.alvo, proxima: p.alvo, girando: false }); }
        });
        if (mudancas.length) setTiles(ts => { const n = [...ts]; mudancas.forEach(m => { n[m.i] = { ...m, vez: ts[m.i].vez + 1 }; }); return n; });
        if (segue) quadro = requestAnimationFrame(anda); else mostrado.current = alvo;
      };
      quadro = requestAnimationFrame(anda);
    }, mostrado.current.trim() ? espera : 0);
    return () => { cancelado = true; clearTimeout(timer); cancelAnimationFrame(quadro); };
  }, [alvo, visivel, espera, giros, duracao, defasagem]);

  const letra = c => (c === ' ' ? ' ' : c);
  return (
    <span ref={raiz} className={`placar ${className}`.trim()} style={{ '--placar-giro': `${duracao}s` }}>
      <span className="sr-only">{String(text)}</span>
      {tiles.map((t, i) => (
        <span className="placar-placa" aria-hidden="true" key={i}>
          <span className="placar-meia placar-cima"><span className="placar-letra">{letra(t.atual)}</span></span>
          <span className="placar-meia placar-baixo"><span className="placar-letra">{letra(t.girando ? t.proxima : t.atual)}</span></span>
          {t.girando && (
            <>
              <span className="placar-aba placar-frente" key={`f${t.vez}`}><span className="placar-letra">{letra(t.atual)}</span></span>
              <span className="placar-aba placar-verso" key={`v${t.vez}`}><span className="placar-letra">{letra(t.proxima)}</span></span>
            </>
          )}
        </span>
      ))}
    </span>
  );
}
