// Prévia do que a pessoa recebe: uma folha de diagnóstico de exemplo (fictícia), ao lado do formulário.
const ACHADOS = [
  { titulo: '“Caderno” está escrito de três jeitos.', texto: 'As vendas dele ficam divididas em três linhas e ele parece vender menos do que vende.' },
  { titulo: 'Duas vendas estão sem valor (???).', texto: 'O total do mês sai menor do que entrou de verdade.' },
  { titulo: 'Cadernos e mochilas puxam as vendas.', texto: 'Vale deixar os dois perto do caixa e nunca deixar faltar.' }
];

export default function Diagnostico() {
  return (
    <figure className="diag" aria-labelledby="t-diag">
      <div className="diag-folha">
        <p className="diag-topo"><span>Diagnóstico por escrito</span><span>exemplo</span></p>
        <p className="diag-titulo" id="t-diag">Papelaria do bairro, outubro</p>
        <ol className="diag-achados">
          {ACHADOS.map(a => (
            <li key={a.titulo}><strong>{a.titulo}</strong> {a.texto}</li>
          ))}
        </ol>
        <p className="diag-fim">Próximo passo sugerido: juntar os nomes iguais e conferir as duas vendas sem valor.</p>
      </div>
      <figcaption>É isso que você recebe depois da conversa. Exemplo com dados fictícios.</figcaption>
    </figure>
  );
}
