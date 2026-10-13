import { Simbolo, Padrao } from './Marca';

// rodapé como o anúncio da marca: faixa azul, o símbolo, a frase e o padrão de peças no canto (igual em todas as páginas)
export default function Rodape({ semLinkPrivacidade = false }) {
  return (
    <footer className="footer">
      <Padrao id="padrao-rodape" className="footer-padrao" />
      <div className="grid">
        <p className="footer-marca"><Simbolo tamanho={36} cor="var(--on-accent)" /><strong>Somô</strong></p>
        <p className="footer-frase">Clareza para o seu pequeno comércio.</p>
        <p className="footer-miudo">Por Caio Simão. Os dados enviados pelo formulário são usados só para responder ao seu pedido.{!semLinkPrivacidade && <> <a href="/privacidade">Como eu cuido dos seus dados e arquivos</a></>}</p>
      </div>
    </footer>
  );
}
