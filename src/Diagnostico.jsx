import { LUCRO, real } from './dados';

// Prévia do que a pessoa recebe depois da conversa (fictícia, ao lado do formulário):
// o mês arrumado, com o mais vendido, e o que foi corrigido. Os achados batem célula a célula
// com a planilha do topo, e os valores com a cena 3D.
const ACHADOS = [
  { titulo: 'Os cadernos estavam em linhas separadas.', texto: '“caderno 10 mat” e “Caderno espiral” agora somam juntos. Assim aparece que é o que mais vende.' },
  { titulo: 'Duas vendas estavam sem valor certo.', texto: 'A mochila (???) não tinha valor e a conta das canetas bic deu erro (#VALOR!). Conferimos na conversa e o total do mês fechou.' },
  { titulo: 'Cadernos e mochilas puxam as vendas.', texto: 'Vale deixar os dois perto do caixa e nunca deixar faltar.' }
];

const TOPO = LUCRO.slice(0, 3);

export default function Diagnostico() {
  return (
    <figure className="diag" aria-labelledby="t-diag">
      <div className="diag-folha">
        <p className="diag-topo"><span>O que você recebe</span><span>exemplo</span></p>
        <p className="diag-titulo" id="t-diag">Papelaria do bairro, outubro</p>
        <ol className="diag-mais" aria-label="Mais vendidos do mês">
          {TOPO.map(p => (
            <li key={p.produto}>
              <span>{p.produto}</span>
              <i style={{ '--w': p.valor / TOPO[0].valor }} aria-hidden="true" />
              <span>{real(p.valor)}</span>
            </li>
          ))}
        </ol>
        <ol className="diag-achados">
          {ACHADOS.map(a => (
            <li key={a.titulo}><strong>{a.titulo}</strong> {a.texto}</li>
          ))}
        </ol>
        <p className="diag-fim">Junto vai a planilha do mês arrumada, para você continuar usando.</p>
      </div>
      <figcaption>Isso chega depois da conversa, sem custo. Exemplo com dados fictícios.</figcaption>
    </figure>
  );
}
