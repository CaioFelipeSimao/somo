import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MagicWand01Icon, ArrowTurnBackwardIcon } from '@hugeicons/core-free-icons';
import PixelSwap from './components/PixelSwap';
import { LINHAS, ehErro } from './dados';

// Os dados (fictícios) são os mesmos da cena 3D: src/dados.js
const [cabecalho, ...linhas] = LINHAS;
const COLUNAS = ['A', 'B', 'C', 'D', 'E'];

// Cada problema do "antes" tem um número; o mesmo número no "depois" mostra como foi consertado.
// A chave é "linha,coluna" contando a partir da primeira linha de dados.
const MARCAS_ANTES = { '1,1': 1, '2,3': 2, '3,3': 3, '4,3': 4, '8,3': 5 };
const MARCAS_DEPOIS = { '1,1': 1, '2,3': 2, '3,3': 3, '4,4': 4, '8,4': 5 };
const PROBLEMAS = {
  1: 'O mesmo produto escrito de jeitos diferentes (caderno, CANETA, xerox): as vendas ficam espalhadas.',
  2: 'Ponto no lugar da vírgula: para a planilha, isso é texto, não dinheiro.',
  3: 'Venda sem valor: ela some do total do mês.',
  4: 'Fórmula quebrada: o erro passa para o total.',
  5: 'Total quebrado: no fim do mês, ninguém sabe quanto vendeu.'
};
const CONSERTOS = {
  1: 'Nomes iguais juntos: Caderno, Caneta e Cópia escritos sempre do mesmo jeito, e as vendas somam.',
  2: 'Preço com vírgula: a planilha passa a entender como dinheiro.',
  3: 'O valor da mochila foi conferido no caderno: R$ 89,90.',
  4: 'A conta foi refeita: 6 canetas a R$ 2,50 dão R$ 15,00.',
  5: 'O total soma a coluna e fecha: R$ 267,40.'
};

// Marcador logo depois do texto da célula: passar o mouse, tocar ou chegar pelo teclado mostra a explicação
// embaixo da planilha; o marcador escolhido fica marcado.
function Marca({ n, onMarca, foco, textos }) {
  if (!n || !onMarca) return null;
  return (
    <button type="button" className={`marca${foco === n ? ' ativa' : ''}`} style={{ '--i': n }}
            aria-label={`${n}: ${textos[n]}`} aria-pressed={foco === n}
            onPointerEnter={() => onMarca(n)} onFocus={() => onMarca(n)} onClick={() => onMarca(n)}>{n}</button>
  );
}

