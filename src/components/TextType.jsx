import { useEffect, useState } from 'react';
import './TextType.css';

// Adaptado do TextType do React Bits: digita a frase uma vez só (sem apagar nem repetir).
// A parte ainda não digitada já ocupa o lugar, invisível: o título não pula de altura enquanto digita.
// Quem lê tela recebe a frase inteira de uma vez; pouco movimento mostra a frase pronta.
// Duas camadas iguais, uma sobre a outra: a de baixo só pinta as faixas atrás de cada linha e a de cima só tem
// as letras. Assim a faixa de uma linha nunca cobre a perna do "p" ou do "g" da linha de cima.
// onDone: chamado uma vez quando a frase termina (na hora, se a pessoa pediu pouco movimento)
export default function TextType({ text, typingSpeed = 38, initialDelay = 400, className = '', onDone }) {
  const calmo = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(calmo ? text.length : 0);
  const pronto = n >= text.length;

  useEffect(() => {
    if (pronto) return;
    const t = setTimeout(() => setN(k => k + 1), n === 0 ? initialDelay : typingSpeed);
    return () => clearTimeout(t);
  }, [n, pronto, initialDelay, typingSpeed]);

  useEffect(() => { if (pronto) onDone?.(); }, [pronto]); // eslint-disable-line react-hooks/exhaustive-deps

  const camada = (fundo) => (
    <span className={`text-type__camada${fundo ? ' text-type__camada--fundo' : ''}`} aria-hidden="true">
      <span className="text-type__feito">{text.slice(0, n)}</span>
      {!calmo && !fundo && <span className={`text-type__cursor${pronto ? ' text-type__cursor--fim' : ''}`} />}
      <span className="text-type__resto">{text.slice(n)}</span>
    </span>
  );

  return (
    <span className={`text-type ${className}`} aria-label={text} role="text">
      {camada(true)}
      {camada(false)}
    </span>
  );
}
