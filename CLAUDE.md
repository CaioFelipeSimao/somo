# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- Alguns números fictícios estão escritos à mão nos textos (ex.: "R$ 4.735" em `Sintomas.jsx`): mudou `src/dados.js`, procure o número antigo em `src/`.
- Animação presa à rolagem pode parar no meio: o estado intermediário precisa ficar bonito.
- Texto escondido usa `visibility: hidden`, não `color: transparent`: o segundo conta como pulo de layout.
- O tablet do dono deitado tem ~1152x720: algo fixo na tela (sticky) mais alto que ~630 px corta. Teste 1152x720 e 720x1152.
- O Web3Forms recusa o navegador de teste "HeadlessChrome": para envio de teste, troque o user agent por um normal.
