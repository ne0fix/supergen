/**
 * Teste completo do fluxo PIX no sandbox do Mercado Pago.
 * 1. Busca um produto real da API
 * 2. Cria um pedido PIX (chama o MP sandbox de verdade)
 * 3. Exibe o QR Code e instruções
 * 4. Oferece simular a confirmação via webhook
 *
 * Uso: node scripts/testar-pix.mjs
 * Requer: servidor rodando em localhost:3000 (npm run dev)
 */

import { loadEnv } from './lib/env.mjs';
import { createInterface } from 'readline';

const env = loadEnv();
const BASE = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const VERDE   = '\x1b[32m';
const VERMELHO= '\x1b[31m';
const AMARELO = '\x1b[33m';
const CIANO   = '\x1b[36m';
const RESET   = '\x1b[0m';
const NEGRITO = '\x1b[1m';
const DIM     = '\x1b[2m';

const passo = (n, msg) => console.log(`\n  ${CIANO}[${n}]${RESET} ${NEGRITO}${msg}${RESET}`);
const ok    = (msg)    => console.log(`  ${VERDE}✅${RESET} ${msg}`);
const info  = (msg)    => console.log(`  ${AMARELO}ℹ${RESET}  ${msg}`);
const erro  = (msg)    => console.log(`  ${VERMELHO}❌${RESET} ${msg}`);

function moeda(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function pergunta(prompt) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, ans => { rl.close(); resolve(ans.trim()); }));
}

// ─── 1. Buscar produto ────────────────────────────────────────────────────────
async function buscarProduto() {
  const res = await fetch(`${BASE}/api/produtos?limit=1`);
  if (!res.ok) throw new Error(`API produtos retornou ${res.status}`);
  const data = await res.json();
  const produtos = data.produtos ?? data;
  if (!Array.isArray(produtos) || produtos.length === 0) throw new Error('Nenhum produto encontrado');
  return produtos[0];
}