export function Planilha({ onMarca, foco }) {
  return (
    <div className="sheet" aria-hidden={onMarca ? undefined : 'true'}>
      <div className="sheet-tab">vendas_out_FINAL(2).xlsx</div>
      <table>
        <thead>
          <tr><th />{COLUNAS.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="sheet-head"><th>1</th>{cabecalho.map(c => <td key={c}>{c}</td>)}</tr>
          {linhas.map((l, i) => (
            <tr key={i}>
              <th>{i + 2}</th>
              {l.map((v, j) => (
                <td key={j} className={ehErro(v) ? 'sheet-err' : j === 4 && v ? 'sheet-note' : undefined}
                    onClick={onMarca && MARCAS_ANTES[`${i},${j}`] ? () => onMarca(MARCAS_ANTES[`${i},${j}`]) : undefined}>
                  {MARCAS_ANTES[`${i},${j}`] ? <span className="celula-txt">{v}</span> : v}<Marca n={MARCAS_ANTES[`${i},${j}`]} onMarca={onMarca} foco={foco} textos={PROBLEMAS} />
                </td>
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
  ['12/10', { t: 'Caderno', f: 1 }, '2', '18,90', '37,80'],
  ['13/10', { t: 'Caneta', f: 1 }, '12', { t: '2,50', f: 1 }, '30,00'],
  ['13/10', 'Mochila', '1', { t: '89,90', f: 1 }, '89,90'],
  ['14/10', { t: 'Caneta', f: 1 }, '6', '2,50', { t: '15,00', f: 1 }],
  ['14/10', 'Presente', '4', '7,00', '28,00'],
  ['15/10', { t: 'Cópia', f: 1 }, '40', '0,25', '10,00'],
  ['', '', '', '', ''],
  ['', { t: 'Total', b: 1 }, '', '', { t: <><span className="moeda">R$ </span>267,40</>, b: 1 }]
];

function PlanilhaArrumada({ onMarca, foco }) {
  return (
    <div className="sheet sheet-ok">
      <div className="sheet-tab">vendas_outubro.xlsx</div>
      <table>
        <thead>
          <tr><th />{COLUNAS.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="sheet-head"><th>1</th>{['data', 'produto', 'qtd', 'preço', 'total'].map(c => <td key={c}>{c}</td>)}</tr>
          {ARRUMADA.map((l, i) => (
            <tr key={i}>
              <th>{i + 2}</th>
              {l.map((c, j) => {
                const o = typeof c === 'string' ? { t: c } : c;
                return (
                  <td key={j} className={o.f ? 'sheet-fix' : o.b ? 'sheet-total' : undefined}
                      onClick={onMarca && MARCAS_DEPOIS[`${i},${j}`] ? () => onMarca(MARCAS_DEPOIS[`${i},${j}`]) : undefined}>
                    {MARCAS_DEPOIS[`${i},${j}`] ? <span className="celula-txt">{o.t}</span> : o.t}<Marca n={MARCAS_DEPOIS[`${i},${j}`]} onMarca={onMarca} foco={foco} textos={CONSERTOS} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BeforeAfter() {
  const [depois, setDepois] = useState(false);
  const [trocando, setTrocando] = useState(false);
  const [foco, setFoco] = useState(null);
  const [mexeu, setMexeu] = useState(false);
  const marcar = n => { setFoco(n); setMexeu(true); };

  // O topo começa no "antes"; o "depois" só aparece no clique (a revelação completa é a cena 3D logo abaixo).
  const alternar = () => { if (trocando) return; setTrocando(true); setFoco(null); setDepois(d => !d); };

  // A primeira troca acontece sozinha: 2,2 s depois de a planilha aparecer (tempo de ver a bagunça e os números),
  // uma vez só, e não acontece se a pessoa já mexeu ou pediu menos movimento.
  const figura = useRef(null), mexeuRef = useRef(false);
  mexeuRef.current = mexeu;
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let espera = 0;
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(espera);
      if (!e.isIntersecting) return;
      espera = window.setTimeout(() => {
        io.disconnect();
        if (mexeuRef.current) return;
        setTrocando(true); setFoco(null); setDepois(true);
      }, 2200);
    }, { threshold: 0.6 });
    io.observe(figura.current);
    return () => { io.disconnect(); clearTimeout(espera); };
  }, []);
  const textos = depois ? CONSERTOS : PROBLEMAS;

  return (
    <figure ref={figura} className={`demo${depois ? ' demo-depois' : ''}${mexeu ? ' demo-mexeu' : ''}`} onPointerLeave={() => setFoco(null)}>
      <div className="demo-palco">
        <PixelSwap
          firstContent={<Planilha onMarca={marcar} foco={foco} />}
          secondContent={<PlanilhaArrumada onMarca={marcar} foco={foco} />}
          active={depois}
          trigger="manual"
          pixelSize={56}
          counterScale={false}
          pattern="left-to-right"
          randomness={0.35}
          pixelScale={0.2}
          duration={1300}
          pixelDuration={420}
          aspectRatio="16 / 12"
          className="demo-swap"
          onComplete={() => setTrocando(false)}
        />
        <button type="button" className={depois ? 'btn-ghost demo-acao' : 'btn btn-tinta demo-acao'}
                onClick={() => { setMexeu(true); alternar(); }} aria-pressed={depois} disabled={trocando}>
          <HugeiconsIcon icon={depois ? ArrowTurnBackwardIcon : MagicWand01Icon} size={20} strokeWidth={2} aria-hidden="true" />
          {depois ? 'Ver o antes' : 'Arrumar esta planilha'}
        </button>
      </div>
      <figcaption className="demo-legenda" aria-live="polite">
        {foco ? (
          <><b className="marca marca-legenda">{foco}</b><span>{textos[foco]}</span></>
        ) : (
          <span>
            <strong>{depois ? 'Depois: os mesmos 5 números, consertados.' : 'Antes: 5 problemas, marcados de 1 a 5.'}</strong>{' '}
            Quatro dias de outubro de uma papelaria, com dados fictícios.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
