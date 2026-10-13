import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';

// "Parece com a sua rotina?": cada dor vem com um recorte da mesma planilha mostrando o sintoma,
// e uma linha com o que muda. Os recortes são fictícios, como o resto da página.

function Recorte({ arquivo, children }) {
  return (
    <div className="recorte" aria-hidden="true">
      {arquivo && <div className="recorte-aba">{arquivo}</div>}
      {children}
    </div>
  );
}

const Tabela = ({ linhas, cab }) => (
  <table>
    {cab && <thead><tr>{cab.map(c => <th key={c}>{c}</th>)}</tr></thead>}
    <tbody>
      {linhas.map((l, i) => (
        <tr key={i}>{l.map((c, j) => <td key={j} className={c.cls}>{c.t ?? c}</td>)}</tr>
      ))}
    </tbody>
  </table>
);

const SINTOMAS = [
  {
    dor: 'Não sei qual produto vende mais.',
    leitura: 'Recorte de planilha: três produtos e o campo "mais vendido" com três pontos de interrogação.',
    figura: (
      <Recorte arquivo="vendas_out.xlsx">
        <Tabela cab={['produto', 'qtd', 'valor']} linhas={[
          ['caderno 10 mat', '3', '18,90'],
          ['CANETA AZUL', '12', '2.5'],
          ['Caderno espiral', '2', 'R$ 37,8'],
          [{ t: 'mais vendido?', cls: 'forte' }, '', { t: '???', cls: 'erro' }]
        ]} />
      </Recorte>
    ),
    muda: 'Painel de vendas: a resposta em uma tela.'
  },
  {
    dor: 'Gasto horas copiando dados de um lugar para outro.',
    leitura: 'Duas planilhas lado a lado com os mesmos dados copiados de uma para a outra, e um valor que não bate.',
    figura: (
      <div className="recorte-par" aria-hidden="true">
        <Recorte arquivo="vendas.xlsx">
          <Tabela linhas={[['caderno', '3'], ['caneta', '12'], [{ t: 'mochila', cls: 'copiado' }, { t: '1', cls: 'copiado' }]]} />
        </Recorte>
        <span className="recorte-seta">
          <HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={1.8} />
          <small>copiar e colar</small>
        </span>
        <Recorte arquivo="estoque.xlsx">
          <Tabela linhas={[['caderno', '3'], ['caneta', '12'], [{ t: 'mochila', cls: 'copiado' }, { t: '11', cls: 'erro' }]]} />
        </Recorte>
      </div>
    ),
    muda: 'Relatório semanal que chega pronto, sem copiar nada.'
  },
  {
    dor: 'Só uma pessoa entende a planilha (ou o caderno).',
    leitura: 'Uma célula com uma fórmula longa e ilegível e um bilhete colado: não mexer.',
    figura: (
      <Recorte arquivo="caixa_2024_NOVO.xlsx">
        <div className="recorte-formula"><span>fx</span>=SE(PROCV(B2;Plan3!A:F;6;0)&gt;0;SOMA(D2:D40)-H$1;"")</div>
        <Tabela linhas={[['total do dia', { t: '#N/D', cls: 'erro' }]]} />
        <p className="recorte-bilhete">não mexer nessa fórmula!</p>
      </Recorte>
    ),
    muda: 'Uma planilha arrumada, que qualquer pessoa da loja entende.'
  },
  {
    dor: 'Não confio nos números no fim do mês.',
    leitura: 'Uma página de caderno com o total de outubro, R$ 4.965, e a planilha com R$ 4.735: R$ 230 de diferença.',
    // o total da planilha é a soma das colunas da cena 3D (4.735); o caderno anotou a mais
    figura: (
      <div className="recorte-par" aria-hidden="true">
        <div className="caderno">
          <span className="caderno-mes">outubro</span>
          <span>vendas: R$ 4.965</span>
          <span />
        </div>
        <span className="recorte-seta">
          <b className="recorte-diferente">≠</b>
          <small className="erro">R$ 230 ???</small>
        </span>
        <Recorte arquivo="vendas_out.xlsx">
          <Tabela linhas={[['outubro', ''], [{ t: 'total', cls: 'forte' }, 'R$ 4.735']]} />
        </Recorte>
      </div>
    ),
    muda: 'Estoque e caixa que fecham no fim do mês.'
  }
];

// Blur Text nas dores, e o recorte e a linha azul chegando logo depois (classe "chegou" em cada item).
// Se o efeito chegar quando a seção já está na tela, fica tudo parado (sem piscar).
export default function Sintomas() {
  const ref = useRef(null);
  const [Blur, setBlur] = useState(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let vivo = true, io;
    import('./components/BlurText').then(m => {
      const r = ref.current?.getBoundingClientRect();
      if (!vivo || !r || (r.top < window.innerHeight && r.bottom > 0)) return;
      setBlur(() => m.default);
      ref.current.classList.add('sintomas-anima');
      io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('chegou'); io.unobserve(e.target); }
      }), { threshold: 0.3 });
      ref.current.querySelectorAll('.sintomas > li').forEach(li => io.observe(li));
    });
    return () => { vivo = false; io?.disconnect(); };
  }, []);

  return (
    <div className="sintomas-corpo" ref={ref}>
      <ul className="sintomas">
        {SINTOMAS.map(s => (
          <li key={s.dor}>
            <div className="sintoma-dor" role="heading" aria-level={3}>
              {Blur ? <Blur text={s.dor} delay={50} threshold={0.3} stepDuration={0.3}
                            animationFrom={{ filter: 'blur(8px)', opacity: 0, y: -10 }}
                            animationTo={[{ filter: 'blur(3px)', opacity: 0.6, y: 2 }, { filter: 'blur(0px)', opacity: 1, y: 0 }]} />
                : s.dor}
            </div>
            <figure>
              {s.figura}
              <figcaption className="sr-only">{s.leitura}</figcaption>
            </figure>
            <p className="sintoma-muda">
              <HugeiconsIcon icon={ArrowRight02Icon} size={18} strokeWidth={2} aria-hidden="true" />
              <span>{s.muda}</span>
            </p>
          </li>
        ))}
      </ul>
      <p className="sintomas-nota">Recortes de exemplo, com dados fictícios.</p>
    </div>
  );
}