// ─── 2. Criar pedido PIX ──────────────────────────────────────────────────────
async function criarPedidoPix(produto) {
  // CEP de Fortaleza-CE como exemplo
  const payload = {
    itens: [{ produtoId: produto.id, quantidade: 1 }],
    comprador: {
      nome:      'Teste Automatizado',
      email:     'test@test.com',
      cpf:       '12345678909',   // CPF válido para testes
      telefone:  '85999990000',
    },
    entrega: {
      tipo:       'ENTREGA',
      cep:        '60175047',
      logradouro: 'Avenida Santos Dumont',
      numero:     '5001',
      bairro:     'Papicu',
      cidade:     'Fortaleza',
      uf:         'CE',
    },
    metodo: 'PIX',
    frete: 20,
  };

  const res = await fetch(`${BASE}/api/checkout/iniciar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

// ─── 3. Buscar status (e mpPaymentId) ─────────────────────────────────────────
async function buscarStatus(orderId) {
  const res = await fetch(`${BASE}/api/checkout/status/${orderId}`);
  if (!res.ok) throw new Error(`Status retornou ${res.status}`);
  return res.json();
}

// ─── 4. Exibir QR Code como texto ────────────────────────────────────────────
function exibirQrCode(qrCode) {
  if (!qrCode) return;
  const linha = '─'.repeat(60);
  console.log(`\n  ${AMARELO}${NEGRITO}Código PIX (copia e cola):${RESET}`);
  console.log(`  ${linha}`);
  // Exibe em blocos de 60 chars para caber no terminal
  const chunks = qrCode.match(/.{1,60}/g) || [qrCode];
  chunks.forEach(c => console.log(`  ${DIM}${c}${RESET}`));
  console.log(`  ${linha}`);
}

// ─── 5. Simular webhook após pagamento ───────────────────────────────────────
async function simularWebhook(mpPaymentId) {
  const { execSync } = await import('child_process');
  try {
    console.log(`\n  ${AMARELO}Simulando confirmação de pagamento (webhook)...${RESET}`);
    execSync(
      `node scripts/simular-webhook.mjs --payment-id ${mpPaymentId} --status approved`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
  } catch {
    erro('Falha ao simular webhook. Execute manualmente:');
    console.log(`  ${CIANO}node scripts/simular-webhook.mjs --payment-id ${mpPaymentId}${RESET}`);
  }
}

// ─── 6. Polling de status ──────────────────────────────────────────────────────
async function aguardarPagamento(orderId, timeoutMs = 120_000) {
  console.log(`\n  ${AMARELO}Aguardando confirmação de pagamento (até 2 min)...${RESET}`);
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const s = await buscarStatus(orderId);
      process.stdout.write(`  Status: ${NEGRITO}${s.status}${RESET}          \r`);
      if (s.status === 'PAID') {
        console.log(`\n  ${VERDE}${NEGRITO}✅ PAGAMENTO CONFIRMADO!${RESET}`);
        return true;
      }
      if (s.status === 'FAILED' || s.status === 'CANCELLED') {
        console.log(`\n  ${VERMELHO}${NEGRITO}❌ Pagamento ${s.status}${RESET}`);
        return false;
      }
    } catch { /* ignorar erros de rede temporários */ }
  }
  console.log(`\n  ${AMARELO}⏱ Timeout — o pedido continua em PENDING_PAYMENT${RESET}`);
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${CIANO}${NEGRITO}💳 Teste de Checkout PIX — Sandbox Mercado Pago${RESET}`);
  console.log(`${DIM}Servidor: ${BASE}${RESET}`);
  console.log('═'.repeat(60));

  // Passo 1: produto
  passo(1, 'Buscando produto para teste...');
  let produto;
  try {
    produto = await buscarProduto();
    ok(`Produto: ${NEGRITO}${produto.nome}${RESET} ${DIM}(${produto.id})${RESET} — ${VERDE}${moeda(produto.preco)}${RESET}`);
  } catch (e) {
    erro(`Não foi possível buscar produto: ${e.message}`);
    info('Verifique se o servidor está rodando: npm run dev');
    process.exit(1);
  }

  // Passo 2: criar pedido
  passo(2, 'Criando pedido PIX no sandbox...');
  let pedido;
  try {
    pedido = await criarPedidoPix(produto);
    ok(`Pedido criado! orderId: ${NEGRITO}${pedido.orderId}${RESET}`);
    ok(`Total: ${VERDE}${moeda(parseFloat(produto.preco) + 20)}${RESET} (produto + frete CE)`);
    ok(`Expira em: ${new Date(pedido.expiresAt).toLocaleTimeString('pt-BR')}`);
  } catch (e) {
    erro(`Falha ao criar pedido: ${e.message}`);
    if (e.message.includes('MP_ACCESS_TOKEN') || e.message.includes('credentials')) {
      info('Verifique MP_ACCESS_TOKEN no .env.local');
    }
    process.exit(1);
  }

  // Passo 3: buscar status e mpPaymentId
  passo(3, 'Consultando status e ID do pagamento MP...');
  let statusData;
  try {
    statusData = await buscarStatus(pedido.orderId);
    ok(`Status: ${NEGRITO}${statusData.status}${RESET}`);
    if (statusData.mpPaymentId) {
      ok(`MP Payment ID: ${NEGRITO}${statusData.mpPaymentId}${RESET}`);
    }
  } catch (e) {
    info(`Não foi possível buscar status: ${e.message}`);
  }

  // Passo 4: exibir QR Code
  passo(4, 'QR Code PIX:');
  exibirQrCode(pedido.qrCode);

  // Passo 5: opções
  console.log(`\n${AMARELO}${NEGRITO}O que deseja fazer?${RESET}`);
  console.log(`  ${CIANO}1${RESET} — Simular pagamento via webhook (recomendado para teste local)`);
  console.log(`  ${CIANO}2${RESET} — Aguardar pagamento real no sandbox (você paga no painel MP)`);
  console.log(`  ${CIANO}3${RESET} — Sair`);

  const opcao = await pergunta(`\n  Escolha [1/2/3]: `);

  if (opcao === '1') {
    const mpPaymentId = statusData?.mpPaymentId || pedido.mpPaymentId;
    if (!mpPaymentId) {
      info('MP Payment ID não disponível no status. Use o endpoint de status para obtê-lo.');
      info(`curl ${BASE}/api/checkout/status/${pedido.orderId}`);
    } else {
      await simularWebhook(mpPaymentId);
      await aguardarPagamento(pedido.orderId, 10_000);
    }
  } else if (opcao === '2') {
    console.log(`\n  ${AMARELO}Siga os passos:${RESET}`);
    console.log(`  1. Acesse: ${CIANO}https://www.mercadopago.com.br/developers/panel/app${RESET}`);
    console.log(`  2. Faça login com a conta COMPRADORA de teste`);
    console.log(`  3. Vá em Atividade → localize o pagamento`);
    console.log(`  4. Clique em "Simular pagamento"`);
    await aguardarPagamento(pedido.orderId, 120_000);
  }

  console.log(`\n${DIM}orderId: ${pedido.orderId}${RESET}`);
  console.log(`${DIM}Verifique o admin: ${BASE}/admin/pedidos${RESET}\n`);
}

main().catch(e => {
  console.error(`\n${'\x1b[31m'}Erro inesperado: ${e.message}${'\x1b[0m'}\n`);
  process.exit(1);
});
