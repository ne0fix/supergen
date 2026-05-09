/**
 * Testa a API de frete com múltiplos CEPs reais.
 * Uso: node scripts/testar-frete.mjs
 * Requer: servidor rodando em localhost:3000 (npm run dev)
 */

import { loadEnv } from './lib/env.mjs';

const env = loadEnv();
const BASE = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const VERDE  = '\x1b[32m';
const VERMELHO = '\x1b[31m';
const AMARELO = '\x1b[33m';
const CIANO  = '\x1b[36m';
const RESET  = '\x1b[0m';
const NEGRITO = '\x1b[1m';

const ok  = (msg) => console.log(`  ${VERDE}✅${RESET} ${msg}`);
const err = (msg) => console.log(`  ${VERMELHO}❌${RESET} ${msg}`);
const info = (msg) => console.log(`  ${AMARELO}ℹ${RESET}  ${msg}`);

function moeda(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

async function testarCep(descricao, cep, subtotal, esperado) {
  const url = `${BASE}/api/frete/calcular?cep=${cep}&subtotal=${subtotal}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      // Esperamos erro?
      if (esperado.erro) {
        ok(`${descricao} → ${res.status} "${data.error}" (esperado)`);
        return true;
      }
      err(`${descricao} → HTTP ${res.status}: ${data.error}`);
      return false;
    }

    if (esperado.erro) {
      err(`${descricao} → esperava erro mas recebeu sucesso`);
      return false;
    }

    const linhas = [
      `${NEGRITO}${data.logradouro || '—'}${RESET}`,
      `${data.bairro} — ${data.cidade}/${data.uf}`,
      `Frete: ${data.freteGratis ? VERDE + 'Grátis' + RESET : moeda(data.frete)}`,
    ];

    if (esperado.uf && data.uf !== esperado.uf) {
      err(`${descricao} → UF esperada ${esperado.uf}, recebida ${data.uf}`);
      return false;
    }
    if (esperado.freteGratis !== undefined && data.freteGratis !== esperado.freteGratis) {
      err(`${descricao} → freteGratis esperado ${esperado.freteGratis}, recebido ${data.freteGratis}`);
      return false;
    }
    if (esperado.frete !== undefined && data.frete !== esperado.frete) {
      err(`${descricao} → frete esperado ${moeda(esperado.frete)}, recebido ${moeda(data.frete)}`);
      return false;
    }

    ok(`${descricao} → ${linhas.join(' | ')}`);
    return true;
  } catch (e) {
    err(`${descricao} → Erro de rede: ${e.message} (servidor rodando?)`);
    return false;
  }
}

async function main() {
  console.log(`\n${CIANO}${NEGRITO}🧪 Testando API de Frete — ${BASE}${RESET}`);
  console.log('─'.repeat(60));

  const casos = [
    // [descrição, CEP, subtotal, esperado]
    ['CEP válido — SP (subtotal baixo)',    '01310100', 50,  { uf: 'SP', freteGratis: false, frete: 10 }],
    ['CEP válido — CE (Fortaleza)',         '60175047', 50,  { uf: 'CE', freteGratis: false, frete: 20 }],
    ['CEP válido — RS (Porto Alegre)',      '90040020', 50,  { uf: 'RS', freteGratis: false, frete: 14 }],
    ['CEP válido — DF (Brasília)',          '70040010', 50,  { uf: 'DF', freteGratis: false, frete: 16 }],
    ['Frete grátis (subtotal >= 200)',      '01310100', 250, { uf: 'SP', freteGratis: true,  frete: 0  }],
    ['CEP inválido (5 dígitos)',            '12345',    0,   { erro: true }],
    ['CEP inexistente (zeros)',             '00000000', 0,   { erro: true }],
  ];

  let passou = 0;
  for (const [desc, cep, sub, esp] of casos) {
    const ok = await testarCep(desc, cep, sub, esp);
    if (ok) passou++;
  }

  console.log('─'.repeat(60));
  const cor = passou === casos.length ? VERDE : VERMELHO;
  console.log(`\n${cor}${NEGRITO}Resultado: ${passou}/${casos.length} testes passaram${RESET}\n`);

  if (passou < casos.length) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
