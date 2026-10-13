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

// vendas do mês por produto; fichas = quantas fichas da cena 3D formam a barra (cada uma vale cerca de R$ 150)
export const LUCRO = [
  { produto: 'Cadernos', valor: 1840, fichas: 12 },
  { produto: 'Mochilas', valor: 1215, fichas: 8 },
  { produto: 'Canetas', valor: 960, fichas: 6 },
  { produto: 'Presentes', valor: 430, fichas: 3 },
  { produto: 'Cópias', valor: 290, fichas: 2 }
];

export const real = valor => `R$ ${valor.toLocaleString('pt-BR')}`;
export const ehErro = v => v.startsWith('#') || v === '???';

// Raio-X do mês (exemplo fictício): vendas de outubro = soma das colunas da cena 3D; gastos do mês da mesma papelaria.
// fixo = vem todo mês igual; os outros acompanham as vendas.
export const VENDAS_MES = LUCRO.reduce((s, l) => s + l.valor, 0);
export const GASTOS = [
  { nome: 'Mercadoria comprada', valor: 2370, fixo: false },
  // fixos: média = julho a setembro (fictícia); corte = quanto dá para economizar por mês, se a sugestão der certo
  { nome: 'Aluguel', valor: 900, fixo: true, media: 900, corte: 0, situacao: 'confere',
    nota: 'Bate com o contrato. É o maior fixo, mas não muda até a renovação.' },
  { nome: 'Luz, água e internet', valor: 260, fixo: true, media: 200, corte: 60, situacao: 'conferir',
    nota: 'A conta de luz veio bem acima dos outros meses. Vale conferir a leitura do medidor antes de pagar.' },
  { nome: 'Manutenção', valor: 180, fixo: true, media: 60, corte: 120, situacao: 'cortar',
    nota: 'Duas visitas para a mesma impressora no mês. Já compensa orçar uma nova ou um contrato fixo.' },
  { nome: 'Marketing', valor: 150, fixo: true, media: 150, corte: 75, situacao: 'cortar',
    nota: 'Igual todo mês, mas ninguém mede se traz cliente. Dá para testar com metade e olhar as vendas.' },
  { nome: 'Taxa da maquininha', valor: 120, fixo: false }
];
