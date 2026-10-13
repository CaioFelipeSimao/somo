import { useEffect, useRef, useState } from 'react';
import { LUCRO, real } from '../dados';

// O que a pessoa lê em cada ato da cena, na ordem da rolagem.
const ATOS = [
  { frase: 'Isso é o que você tem hoje.', sub: 'Nomes repetidos de jeitos diferentes, valores faltando e erros de fórmula.' },
  { frase: 'Cada linha guarda uma resposta.', sub: 'Só que tudo misturado, do jeito que foi anotado na correria.' },
  { frase: 'Primeiro eu separo o que é venda do que é ruído.', sub: 'Erros, linhas vazias e anotações soltas saem da conta.' },
  { frase: 'Depois junto o que é igual.', sub: '“caderno 10 mat” e “Caderno espiral” viram um produto só, e as vendas se empilham.' },
  { frase: 'Cadernos deram mais lucro: R$ 1.840.', sub: 'Cada ficha vale cerca de R$ 150. Exemplo com dados fictícios.' }
];

const suportaWebGL = () => {
  try { return Boolean(document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')); }
  catch { return false; }
};

function PainelParado() {
  const maior = Math.max(...LUCRO.map(l => l.valor));
  return (
    <ol className="colunas" aria-label="Lucro por produto em outubro, exemplo fictício">
      {LUCRO.map(l => (
        <li key={l.produto} className={l.valor === maior ? 'top' : undefined} style={{ '--h': l.valor / maior }}>
          <span className="rotulo-valor">{real(l.valor)}</span>
          <span className="coluna" aria-hidden="true" />
          <span className="rotulo-nome">{l.produto}</span>
        </li>
      ))}
    </ol>
  );
}

export default function CenaPlanilha() {
  const secaoRef = useRef(null), vistaRef = useRef(null), canvasRef = useRef(null), rotulosRef = useRef(null);
  const [modo] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || !suportaWebGL() ? 'parado' : '3d');
  const [ato, setAto] = useState(modo === 'parado' ? ATOS.length - 1 : 0);

  // O 3D (Three.js) só baixa quando a seção está a uma tela e meia de aparecer.
  useEffect(() => {
    if (modo !== '3d') return undefined;
    let desmontar = null, vivo = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import('./planilha3d').then(({ montarCena }) => {
        if (!vivo) return;
        desmontar = montarCena({ secao: secaoRef.current, vista: vistaRef.current, canvas: canvasRef.current, rotulos: rotulosRef.current, onAto: setAto });
      });
    }, { rootMargin: '150% 0px' });
    io.observe(secaoRef.current);
    return () => { vivo = false; io.disconnect(); desmontar?.(); };
  }, [modo]);

  const atual = ATOS[ato];
  return (
    <section className={`cena cena-${modo}`} ref={secaoRef} aria-labelledby="t-cena">
      <div className="cena-palco">
        <div className="grid cena-grid">
          <div className="cena-texto">
            <h2 className="sec-title" id="t-cena">Do caderno à resposta</h2>
            <div className="cena-legenda" key={ato}>
              <p className="cena-frase">{atual.frase}</p>
              <p className="cena-sub">{atual.sub}</p>
            </div>
            {modo === '3d' && (
              <ol className="cena-progresso" aria-hidden="true">
                {ATOS.map((_, i) => <li key={i} className={i <= ato ? 'feito' : undefined} />)}
              </ol>
            )}
            <ol className="sr-only">{ATOS.map(a => <li key={a.frase}>{a.frase} {a.sub}</li>)}</ol>
          </div>
          <div className="cena-vista" ref={vistaRef} aria-hidden={modo === '3d'}>
            {modo === '3d' ? (
              <>
                <canvas ref={canvasRef} />
                <div className="cena-rotulos" ref={rotulosRef} />
              </>
            ) : <PainelParado />}
          </div>
        </div>
      </div>
    </section>
  );
}
