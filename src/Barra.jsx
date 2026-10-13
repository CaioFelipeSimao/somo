import { useEffect, useState } from 'react';

// Nome do produto: trocar aqui troca na barra (o título da aba fica em index.html).
export const NOME = 'Caio Simão';

// A barra imita a barra de fórmulas de uma planilha: a caixa de nome à esquerda, o "fx" com a
// "fórmula" da seção em que a pessoa está, e as abas das seções embaixo (a aba atual fica marcada).
const SECOES = [
  { id: 'topo', aba: null, fx: '=ARRUMAR(sua planilha)' },
  { id: 't-problemas', aba: 'Problema', fx: '=ONDE.DÓI(vendas; estoque; caixa)' },
  { id: 't-cena', aba: 'Da bagunça', fx: '=SOMA(cadernos)  → R$ 1.840' },
  { id: 't-servicos', aba: 'Degraus', fx: '=DEGRAUS(grátis; lucro; todo mês)' },
  { id: 't-passos', aba: 'Como funciona', fx: '=CONVERSA(20 min) + MÊS.ARRUMADO()' },
  { id: 't-quem', aba: 'Quem faz', fx: '=QUEM.FAZ("Caio Simão")' },
  { id: 'formulario', aba: null, fx: '=PEDIR(meu mês arrumado)' }
];

// cada seção começa no topo do bloco que contém o título (a cena e os degraus têm trilhos de rolagem próprios)
const bloco = id => {
  const el = document.getElementById(id);
  return el?.closest('.degraus-trilho, .cena, section, header') ?? el;
};

export default function Barra({ onPedir }) {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const linha = window.innerHeight * 0.35;
      let i = 0;
      SECOES.forEach((s, k) => { const b = bloco(s.id); if (b && b.getBoundingClientRect().top <= linha) i = k; });
      setAtual(i);
    };
    const pedir = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    medir();
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); cancelAnimationFrame(quadro); };
  }, []);

  return (
    <nav className="barra" aria-label="Seções da página">
      <div className="barra-linha">
        <a className="barra-nome" href="#topo">{NOME}</a>
        <p className="barra-fx" aria-hidden="true">
          <i>fx</i><span key={atual}>{SECOES[atual].fx}</span>
        </p>
        <a className="btn barra-cta" href="#formulario" onClick={onPedir}>Quero meu mês arrumado</a>
      </div>
      <ul className="barra-abas">
        {SECOES.filter(s => s.aba).map(s => {
          const ativa = SECOES[atual].id === s.id;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={ativa ? 'location' : undefined} className={ativa ? 'ativa' : undefined}>{s.aba}</a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
