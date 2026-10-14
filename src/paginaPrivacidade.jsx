import { montar } from './PaginaSimples';
import { EMAIL_PRIVACIDADE, DIAS_PEDIDO } from './config';

// O que o Somô faz com o que a pessoa manda. Só traz o que o Caio decidiu; mudou a prática, mude aqui.
montar({
  sobre: 'Em palavras simples',
  titulo: 'Privacidade',
  abertura: 'O que eu faço com o que você me manda. Quem cuida disso sou eu, Caio Simão.',
  semLinkPrivacidade: true,
  children: (
    <article className="priv">
      <section>
        <h2>O que você me manda pelo formulário</h2>
        <p>Seu nome, o tipo da sua loja, um WhatsApp ou e-mail e, se quiser, o que mais te incomoda. Uso só para responder ao seu pedido e combinar a nossa conversa. Não vendo nem passo esses dados para ninguém usar.</p>
        <p>Para o formulário chegar até mim, o site usa o Web3Forms, um serviço que entrega o pedido no meu e-mail.</p>
        <p>Se a gente não seguir para a conversa, apago o seu pedido em até {DIAS_PEDIDO} dias.</p>
      </section>
      <section>
        <h2>Suas fotos e planilhas</h2>
        <p>Você escolhe, e eu pergunto na nossa conversa:</p>
        <ul>
          <li><strong>Se quiser que eu guarde,</strong> uso os arquivos para comparar com os próximos meses e ver o que melhorou na sua loja.</li>
          <li><strong>Se não quiser,</strong> apago depois de entregar o mês arrumado.</li>
        </ul>
        <p>Para ler as fotos e organizar os números, uso uma ferramenta de inteligência artificial. Quem confere e responde sou eu.</p>
        <p>Não peço senha nem acesso ao seu sistema.</p>
      </section>
      <section>
        <h2>O que fica no seu navegador</h2>
        <p>O site não usa cookies. Enquanto a aba está aberta, ele guarda no seu próprio navegador o rascunho do formulário, para você não perder o que escreveu. E lembra se você desligou os atalhos de teclado. Nada disso vem para mim.</p>
        <p>Para saber quantas pessoas visitam o site, uso o contador de visitas da Vercel, que hospeda a página. Ele conta páginas vistas, de que país e de que tipo de aparelho, sem cookies e sem guardar nada que identifique você.</p>
      </section>
      <section>
        <h2>Seus direitos</h2>
        <p>Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou apagar os seus dados e arquivos a qualquer momento. Se já conversamos, é só me pedir pelo mesmo WhatsApp ou e-mail. Se não, escreva para <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>.</p>
      </section>
      <p className="priv-data">Atualizado em outubro de 2026.</p>
    </article>
  )
});
