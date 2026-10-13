import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Search01Icon, ArrowUpRight01Icon, HelpCircleIcon } from '@hugeicons/core-free-icons';
import { GASTOS, VENDAS_MES, real } from './dados';
import CountUp from './components/CountUp';
import ElasticSlider from './components/ElasticSlider';
import SplitFlap from './components/SplitFlap';

const calmo = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// número em reais que "rola" até o valor quando aparece (com pouco movimento, fica parado)
const Numero = ({ valor, duracao = 1.4 }) => (calmo ? real(valor)
  : <>R$&nbsp;<CountUp to={valor} duration={duracao} separator="." /></>);

// "E quanto sobrou?": exemplo do Raio-X do mês (serviço pago).
// A rosca mostra só os gastos fixos (os que vêm todo mês); embaixo, cada um comparado com a média dos
// três meses anteriores. A situação é uma observação, não uma solução: a solução fica para o Raio-X.
// Tons de um azul só, do escuro (maior gasto) ao claro; o nome e a parte de cada fatia vêm escritos.
const CORES = ['#14307f', '#2148c0', '#5d7bd0', '#97abe4'];
const SITUACAO = {
  confere: { rotulo: 'Confere', icone: CheckmarkCircle02Icon },
  conferir: { rotulo: 'Conferir a conta', icone: Search01Icon },
  subiu: { rotulo: 'Subiu 3×', icone: ArrowUpRight01Icon },
  retorno: { rotulo: 'Sem medida de retorno', icone: HelpCircleIcon }
};

const totalGastos = GASTOS.reduce((s, g) => s + g.valor, 0);
const SOBRA = VENDAS_MES - totalGastos;
const FIXOS = GASTOS.filter(g => g.fixo);
const totalFixos = FIXOS.reduce((s, g) => s + g.valor, 0);
const mediaFixos = FIXOS.reduce((s, g) => s + g.media, 0);
const variaveis = totalGastos - totalFixos;
// ponto de equilíbrio: o que sobra de cada real vendido depois dos gastos que acompanham as vendas paga os fixos
const equilibrio = Math.round(totalFixos / (1 - variaveis / VENDAS_MES) / 50) * 50;
const pedemOlhar = FIXOS.filter(g => g.situacao !== 'confere').length;
const sem = v => v.toLocaleString('pt-BR');
// calculadora: os fixos não mudam; o resto dos gastos acompanha as vendas na mesma proporção de outubro
const margem = 1 - variaveis / VENDAS_MES;
const sobraCom = v => Math.round(v * margem - totalFixos);
const porCem = Math.round(margem * 100);

// porcentagens que somam 100 (maior resto): sem isso, o arredondamento dá 99%
const brutos = FIXOS.map(g => (g.valor / totalFixos) * 100);
const PCT = brutos.map(Math.floor);
brutos.map((b, i) => [b - PCT[i], i]).sort((a, b) => b[0] - a[0])
  .slice(0, 100 - PCT.reduce((s, p) => s + p, 0)).forEach(([, i]) => { PCT[i] += 1; });

// rosca em SVG: cada fatia é um arco do mesmo círculo, com 2 px de folga entre elas
const R = 70, C = 2 * Math.PI * R, FOLGA = 2;
let acumulado = 0;
const FATIAS = FIXOS.map((g, i) => {
  const ini = acumulado; acumulado += g.valor;
  const meio = ((ini + g.valor / 2) / totalFixos) * 2 * Math.PI - Math.PI / 2;
  return { ...g, pct: PCT[i], cor: CORES[i], ini: (ini / totalFixos) * C, tam: (g.valor / totalFixos) * C, lx: 100 + Math.cos(meio) * 112, ly: 100 + Math.sin(meio) * 112, dir: Math.cos(meio) >= 0 ? 'start' : 'end' };
});

