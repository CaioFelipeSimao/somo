import { useRef, useState } from 'react';
import PixelSwap from './components/PixelSwap';
import { LINHAS, LUCRO, real, ehErro } from './dados';

// Os dados (fictícios) são os mesmos da cena 3D: src/dados.js
const [cabecalho, ...linhas] = LINHAS;
const erro = ehErro;
const lucroPorProduto = LUCRO;

export function Planilha() {
  return (
    <div className="sheet" aria-hidden="true">
      <div className="sheet-tab">vendas_out_FINAL(2).xlsx</div>
      <table>
        <thead>
          <tr><th />{['A', 'B', 'C', 'D', 'E'].map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="sheet-head"><th>1</th>{cabecalho.map(c => <td key={c}>{c}</td>)}</tr>
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
      <p className="panel-title">Qual produto vendeu mais em outubro?</p>
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
  const [trocando, setTrocando] = useState(false);

  // O topo fica no "antes"; o "depois" só aparece no clique (a revelação completa é a cena 3D logo abaixo).
  const alternar = () => { if (trocando) return; setTrocando(true); setDepois(d => !d); };

  return (
    <figure className="demo" ref={ref}>
      <PixelSwap
        firstContent={<Planilha />}
        secondContent={<Painel />}
        active={depois}
        trigger="manual"
        pixelSize={56}
        counterScale={false}
        pattern="left-to-right"
        randomness={0.35}
        pixelScale={0.2}
        duration={1300}
        pixelDuration={420}
        aspectRatio="16 / 11"
        className="demo-swap"
        onComplete={() => setTrocando(false)}
      />
      <div className="demo-foot">
        <figcaption>
          <strong>{depois ? 'Depois: a resposta em uma tela.' : 'Antes: a planilha de hoje.'}</strong>{' '}
          Exemplo de uma papelaria, com dados fictícios.
        </figcaption>
        <button type="button" className="btn-ghost" onClick={alternar} aria-pressed={depois} disabled={trocando}>
          {depois ? 'Ver o antes' : 'Ver o depois'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {depois
          ? 'Painel: Cadernos venderam mais, R$ 1.840. Depois Mochilas, R$ 1.215; Canetas, R$ 960; Presentes, R$ 430; Cópias, R$ 290.'
          : 'Planilha de vendas bagunçada, com produtos escritos de jeitos diferentes, valores faltando e erros de fórmula.'}
      </p>
    </figure>
  );
}
