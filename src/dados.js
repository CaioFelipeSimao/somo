// Dados fictícios de uma papelaria, usados no antes e depois do topo e na cena 3D.
// O "antes" repete os erros comuns de planilha feita à mão; o "depois" responde a pergunta que ela não responde.

export const LINHAS = [
  ['data', 'produto', 'qtd', 'valor', 'obs'],
  ['12/10', 'caderno 10 mat', '3', '18,90', ''],
  ['12-out', 'Caderno espiral', '2', 'R$ 37,8', ''],
  ['13/10', 'CANETA AZUL', '12', '2.5', ''],
  ['13/10', 'mochila', '1', '???', 'conferir no caderno'],
  ['14/10', 'caneta bic', '6', '#VALOR!', ''],
  ['14/10', 'presente dia crianças', '4', '28,00', 'anotei no papel'],
  ['15/10', 'xerox', '40', '0,25', ''],
  ['', '', '', '', ''],
  ['', 'TOTAL?', '', '#REF!', '']
];

// fichas = quantas fichas da cena 3D formam a barra (cada uma vale cerca de R$ 150)
export const LUCRO = [
  { produto: 'Cadernos', valor: 1840, fichas: 12 },
  { produto: 'Mochilas', valor: 1215, fichas: 8 },
  { produto: 'Canetas', valor: 960, fichas: 6 },
  { produto: 'Presentes', valor: 430, fichas: 3 },
  { produto: 'Cópias', valor: 290, fichas: 2 }
];

export const real = valor => `R$ ${valor.toLocaleString('pt-BR')}`;
export const ehErro = v => v.startsWith('#') || v === '???';
