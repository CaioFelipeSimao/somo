'use client';

// Adaptado do Elastic Slider do React Bits (https://reactbits.dev/components/elastic-slider):
// - sem Chakra UI e react-icons (os ícones vêm por props);
// - valor controlado de fora (value + onChange), para a calculadora usar o número;
// - funciona pelo teclado (setas, Page Up/Down, Home/End) e é lido como "slider" pelo leitor de tela;
// - visual no estilo da página (cantos retos, azul), no ElasticSlider.css;
// - no toque, só começa a arrastar com gesto para o lado: o dedo que rola a página não mexe no valor.
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

import './ElasticSlider.css';

const MAX_OVERFLOW = 50;

export default function ElasticSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueText,
  leftIcon = null,
  rightIcon = null,
  marks = [],
  className = ''
}) {
  const sliderRef = useRef(null);
  const [region, setRegion] = useState('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  const ajustar = v => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const toque = useRef(null);   // início do toque: { x, y, decidido }

  useMotionValueEvent(clientX, 'change', latest => {
    if (!sliderRef.current) return;
    const { left, right } = sliderRef.current.getBoundingClientRect();
    let fora;
    if (latest < left) { setRegion('left'); fora = left - latest; }
    else if (latest > right) { setRegion('right'); fora = latest - right; }
    else { setRegion('middle'); fora = 0; }
    overflow.jump(decay(fora, MAX_OVERFLOW));
  });

  const handlePointerMove = e => {
    if (toque.current && !toque.current.decidido) {
      const dx = Math.abs(e.clientX - toque.current.x), dy = Math.abs(e.clientY - toque.current.y);
      if (dx < 6 && dy < 6) return;
      if (dy >= dx) { toque.current = null; return; }   // gesto vertical: é rolagem, não arrasto
      // no toque o navegador já prende o dedo ao controle; pedir de novo fazia ele soltar e cortar o arrasto
      toque.current.decidido = true;
    }
    if (toque.current === null && e.pointerType === 'touch') return;
    if ((e.buttons > 0 || toque.current?.decidido) && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      onChange(ajustar(min + ((e.clientX - left) / width) * (max - min)));
      clientX.jump(e.clientX);
    }
  };
  const handlePointerDown = e => {
    if (e.pointerType === 'touch') { toque.current = { x: e.clientX, y: e.clientY, decidido: false }; return; }
    handlePointerMove(e); e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = () => { toque.current = null; animate(overflow, 0, { type: 'spring', bounce: 0.5 }); };

  const handleKeyDown = e => {
    const passos = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -step * 10, PageUp: step * 10 };
    if (e.key in passos) { e.preventDefault(); onChange(ajustar(value + passos[e.key])); }
    else if (e.key === 'Home') { e.preventDefault(); onChange(min); }
    else if (e.key === 'End') { e.preventDefault(); onChange(max); }
  };

  const pct = v => ((v - min) / (max - min)) * 100;

  return (
    <div className={`slider-container ${className}`}>
      <motion.div className="slider-wrapper">
        {leftIcon && (
          <motion.div aria-hidden="true" className="slider-icone"
                      animate={{ scale: region === 'left' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
                      style={{ x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)) }}>
            {leftIcon}
          </motion.div>
        )}

        <div
          ref={sliderRef}
          className="slider-root"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          onKeyDown={handleKeyDown}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={() => animate(overflow, 0, { type: 'spring', bounce: 0.5 })}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => (sliderRef.current ? 1 + overflow.get() / sliderRef.current.getBoundingClientRect().width : 1)),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => {
                if (!sliderRef.current) return 'left';
                const { left, width } = sliderRef.current.getBoundingClientRect();
                return clientX.get() < left + width / 2 ? 'right' : 'left';
              })
            }}
            className="slider-track-wrapper"
          >
            <div className="slider-track">
              <div className="slider-range" style={{ width: `${pct(value)}%` }} />
              {marks.map(m => <span key={m.valor} className="slider-marca" style={{ left: `${pct(m.valor)}%` }} title={m.rotulo} />)}
            </div>
            <span className="slider-alca" style={{ left: `${pct(value)}%` }} aria-hidden="true" />
          </motion.div>
        </div>

        {rightIcon && (
          <motion.div aria-hidden="true" className="slider-icone"
                      animate={{ scale: region === 'right' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
                      style={{ x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)) }}>
            {rightIcon}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function decay(value, max) {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}
