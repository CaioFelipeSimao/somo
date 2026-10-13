import { useEffect, useState } from 'react';
import './TextType.css';

// Adaptado do TextType do React Bits: digita a frase uma vez só (sem apagar nem repetir).
// A parte ainda não digitada já ocupa o lugar, invisível: o título não pula de altura enquanto digita.
// Quem lê tela recebe a frase inteira de uma vez; pouco movimento mostra a frase pronta.
export default function TextType({ text, typingSpeed = 38, initialDelay = 400, className = '' }) {
  const calmo = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(calmo ? text.length : 0);
  const pronto = n >= text.length;

  useEffect(() => {
    if (pronto) return;
    const t = setTimeout(() => setN(k => k + 1), n === 0 ? initialDelay : typingSpeed);
    return () => clearTimeout(t);
  }, [n, pronto, initialDelay, typingSpeed]);

  return (
    <span className={`text-type ${className}`} aria-label={text} role="text">
      <span className="text-type__feito" aria-hidden="true">{text.slice(0, n)}</span>
      {!calmo && <span className={`text-type__cursor${pronto ? ' text-type__cursor--fim' : ''}`} aria-hidden="true" />}
      <span className="text-type__resto" aria-hidden="true">{text.slice(n)}</span>
    </span>
  );
}
