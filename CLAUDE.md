# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- Alguns números fictícios estão escritos à mão nos textos (ex.: "R$ 4.735" em `Sintomas.jsx`): mudou `src/dados.js`, procure o número antigo em `src/`.
- Animação presa à rolagem pode parar no meio: o estado intermediário precisa ficar bonito.
- Texto escondido usa `visibility: hidden`, não `color: transparent`: o segundo conta como pulo de layout.
- O tablet do dono deitado tem ~1152x720: algo fixo na tela (sticky) mais alto que ~630 px corta. Teste 1152x720 e 720x1152.
- O Web3Forms recusa o navegador de teste "HeadlessChrome": para envio de teste, troque o user agent por um normal.
- Verificação (piloto do Caio, revisar depois da decisão em `.claude/revisoes.md`). Pequena = texto, cor ou espaço num lugar só: mostrar foto ou medida. Média = componente, comportamento ou teste: ida e volta (o teste falha sem a correção e passa com ela; se a mudança é só de teste, quebrar a página de propósito e ver o item falhar). Grande = 3 ou mais arquivos de `src/`, mais de uma seção visível, ou o formulário: ida e volta + subagente `revisor` (modo "mudança") antes do push.
- Terceira tentativa: se o Caio disse duas vezes que o mesmo pedido saiu errado, antes de mexer escrever um objetivo com critério medível e chamar o `revisor` no modo "critério", qualquer que seja o tamanho.
- Ao chamar o `revisor`: avisar o Caio e seguir, a menos que ele diga "pula"; mandar os critérios escritos e a lista de arquivos da tarefa, nunca um resumo do que foi feito; guardar `git status --porcelain` antes e comparar depois (se mudou, avisar). Todo push vira linha no caderno (com revisor, sem revisor ou "pula"), com o custo tirado do resultado da ferramenta; o Caio confirma a classificação.