export default function Sobra({ onPedir }) {
  const [foco, setFoco] = useState(null);
  const [vendas, setVendas] = useState(VENDAS_MES);
  const resultado = sobraCom(vendas);
  // o painel mostra o valor "confirmado": o mesmo da frase, mas só depois de 250 ms sem mexer
  const [noPainel, setNoPainel] = useState(resultado);
  useEffect(() => { const t = window.setTimeout(() => setNoPainel(resultado), 250); return () => clearTimeout(t); }, [resultado]);
  // mouse: passar por cima destaca; toque: tocar na fatia ou na linha liga e desliga o destaque
  const marcar = i => ({
    onPointerEnter: e => e.pointerType === 'mouse' && setFoco(i),
    onPointerLeave: e => e.pointerType === 'mouse' && setFoco(null),
    onClick: () => setFoco(f => (f === i ? null : i))
  });

  return (
    <section className={`sec sobra${foco !== null ? ' com-foco' : ''}`} aria-labelledby="t-sobra">
      <div className="grid">
        <div className="sobra-esq">
        <h2 className="sec-title" id="t-sobra"><span className="sobra-etiqueta">Exemplo do Raio‑X do mês · depois, se quiser</span>E quanto sobrou?</h2>
          <p className="sobra-lead">
            A papelaria vendeu {real(VENDAS_MES)} em outubro e sobraram <strong><Numero valor={SOBRA} /></strong>. Os gastos fixos são onde a análise começa.
          </p>
          <p className="sobra-conta" aria-label={`Vendas ${real(VENDAS_MES)}, menos mercadoria e maquininha ${real(variaveis)}, menos gastos fixos ${real(totalFixos)}, igual a ${real(SOBRA)} de sobra`}>
            <span><b>{sem(VENDAS_MES)}</b> vendas</span>
            <span><i>−</i><b>{sem(variaveis)}</b> mercadoria e maquininha</span>
            <span><i>−</i><b>{sem(totalFixos)}</b> fixos</span>
            <span className="sobra-conta-fim"><i>=</i><b>{sem(SOBRA)}</b> sobra</span>
          </p>

              <figure className="rosca">
                <svg viewBox="-95 -12 390 224" role="img" aria-label={`Gastos fixos de outubro: ${FATIAS.map(f => `${f.nome} ${real(f.valor)}`).join(', ')}`}>
                  <g transform="rotate(-90 100 100)">
                    {FATIAS.map((f, i) => (
                      <circle key={f.nome} cx="100" cy="100" r={R} fill="none" stroke={f.cor} strokeWidth={foco === i ? 40 : 34}
                              strokeDasharray={`${Math.max(1, f.tam - FOLGA)} ${C}`} strokeDashoffset={-f.ini}
                              className={foco === i ? 'ativa' : undefined} {...marcar(i)} />
                    ))}
                  </g>
                  {FATIAS.map((f, i) => (
                    <text key={f.nome} x={f.lx} y={f.ly} textAnchor={f.dir} dominantBaseline="middle" className={`rosca-rotulo${foco === i ? ' ativa' : ''}`}>
                      <tspan x={f.lx} dy="-0.55em">{f.curto ?? f.nome}</tspan>
                      <tspan x={f.lx} dy="1.25em" className="rosca-pct">{f.pct}%</tspan>
                    </text>
                  ))}
                  <text x="100" y="96" textAnchor="middle" className="rosca-total">{real(totalFixos)}</text>
                  <text x="100" y="112" textAnchor="middle" className="rosca-sub">fixos no mês</text>
                </svg>
                <figcaption>Em outubro, os fixos ficaram <strong>{real(totalFixos - mediaFixos)} acima</strong> da média de julho a setembro.</figcaption>
              </figure>
        </div>

        <div className="sobra-dir">
              <dl className="sobra-fatos">
                <div><dt>{real(equilibrio)}</dt><dd>é quanto precisa vender por mês, mais ou menos, só para pagar as contas</dd></div>
                <div><dt>{pedemOlhar} de {FIXOS.length}</dt><dd>gastos fixos pedem um olhar. O Raio-X mostra quanto, por quê e o que fazer.</dd></div>
              </dl>

            <table className="fixos-tabela">
              <caption className="sr-only">Gastos fixos de outubro comparados com a média de julho a setembro</caption>
              <thead>
                <tr><th scope="col">Gasto fixo</th><th scope="col">Outubro</th><th scope="col">Média jul–set</th><th scope="col">O que eu vi</th></tr>
              </thead>
              <tbody>
                {FATIAS.map((f, i) => {
                  const S = SITUACAO[f.situacao];
                  const dif = f.valor - f.media;
                  return (
                    <tr key={f.nome} className={foco === i ? 'ativa' : undefined} {...marcar(i)}>
                      <th scope="row"><i style={{ background: f.cor }} aria-hidden="true" />{f.nome}</th>
                      <td>{real(f.valor)}</td>
                      <td>{real(f.media)}{dif !== 0 && <span className={dif > 0 ? 'subiu' : undefined}> ({dif > 0 ? '+' : ''}{Math.round((dif / f.media) * 100)}%)</span>}</td>
                      <td className="fixos-nota">
                        <span className="situacao">
                          <HugeiconsIcon icon={S.icone} size={16} strokeWidth={2} aria-hidden="true" />{S.rotulo}
                        </span>
                        {f.nota}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          <div className="calculo">
            <p className="calculo-titulo">E se a loja vendesse mais, ou menos?</p>
            <ElasticSlider value={vendas} onChange={setVendas} min={2000} max={8000} step={50}
                           label="Vendas do mês" valueText={`${real(vendas)} por mês`}
                           marks={[{ valor: equilibrio, rotulo: 'empata' }]}
                           leftIcon={<span className="calculo-ponta">{real(2000)}</span>}
                           rightIcon={<span className="calculo-ponta">{real(8000)}</span>} />
            <div className="calculo-placar">
              <p className="calculo-resultado" aria-hidden="true">
                Vendendo <b>{real(vendas)}</b> por mês, {resultado >= 0
                  ? <>sobrariam <b>{real(resultado)}</b></>
                  : <>faltariam <b className="falta">{real(-resultado)}</b> para pagar as contas</>}
              </p>
              {/* o painel gira até o valor novo quando a pessoa para de arrastar */}
              <span className={`calculo-valor${noPainel < 0 ? ' falta' : ''}`}>
                <span className="calculo-moeda" aria-hidden="true">R$</span>
                <SplitFlap text={sem(Math.abs(noPainel))} largura={5} espera={0} className={noPainel < 0 ? 'falta' : undefined} />
              </span>
            </div>
            <p className="sr-only" aria-live="polite">
              Vendendo {real(vendas)} por mês, {resultado >= 0 ? `sobrariam ${real(resultado)}.` : `faltariam ${real(-resultado)} para pagar as contas.`}
            </p>
            <p className="calculo-explica">
              A marca preta é o ponto em que o mês empata ({real(equilibrio)}). Cada {real(100)} a mais em vendas deixa
              uns {real(porCem)} no caixa, porque o resto vai para a mercadoria e a maquininha.
            </p>
          </div>

          <p className="sobra-nota">Dados fictícios; as vendas são as mesmas do exemplo acima. Imposto e contabilidade continuam com o seu contador.</p>
          <div className="sobra-volta">
            <p>Tudo começa pelo mês arrumado, de graça. O Raio-X só vem depois, se fizer sentido para você.</p>
            <a className="btn" href="#formulario" onClick={onPedir}>Quero meu mês arrumado</a>
          </div>
        </div>
      </div>
    </section>
  );
}
