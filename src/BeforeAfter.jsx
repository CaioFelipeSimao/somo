import { useRef, useState } from 'react';
import PixelSwap from './components/PixelSwap';
import { LINHAS, ehErro } from './dados';

// Os dados (fictícios) são os mesmos da cena 3D: src/dados.js
const [cabecalho, ...linhas] = LINHAS;
const erro = ehErro;

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

// O "depois" do topo: a MESMA planilha, arrumada (a resposta em gráfico fica para a cena 3D logo abaixo).
// Células corrigidas ficam marcadas; os valores fecham: 2 x 18,90 = 37,80 e o total é a soma da coluna.
const ARRUMADA = [
  ['12/10', 'Caderno', '3', '18,90', '56,70'],
  ['12/10', { t: 'Caderno', f: 1 }, '2', { t: '18,90', f: 1 }, '37,80'],
  ['13/10', { t: 'Caneta', f: 1 }, '12', { t: '2,50', f: 1 }, '30,00'],
  ['13/10', 'Mochila', '1', { t: '89,90', f: 1 }, '89,90'],
  ['14/10', { t: 'Caneta', f: 1 }, '6', '2,50', { t: '15,00', f: 1 }],
  ['14/10', 'Presente', '4', '7,00', '28,00'],
  ['15/10', { t: 'Cópia', f: 1 }, '40', '0,25', '10,00'],
  ['', '', '', '', ''],
  ['', { t: 'Total', b: 1 }, '', '', { t: 'R$ 267,40', b: 1 }]
];

function PlanilhaArrumada() {
  return (
    <div className="sheet sheet-ok" aria-hidden="true">
      <div className="sheet-tab">vendas_outubro.xlsx</div>
      <table>
        <thead>
          <tr><th />{['A', 'B', 'C', 'D', 'E'].map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="sheet-head"><th>1</th>{['data', 'produto', 'qtd', 'preço', 'total'].map(c => <td key={c}>{c}</td>)}</tr>
          {ARRUMADA.map((l, i) => (
            <tr key={i}>
              <th>{i + 2}</th>
              {l.map((c, j) => {
                const o = typeof c === 'string' ? { t: c } : c;
                return <td key={j} className={o.f ? 'sheet-fix' : o.b ? 'sheet-total' : undefined}>{o.t}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
        secondContent={<PlanilhaArrumada />}
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
          <strong>{depois ? 'Depois: a mesma planilha, arrumada.' : 'Antes: a planilha de hoje.'}</strong>{' '}
          Exemplo de uma papelaria, com dados fictícios.
        </figcaption>
        <button type="button" className="btn-ghost" onClick={alternar} aria-pressed={depois} disabled={trocando}>
          {depois ? 'Ver o antes' : 'Ver o depois'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {depois
          ? 'Planilha arrumada: nomes iguais juntos, preços corrigidos, cada linha com o total e o total do mês fechando em R$ 267,40.'
          : 'Planilha de vendas bagunçada, com produtos escritos de jeitos diferentes, valores faltando e erros de fórmula.'}
      </p>
    </figure>
  );
}
