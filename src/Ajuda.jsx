import { forwardRef } from 'react';

// Janela de dúvidas (abre pela aba "Dúvidas" ou pela tecla ?). Usa o <dialog> do navegador:
// ele já prende o foco dentro da janela e fecha com Esc. As respostas repetem o que a página já diz.
const DUVIDAS = [
  ['Quanto custa?', 'O mês arrumado é de graça e sem compromisso. Os outros passos só se fizer sentido para você, com o preço combinado antes.'],
  ['O que eu preciso mandar?', 'A planilha do jeito que estiver. Se for caderno, fotos das páginas bastam.'],
  ['Quanto tempo leva?', 'A conversa leva 20 minutos, por vídeo ou WhatsApp. Respondo ao pedido em até 2 dias úteis.'],
  ['Você vai pedir senha?', 'Não peço senha nem acesso ao seu sistema.'],
  ['E o imposto?', 'Imposto e contabilidade continuam com o seu contador.']
];

export const ATALHOS = [
  ['1 a 5', 'ir para Problema, Exemplo, Serviços, Como funciona, Quem faz'],
  ['T', 'voltar ao topo'],
  ['P', 'ir para o pedido'],
  ['?', 'abrir estas dúvidas'],
  ['Esc', 'fechar']
];

const Ajuda = forwardRef(function Ajuda({ onPedir }, ref) {
  const fechar = () => ref.current?.close();
  return (
    // clique no fundo escuro (fora da caixa) também fecha
    <dialog ref={ref} className="ajuda" aria-labelledby="ajuda-titulo" onClick={e => { if (e.target === e.currentTarget) fechar(); }}>
      <div className="ajuda-caixa">
        <header className="ajuda-topo">
          <h2 id="ajuda-titulo">Dúvidas</h2>
          <button type="button" className="ajuda-fechar" onClick={fechar}>Fechar</button>
        </header>
        <dl className="ajuda-lista">
          {DUVIDAS.map(([p, r]) => <div key={p}><dt>{p}</dt><dd>{r}</dd></div>)}
        </dl>
        <section className="ajuda-atalhos" aria-labelledby="ajuda-atalhos-t">
          <h3 id="ajuda-atalhos-t">Atalhos de teclado</h3>
          <dl>
            {ATALHOS.map(([k, o]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{o}</dd></div>)}
          </dl>
        </section>
        <a className="btn" href="#formulario" onClick={e => { fechar(); onPedir?.(e); }}>Quero meu mês arrumado</a>
      </div>
    </dialog>
  );
});

export default Ajuda;
