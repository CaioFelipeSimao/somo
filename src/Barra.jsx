import { useEffect, useRef, useState } from 'react';
import DecryptedText from './components/DecryptedText';

// Nome do produto: trocar aqui troca na barra (o título da aba fica em index.html).
export const NOME = 'Somô';

// A barra imita a barra de fórmulas de uma planilha: a caixa de nome à esquerda, o "fx" com a
// pergunta que a seção atual responde, e as abas das seções embaixo (a aba atual fica marcada).
const SECOES = [
  { id: 'topo', aba: null, fx: 'Dá para arrumar a minha planilha?' },
  { id: 't-problemas', aba: 'Problema', fx: 'Onde a planilha atrapalha?' },
  { id: 't-cena', aba: 'Exemplo', fx: 'Qual produto vende mais?' },
  { id: 't-sobra', aba: null, grupo: 't-cena', fx: 'Quanto sobrou no fim do mês?' },
  { id: 't-servicos', aba: 'Serviços', fx: 'O que vem depois do grátis?' },
  { id: 't-passos', aba: 'Como funciona', fx: 'Como funciona, passo a passo?' },
  { id: 't-quem', aba: 'Quem faz', fx: 'Quem vai olhar os meus números?' },
  { id: 'formulario', aba: null, fx: 'Como eu peço?' }
];

// cada seção começa no topo do bloco que contém o título (a cena e os degraus têm trilhos de rolagem próprios)
const bloco = id => {
  const el = document.getElementById(id);
  return el?.closest('.degraus-trilho, .cena, section, header') ?? el;
};

export default function Barra({ onPedir }) {
  const [atual, setAtual] = useState(0);
  const calmo = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // no celular a faixa de abas desliza; a aba da seção atual vem para a vista sozinha
  const abasRef = useRef(null);
  useEffect(() => {
    const ul = abasRef.current, a = ul?.querySelector('a.ativa');
    if (!a || ul.scrollWidth <= ul.clientWidth) return;
    // sem animação: no Chrome, animar esta faixa interrompe a rolagem suave da página que está acontecendo
    ul.scrollTo({ left: Math.max(0, a.offsetLeft - 24), behavior: 'instant' });
  }, [atual]);

  // Clique na aba: rola até o começo do bloco, não até o título. Os títulos da cena e dos serviços ficam
  // dentro de partes presas na tela, e a posição deles muda durante a rolagem; o começo do bloco não muda.
  // Ao terminar, confere e corrige se a página ainda mexeu (algo carregou no caminho).
  const ir = id => e => {
    e.preventDefault();
    const destino = () => bloco(id).getBoundingClientRect().top + window.scrollY - (document.querySelector('.barra')?.offsetHeight ?? 0);
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: destino(), behavior: suave ? 'smooth' : 'instant' });
    const conferir = () => { const d = destino(); if (Math.abs(d - window.scrollY) > 4) window.scrollTo({ top: d, behavior: 'instant' }); };
    if (suave && 'onscrollend' in window) window.addEventListener('scrollend', conferir, { once: true });
    else window.setTimeout(conferir, suave ? 1200 : 0);
  };

  return (
    <nav className="barra" aria-label="Seções da página">
      <div className="barra-linha">
        <a className="barra-nome" href="#topo">{NOME}</a>
        <p className="barra-fx" aria-hidden="true">
          <i>fx</i>
          {/* a pergunta se decifra da esquerda para a direita, com caracteres de planilha (pouco movimento: texto parado) */}
          <span className="barra-fx-texto">
            {calmo ? SECOES[atual].fx : (
              <DecryptedText key={atual} text={SECOES[atual].fx} animateOn="view" sequential revealDirection="start"
                             speed={22} characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#=$%+" encryptedClassName="barra-fx-cifra" />
            )}
          </span>
        </p>
        <a className="btn barra-cta" href="#formulario" onClick={onPedir}>Quero meu mês arrumado</a>
      </div>
      <ul className="barra-abas" ref={abasRef}>
        {SECOES.filter(s => s.aba).map(s => {
          const ativa = SECOES[atual].id === s.id || SECOES[atual].grupo === s.id;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={ir(s.id)} aria-current={ativa ? 'location' : undefined} className={ativa ? 'ativa' : undefined}>{s.aba}</a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
