import { useEffect, useRef, useState } from 'react';
import PixelSwap from './components/PixelSwap';

// Dados fictícios de uma papelaria. O "antes" repete os erros comuns de
// planilha feita à mão; o "depois" responde a pergunta que ela não responde.
const linhas = [
  ['12/10', 'caderno 10 mat', '3', '18,90', ''],
  ['12-out', 'Caderno espiral', '2', 'R$ 37,8', ''],
  ['13/10', 'CANETA AZUL', '12', '2.5', ''],
  ['13/10', 'mochila', '1', '???', 'conferir no caderno'],
  ['14/10', 'caneta bic', '6', '#VALOR!', ''],
  ['14/10', 'presente dia crianças', '4', '', 'anotei no papel'],
  ['15/10', 'xerox', '40', '0,25', ''],
  ['', '', '', '', ''],
  ['', 'TOTAL?', '', '#REF!', '']
];

const lucroPorProduto = [
  { produto: 'Cadernos', valor: 1840 },
  { produto: 'Mochilas', valor: 1215 },
  { produto: 'Canetas', valor: 960 },
  { produto: 'Presentes', valor: 430 },
  { produto: 'Cópias', valor: 290 }
];

const real = valor => `R$ ${valor.toLocaleString('pt-BR')}`;
const erro = v => v.startsWith('#') || v === '???';

function Planilha() {
  return (
    <div className="sheet" aria-hidden="true">
      <div className="sheet-tab">vendas_out_FINAL(2).xlsx</div>
      <table>
        <thead>
          <tr><th />{['A', 'B', 'C', 'D', 'E'].map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="sheet-head"><th>1</th><td>data</td><td>produto</td><td>qtd</td><td>valor</td><td>obs</td></tr>
          {linhas.map((l, i) => (
            <tr key={i}>
              <th>{i + 2}</th>
              {l.map((v, j) => (
                <td key={j} className={erro(v) ? 'sheet-err' : j === 4 && v ? 'sheet-note' : undefined}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Painel() {
  const maior = Math.max(...lucroPorProduto.map(p => p.valor));
  return (
    <div className="panel">
      <p className="panel-title">Qual produto deu mais lucro em outubro?</p>
      <p className="panel-answer">Cadernos, com {real(maior)}.</p>
      <ol className="chart-rows">
        {lucroPorProduto.map(p => (
          <li key={p.produto} className={p.valor === maior ? 'top' : undefined}
              style={{ '--v': Math.round((p.valor / maior) * 100) }}>
            <span>{p.produto}</span>
            <span className="bar" />
            <span className="val">{real(p.valor)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function BeforeAfter() {
  const ref = useRef(null);
  const [depois, setDepois] = useState(false);
  const [mexeu, setMexeu] = useState(false);

  // Quando o quadro aparece na tela, mostra o "antes" um instante e vira o "depois".
  useEffect(() => {
    if (mexeu) return undefined;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = window.setTimeout(() => setDepois(true), 1600);
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, [mexeu]);

  const alternar = () => { setMexeu(true); setDepois(d => !d); };

  return (
    <figure className="demo" ref={ref}>
      <PixelSwap
        firstContent={<Planilha />}
        secondContent={<Painel />}
        active={depois}
        trigger="manual"
        pixelSize={36}
        pattern="left-to-right"
        randomness={0.35}
        pixelScale={0.2}
        duration={1300}
        pixelDuration={420}
        aspectRatio="4 / 3"
        className="demo-swap"
      />
      <div className="demo-foot">
        <figcaption>
          <strong>{depois ? 'Depois: a resposta em uma tela.' : 'Antes: a planilha de hoje.'}</strong>{' '}
          Exemplo de uma papelaria, com dados fictícios.
        </figcaption>
        <button type="button" className="btn-ghost" onClick={alternar} aria-pressed={depois}>
          {depois ? 'Ver o antes' : 'Ver o depois'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {depois
          ? 'Painel: Cadernos deram mais lucro, R$ 1.840. Depois Mochilas, R$ 1.215; Canetas, R$ 960; Presentes, R$ 430; Cópias, R$ 290.'
          : 'Planilha de vendas bagunçada, com produtos escritos de jeitos diferentes, valores faltando e erros de fórmula.'}
      </p>
    </figure>
  );
}
