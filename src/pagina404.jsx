import { montar } from './PaginaSimples';

// Página não encontrada, na linguagem de planilha: o endereço vira uma fórmula que aponta para lugar nenhum (#REF!).
// O endereço aparece só como texto (o React não deixa virar código) e cortado, para não esticar a célula.
let caminho = window.location.pathname;
try { caminho = decodeURIComponent(caminho); } catch { /* endereço com % solto: mostra como veio */ }
caminho = caminho.slice(0, 48) || '/';

montar({
  sobre: 'Erro 404',
  titulo: 'Esta página não existe.',
  children: (
    <div className="erro">
      <figure className="erro-folha" aria-label={`Fórmula com o endereço ${caminho}, que dá erro de referência`}>
        <div className="erro-fx" aria-hidden="true"><i>fx</i><span>=PÁGINA("{caminho}")</span></div>
        <div className="erro-celula" aria-hidden="true"><span className="erro-ref">#REF!</span></div>
      </figure>
      <div className="erro-texto">
        <p>O endereço que você abriu não leva a nenhuma página. Pode ter sido digitado errado, ou a página mudou de lugar.</p>
        <div className="erro-acoes">
          <a className="btn" href="/">Voltar ao início</a>
          <a className="btn-ghost erro-pedido" href="/#formulario">Quero meu mês arrumado</a>
        </div>
      </div>
    </div>
  )
});
