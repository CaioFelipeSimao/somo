import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/schibsted-grotesk';
import './style.css';
import { Simbolo, Padrao } from './Marca';
import Rodape from './Rodape';

// Molde das páginas de apoio (privacidade, página não encontrada): a mesma barra branca com a marca e o botão
// do pedido, o padrão de peças no topo, o título na faixa branca e o rodapé azul da landing.
function PaginaSimples({ titulo, sobre, children }) {
  return (
    <>
      <nav className="simples-barra" aria-label="Somô">
        <a className="simples-marca" href="/" aria-label="Somô, voltar ao início"><Simbolo tamanho={28} cor="var(--accent)" /><span>Somô</span></a>
        <a className="btn simples-cta" href="/#formulario">Quero meu mês arrumado</a>
      </nav>
      <header className="simples-topo">
        <Padrao id="padrao-simples" className="simples-padrao" forte="var(--apoio-forte)" leve="var(--apoio)" />
        <div className="grid">
          {sobre && <p className="simples-sobre">{sobre}</p>}
          <h1 className="simples-titulo"><span>{titulo}</span></h1>
        </div>
      </header>
      <main className="simples-corpo">
        <div className="grid">{children}</div>
      </main>
      <Rodape />
    </>
  );
}

export function montar(props) {
  createRoot(document.getElementById('root')).render(<StrictMode><PaginaSimples {...props} /></StrictMode>);
}
