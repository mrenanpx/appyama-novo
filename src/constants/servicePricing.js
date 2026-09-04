// Fonte única de preço (por faixa) para os simuladores de Serviços
// (cópia e impressão). Usada pela calculadora de dentro da subcategoria
// (ServiceCalculator) e pela "Calculadora Rápida de Balcão" (HomeView).
//
// Para atualizar um preço, altere SOMENTE uma das tabelas abaixo — todos os
// simuladores que consomem este módulo passam a refletir a mudança.

// Normaliza o tipo independente de vir como "P/B", "PB", "CÓPIA"/"COPIA",
// com acentos, espaços/símbolos ou caixa diferente.
const TIPO_NORMALIZADO = (tipo) => {
  const str = String(tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos (é não vira "PB")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');        // remove espaços, barras, hífens etc.
  if (str.includes('COLORIDA')) return 'COLORIDA';
  if (str.includes('COPIA')) return 'COPIA';
  if (str.includes('PB')) return 'PB';
  return null;
};

// Faixas unitárias (R$/un) por tipo e formato. Cada linha é [limite, preço]:
// a primeira faixa em que "qtd <= limite" define o preço. Os limites devem
// estar em ordem crescente e a última faixa usa Infinity como teto.
const TABELAS = {
  PB: {
    A4: [[10, 1.00], [20, 0.75], [30, 0.60], [80, 0.50], [199, 0.45], [Infinity, 0.40]],
    A3: [[10, 2.00], [20, 1.50], [30, 1.20], [80, 1.00], [199, 0.90], [Infinity, 0.80]]
  },
  COLORIDA: {
    A4: [[10, 1.70], [20, 1.50], [50, 1.40], [Infinity, 1.30]],
    A3: [[10, 3.40], [20, 3.00], [50, 2.80], [Infinity, 2.70]]
  },
  COPIA: {
    A4: [[10, 0.50], [50, 0.45], [199, 0.40], [Infinity, 0.35]],
    A3: [[10, 1.00], [50, 0.90], [199, 0.80], [Infinity, 0.70]]
  }
};

// Faixas-limite usadas para a dica "Faltam X para o valor baixar!".
const LIMITES = {
  COPIA: [10, 50, 199],
  PB: [10, 20, 30, 80, 199],
  COLORIDA: [10, 20, 50]
};

// Retorna o preço unitário (R$) para certo tipo/formato/quantidade.
// formato: 'A4' | 'A3'
export const getServiceUnit = (tipo, formato = 'A4', qtd = 0) => {
  const norm = TIPO_NORMALIZADO(tipo);
  const q = Math.max(0, Number(qtd) || 0);
  const tabela = norm && TABELAS[norm] ? TABELAS[norm][formato === 'A3' ? 'A3' : 'A4'] : null;
  if (!tabela) return 0;
  for (const [ate, preco] of tabela) {
    if (q <= ate) return preco;
  }
  return 0;
};

// Retorna as faixas-limite para a mensagem "Faltam X unid..." de um tipo.
export const getServiceTiers = (tipo) => {
  const norm = TIPO_NORMALIZADO(tipo);
  return norm ? LIMITES[norm] : [];
};

// Tipo legível para título (ex.: "IMPRESSÃO PB" -> "IMPRESSÃO P/B").
export const getServiceLabel = (tipo) => {
  const norm = TIPO_NORMALIZADO(tipo);
  if (norm === 'COLORIDA') return 'IMPRESSÃO COLORIDA';
  if (norm === 'PB') return 'IMPRESSÃO P/B';
  if (norm === 'COPIA') return 'COPIA';
  return String(tipo || '');
};
