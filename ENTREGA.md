# Somô: entrega do P0

Resumo para o agente do curso e para quem for publicar.

## O que é

Landing page de uma página só, em português, para donos de pequenas lojas (papelaria e parecidos) que controlam as vendas numa planilha bagunçada ou num caderno.

- **Oferta:** o "mês arrumado", de graça. É uma conversa de 20 minutos e, depois, um mês das vendas organizado de presente.
- **Passos pagos, sem preço na página:** o "Raio-X do mês" (vendas, gastos e o que sobrou) e o "Fechamento do mês" (todo mês).
- **Pedido:** pelo formulário, que envia pelo Web3Forms. A página não mostra telefone, WhatsApp nem e-mail. O único contato é o de privacidade, e ele fica só na página de privacidade.
- **Dados:** todos os números são de uma papelaria fictícia e estão marcados como fictícios.

## Páginas

| Endereço | O que é | Arquivo |
|---|---|---|
| `/` | Landing | `src/App.jsx` |
| `/privacidade` | Como os dados e os arquivos são usados (LGPD) | `src/paginaPrivacidade.jsx` |
| qualquer endereço errado | Página 404 ("#REF!" de planilha) | `src/pagina404.jsx` |

## Tecnologia

- React 19 + Vite 8.
- Efeitos: GSAP + ScrollTrigger, Motion (componentes adaptados do React Bits) e Three.js na cena 3D, que só carrega quando a pessoa chega perto dela.
- Letra: Schibsted Grotesk, servida pelo próprio site.
- Sem servidor próprio, sem banco de dados e sem cookies.

## Segurança

- **Proteções no `vercel.json`:**
  - lista de origens permitidas (CSP): só o código do site roda, e só o Web3Forms recebe dados;
  - HTTPS obrigatório;
  - bloqueio de moldura (o site não pode ser exibido dentro de outro);
  - o navegador não adivinha o tipo de arquivo;
  - câmera, microfone e localização desligados.
- **Formulário:**
  - limpa e limita o texto antes de enviar;
  - ignora dados adulterados guardados no navegador;
  - não manda dois pedidos com um duplo clique;
  - não dá nenhum sinal a robôs, que caem num campo escondido.
- **Bibliotecas:** `npm audit` sem vulnerabilidades.

## Como conferir

```bash
npm install
npm run conferir
```

Gera a versão de publicação e testa 97 itens no PC, no celular e no tablet:
- pulos de layout, cena 3D e rolagem lateral;
- abas, atalhos e janela de dúvidas (no celular, com toques: abrir, ler até o fim, fechar, ir ao pedido);
- espaçamento da planilha da amostra no celular e no tablet;
- formulário: avisos, falha no envio e dados adulterados;
- proteções de segurança;
- privacidade, 404 e prévia do link.

Termina com "Tudo certo.".

## Antes de publicar (o Caio preenche)

Em `src/config.js`:

1. `FORM_ACCESS_KEY`: a chave do Web3Forms, criada em web3forms.com com o e-mail do projeto. No painel deles, ligue o filtro de spam e a resposta automática.
2. `EMAIL_PRIVACIDADE`: o e-mail para pedidos sobre dados. Aparece só em `/privacidade`.
3. `DIAS_PEDIDO`: em quantos dias o pedido de quem não seguiu para a conversa é apagado.

A publicação (`npm run build`) se recusa a sair se algum desses estiver vazio.

**Endereço do site:** na Vercel ele vem sozinho. O `VITE_SITE_URL` do `.env` só é necessário para publicar em outro lugar.

## Publicar

1. **GitHub:** crie um repositório vazio, sem README, e envie o projeto com `git remote add origin …` e `git push -u origin main`.
2. **Vercel:** em vercel.com, use *Add New → Project* e importe o repositório. Ela reconhece o Vite sozinha (comando `npm run build`, pasta `dist`).
3. **Depois de no ar:**
   - abra o site no celular;
   - mande o link para você mesmo no WhatsApp e veja a prévia;
   - envie um pedido de teste;
   - abra um endereço errado e veja a 404.

## Pendências conhecidas

- Confirmar o nome "Caio Simão" e as frases sobre ele.
- Conferir "Somô" no INPI e o domínio.
- Revisar o texto de `/privacidade`. Duas frases são compromissos: "não vendo nem passo esses dados" e "pode pedir para ver, corrigir ou apagar".
- Conferir nos termos da ferramenta de IA se ela guarda os arquivos enviados. Se guardar, isso entra em `/privacidade`.
