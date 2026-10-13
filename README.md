# Somô

Landing page do Somô: "seu mês de vendas arrumado, de presente". Uma página só, em React + Vite, e uma página de privacidade.

## Rodar no computador

```bash
npm.cmd install
npm.cmd run dev
```

Abre em http://localhost:5173/. O que você salvar nos arquivos aparece na hora.

## Antes de publicar

1. **Chave do formulário.** Crie a chave em web3forms.com com o e-mail do projeto e cole em `src/config.js`, no lugar de `COLE_AQUI_A_CHAVE`. No painel do Web3Forms, ative o filtro de spam e a resposta automática.
2. **Contato e prazo da privacidade.** Em `src/config.js`, preencha `EMAIL_PRIVACIDADE` (aparece só na página de privacidade) e `DIAS_PEDIDO` (em quantos dias você apaga o pedido de quem não seguiu para a conversa).
3. **Endereço do site.** Em `.env`, troque `VITE_SITE_URL` pelo endereço público, por exemplo `https://somo.com.br`, sem barra no fim. Ele vai na prévia do link no WhatsApp.
4. **Conferir tudo:**

   ```bash
   npm.cmd run conferir
   ```

   Gera a versão de publicação e testa no PC e no celular: pulos de layout, cena 3D, abas, janela de dúvidas, atalhos, formulário, dados adulterados, proteções de segurança, privacidade e prévia do link. Termina com "Tudo certo." ou com a lista do que falhou.

A publicação (`npm.cmd run build`) para sozinha se faltar a chave, o contato da privacidade ou o endereço, para não ir ao ar com o formulário desligado.

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| Textos da página | `src/App.jsx` (topo, serviços, como funciona, quem faz) |
| Perguntas da barra (fx) e abas | `src/Barra.jsx` |
| Dúvidas e atalhos | `src/Ajuda.jsx` |
| Números do exemplo (papelaria fictícia) | `src/dados.js` |
| Sintomas | `src/Sintomas.jsx` |
| Formulário | `src/LeadForm.jsx` |
| Cores, letra, espaços | `src/style.css` (no topo, em `:root`) |
| Privacidade | `src/paginaPrivacidade.jsx` |
| Página de erro (404) | `src/pagina404.jsx` |
| Rodapé (todas as páginas) | `src/Rodape.jsx` |
| Proteções de segurança | `vercel.json` |

Mudou o título ou a marca? Gere de novo a imagem de prévia e o ícone do celular:

```bash
npm.cmd run imagens
```

## Publicar na Vercel

Importe o repositório na Vercel. Ela reconhece o Vite sozinha (comando `npm run build`, pasta `dist`). Em *Environment Variables*, crie `VITE_SITE_URL` com o endereço do site. O `vercel.json` já liga as proteções e os endereços sem `.html` (`/privacidade`).
