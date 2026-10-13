// Marca Somô: quatro peças com o canto de dentro curvo (formam um "furo" redondo no meio) e o padrão de peças.
// Desenhadas em SVG (nítidas em qualquer tamanho), a partir da identidade feita pelo Caio.

// Uma peça quadrada de lado s com cantos de raio r, e o canto "curvo" (grande) de raio R.
// curvo: 'tl' | 'tr' | 'br' | 'bl' (top/bottom, left/right)
export function peca(x, y, s, r, R, curvo) {
  const [tl, tr, br, bl] = ['tl', 'tr', 'br', 'bl'].map(c => (c === curvo ? R : r));
  return `M${x + tl} ${y}H${x + s - tr}A${tr} ${tr} 0 0 1 ${x + s} ${y + tr}V${y + s - br}A${br} ${br} 0 0 1 ${x + s - br} ${y + s}H${x + bl}A${bl} ${bl} 0 0 1 ${x} ${y + s - bl}V${y + tl}A${tl} ${tl} 0 0 1 ${x + tl} ${y}Z`;
}

// o símbolo: as quatro peças com o canto curvo virado para o centro
const S = 44, G = 6;
const SIMBOLO = [peca(0, 0, S, 8, 26, 'br'), peca(S + G, 0, S, 8, 26, 'bl'), peca(0, S + G, S, 8, 26, 'tr'), peca(S + G, S + G, S, 8, 26, 'tl')].join('');

export function Simbolo({ tamanho = 20, cor = 'currentColor', className }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 94 94" aria-hidden="true" focusable="false">
      <path d={SIMBOLO} fill={cor} />
    </svg>
  );
}

// padrão: um bloco de 4×4 casas que se repete; flores de quatro peças e peças soltas, em duas cores
const C = 48, P = 40, M = (C - P) / 2;
const casa = (i, j, curvo) => peca(i * C + M, j * C + M, P, 7, 22, curvo);
const FORTE = [casa(1, 1, 'br'), casa(2, 1, 'bl'), casa(1, 2, 'tr'), casa(2, 2, 'tl'), casa(3, 3, 'tl'), casa(0, 0, 'br')].join('');
const LEVE = [casa(3, 0, 'bl'), casa(0, 3, 'tr'), casa(3, 1, 'tl'), casa(0, 2, 'br')].join('');

// id: cada cópia do padrão na página precisa do seu (topo e rodapé usam cores diferentes)
export function Padrao({ id = 'padrao-soma', className, forte = 'var(--on-accent)', leve = 'var(--apoio)' }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width={C * 4} height={C * 4} patternUnits="userSpaceOnUse">
          <path d={LEVE} fill={leve} />
          <path d={FORTE} fill={forte} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
