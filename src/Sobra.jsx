import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Search01Icon, Scissor01Icon } from '@hugeicons/core-free-icons';
import { GASTOS, VENDAS_MES, real } from './dados';

// "E quanto sobrou?": exemplo do Raio-X do mês (serviço pago).
// A rosca mostra só os gastos fixos (os que vêm todo mês); ao lado, cada um comparado com a média dos
// três meses anteriores: se o valor confere, se precisa conferir a conta e onde dá para cortar.
// Tons de um azul só, do escuro (maior gasto) ao claro; o nome e a parte de cada fatia vêm escritos.
const CORES = ['#14307f', '#2148c0', '#5d7bd0', '#97abe4'];
const SITUACAO = {
  confere: { rotulo: 'Confere', icone: CheckmarkCircle02Icon },
  conferir: { rotulo: 'Conferir a conta', icone: Search01Icon },
  cortar: { rotulo: 'Dá para cortar', icone: Scissor01Icon }
};

const totalGastos = GASTOS.reduce((s, g) => s + g.valor, 0);
const SOBRA = VENDAS_MES - totalGastos;
const FIXOS = GASTOS.filter(g => g.fixo);
const totalFixos = FIXOS.reduce((s, g) => s + g.valor, 0);
const mediaFixos = FIXOS.reduce((s, g) => s + g.media, 0);
const variaveis = totalGastos - totalFixos;
// ponto de equilíbrio: o que sobra de cada real vendido depois dos gastos que acompanham as vendas paga os fixos
const equilibrio = Math.round(totalFixos / (1 - variaveis / VENDAS_MES) / 50) * 50;
const corte = FIXOS.reduce((s, g) => s + g.corte, 0);
const pct = (v, t) => `${Math.round((v / t) * 100)}%`;

// rosca em SVG: cada fatia é um arco do mesmo círculo, com 2 px de folga entre elas
const R = 70, C = 2 * Math.PI * R, FOLGA = 2;
let acumulado = 0;
const FATIAS = FIXOS.map((g, i) => {
  const ini = acumulado; acumulado += g.valor;
  const meio = ((ini + g.valor / 2) / totalFixos) * 2 * Math.PI - Math.PI / 2;
  return { ...g, cor: CORES[i], ini: (ini / totalFixos) * C, tam: (g.valor / totalFixos) * C, lx: 100 + Math.cos(meio) * 112, ly: 100 + Math.sin(meio) * 112, dir: Math.cos(meio) >= 0 ? 'start' : 'end' };
});

export default function Sobra() {
  const [foco, setFoco] = useState(null);
  const marcar = i => ({ onPointerEnter: () => setFoco(i), onPointerLeave: () => setFoco(null), onFocus: () => setFoco(i), onBlur: () => setFoco(null) });

  return (
    <section className="sec" aria-labelledby="t-sobra">
      <div className="grid">
        <h2 className="sec-title" id="t-sobra">E quanto sobrou?</h2>
        <div className="sobra-corpo">
          <p className="sobra-lead">
            A papelaria vendeu {real(VENDAS_MES)} em outubro. Depois das contas, sobraram <strong>{real(SOBRA)}</strong>.
            Os gastos fixos levaram {real(totalFixos)}: é onde mais dá para mexer.
          </p>

          <div className={`fixos${foco !== null ? ' com-foco' : ''}`}>
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
                    <tspan x={f.lx} dy="-0.55em">{f.nome}</tspan>
                    <tspan x={f.lx} dy="1.25em" className="rosca-pct">{pct(f.valor, totalFixos)}</tspan>
                  </text>
                ))}
                <text x="100" y="94" textAnchor="middle" className="rosca-total">{real(totalFixos)}</text>
                <text x="100" y="114" textAnchor="middle" className="rosca-sub">fixos no mês</text>
              </svg>
            </figure>

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
                    <tr key={f.nome} tabIndex={0} className={foco === i ? 'ativa' : undefined} {...marcar(i)}>
                      <th scope="row"><i style={{ background: f.cor }} aria-hidden="true" />{f.nome}</th>
                      <td>{real(f.valor)}</td>
                      <td>{real(f.media)}{dif !== 0 && <span className={dif > 0 ? 'subiu' : undefined}> ({dif > 0 ? '+' : ''}{pct(dif, f.media)})</span>}</td>
                      <td className="fixos-nota">
                        <span className={`situacao situacao-${f.situacao}`}>
                          <HugeiconsIcon icon={S.icone} size={16} strokeWidth={2} aria-hidden="true" />{S.rotulo}
                        </span>
                        {f.nota}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <dl className="sobra-fatos">
            <div><dt>{real(totalFixos)}</dt><dd>de gastos fixos em outubro, {real(totalFixos - mediaFixos)} acima da média dos últimos três meses</dd></div>
            <div><dt>{real(equilibrio)}</dt><dd>é quanto precisa vender por mês, mais ou menos, só para pagar as contas</dd></div>
            <div><dt>até {real(corte)}</dt><dd>por mês de corte possível nos fixos: a sobra passaria de {real(SOBRA)} para {real(SOBRA + corte)}</dd></div>
          </dl>
          <p className="sobra-nota">
            Exemplo do Raio-X do mês (o passo depois do grátis), com dados fictícios; as vendas são as mesmas do exemplo acima.
            Imposto e contabilidade continuam com o seu contador.
          </p>
        </div>
      </div>
    </section>
  );
}
