// Desenho da marca em texto puro (sem React): usado pela página e pelo script que gera as imagens de prévia.

// Uma peça quadrada de lado s com cantos de raio r, e o canto "curvo" (grande) de raio R.
// curvo: 'tl' | 'tr' | 'br' | 'bl' (top/bottom, left/right)
export function peca(x, y, s, r, R, curvo) {
  const [tl, tr, br, bl] = ['tl', 'tr', 'br', 'bl'].map(c => (c === curvo ? R : r));
  return `M${x + tl} ${y}H${x + s - tr}A${tr} ${tr} 0 0 1 ${x + s} ${y + tr}V${y + s - br}A${br} ${br} 0 0 1 ${x + s - br} ${y + s}H${x + bl}A${bl} ${bl} 0 0 1 ${x} ${y + s - bl}V${y + tl}A${tl} ${tl} 0 0 1 ${x + tl} ${y}Z`;
}

// o símbolo: as quatro peças com o canto curvo virado para o centro
export const S = 44, G = 6;
export const SIMBOLO = [peca(0, 0, S, 8, 26, 'br'), peca(S + G, 0, S, 8, 26, 'bl'), peca(0, S + G, S, 8, 26, 'tr'), peca(S + G, S + G, S, 8, 26, 'tl')].join('');

