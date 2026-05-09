// Tabela de frete por região (MVP — substituir por Melhor Envio futuramente)
const FRETE_POR_REGIAO: Record<string, number> = {
  // Sudeste
  SP: 10, RJ: 12, MG: 12, ES: 14,
  // Sul
  RS: 14, SC: 13, PR: 12,
  // Centro-Oeste
  DF: 16, GO: 16, MT: 18, MS: 17,
  // Nordeste
  BA: 18, SE: 19, AL: 20, PE: 20, PB: 21, RN: 21, CE: 20, PI: 22, MA: 22,
  // Norte
  PA: 24, AM: 28, RO: 26, AC: 30, RR: 30, AP: 28, TO: 22,
};
const FRETE_PADRAO = 20;

export function calcularFretePorUF(uf: string): number {
  return FRETE_POR_REGIAO[uf.toUpperCase()] ?? FRETE_PADRAO;
}
