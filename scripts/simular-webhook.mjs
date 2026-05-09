/**
 * Simula um webhook do Mercado Pago com assinatura HMAC-SHA256 correta.
 *
 * Uso:
 *   node scripts/simular-webhook.mjs --payment-id <ID> [--status approved]
 *
 * Exemplos:
 *   node scripts/simular-webhook.mjs --payment-id 123456789
 *   node scripts/simular-webhook.mjs --payment-id 123456789 --status approved
 *   node scripts/simular-webhook.mjs --payment-id 123456789 --url https://abc.ngrok.io
 *
 * Sem MP_WEBHOOK_SECRET no .env.local: assinatura é omitida (handler aceita em dev).
 * Com MP_WEBHOOK_SECRET: envia HMAC-SHA256 correto.
 */

import { createHmac, randomUUID } from 'crypto';
import { loadEnv } from './lib/env.mjs';

const VERDE   = '\x1b[32m';
const VERMELHO= '\x1b[31m';
const AMARELO = '\x1b[33m';
const CIANO   = '\x1b[36m';
const RESET   = '\x1b[0m';
const NEGRITO = '\x1b[1m';

// ─── Parse de argumentos ──────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
  };
  return {
    paymentId: get('--payment-id'),
    status:    get('--status') || 'approved',
    url:       get('--url'),
  };
}

// ─── HMAC-SHA256 ──────────────────────────────────────────────────────────────
function assinar(secret, paymentId, ts) {
  const template = `id:${paymentId};request-date:${ts};`;
  return createHmac('sha256', secret).update(template).digest('hex');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { paymentId, status, url: urlArg } = parseArgs();

  if (!paymentId) {
    console.error(`\n${VERMELHO}Uso: node scripts/simular-webhook.mjs --payment-id <ID>${RESET}`);
    console.error(`Exemplo: node scripts/simular-webhook.mjs --payment-id 123456789 --status approved\n`);
    process.exit(1);
  }

  const env = loadEnv();
  const baseUrl = urlArg || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoint = `${baseUrl}/api/webhooks/mercadopago`;
  const secret = env.MP_WEBHOOK_SECRET || '';

  console.log(`\n${CIANO}${NEGRITO}🔔 Simulando Webhook — Mercado Pago${RESET}`);
  console.log('─'.repeat(55));
  console.log(`  Payment ID : ${NEGRITO}${paymentId}${RESET}`);
  console.log(`  Status MP  : ${NEGRITO}${status}${RESET}`);
  console.log(`  Destino    : ${endpoint}`);
  console.log(`  Assinatura : ${secret ? VERDE + 'HMAC-SHA256 ativo' : AMARELO + 'sem secret (dev mode)'}${RESET}`);
  console.log('─'.repeat(55));

  // Payload do webhook (formato oficial MP)
  const ts = Date.now().toString();
  const requestId = randomUUID();

  const payload = {
    id: parseInt(paymentId, 10),
    live_mode: false,
    type: 'payment',
    date_created: new Date().toISOString(),
    user_id: 0,
    api_version: 'v1',
    action: 'payment.updated',
    data: { id: paymentId },
  };

  const bodyStr = JSON.stringify(payload);

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    'x-request-id': requestId,
    'user-agent': 'MercadoPago WebHook v1.0',
  };

  if (secret) {
    const hmac = assinar(secret, paymentId, ts);
    headers['x-signature'] = `ts=${ts},v1=${hmac}`;
    console.log(`\n  ${AMARELO}Assinatura:${RESET} ts=${ts}`);
    console.log(`  ${AMARELO}            ${RESET} v1=${hmac}`);
  } else {
    console.log(`\n  ${AMARELO}⚠ MP_WEBHOOK_SECRET vazio — validação ignorada pelo handler${RESET}`);
  }

  // Enviar
  console.log(`\n  Enviando payload...`);
  let res;
  try {
    res = await fetch(endpoint, { method: 'POST', headers, body: bodyStr });
  } catch (e) {
    console.log(`\n  ${VERMELHO}❌ Erro de conexão: ${e.message}${RESET}`);
    console.log(`  ${AMARELO}→ O servidor está rodando? (npm run dev)${RESET}\n`);
    process.exit(1);
  }

  const resBody = await res.text();
  let resJson;
  try { resJson = JSON.parse(resBody); } catch { resJson = resBody; }

  console.log('─'.repeat(55));
  if (res.ok) {
    console.log(`  ${VERDE}${NEGRITO}✅ ${res.status} ${res.statusText}${RESET}`);
    console.log(`  Resposta: ${JSON.stringify(resJson)}`);
    console.log(`\n  ${VERDE}Webhook processado com sucesso!${RESET}`);
    console.log(`  Verifique o status do pedido na tela admin ou via:`);
    console.log(`  ${CIANO}GET ${baseUrl}/api/checkout/status/<orderId>${RESET}\n`);
  } else {
    console.log(`  ${VERMELHO}${NEGRITO}❌ ${res.status} ${res.statusText}${RESET}`);
    console.log(`  Resposta: ${JSON.stringify(resJson)}`);
    if (res.status === 401) {
      console.log(`\n  ${AMARELO}→ Assinatura inválida. Verifique MP_WEBHOOK_SECRET no .env.local${RESET}\n`);
    } else if (res.status === 502) {
      console.log(`\n  ${AMARELO}→ Handler consultou o MP mas houve erro (ID de pagamento inexistente no sandbox?)${RESET}\n`);
    }
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
