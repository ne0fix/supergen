/**
 * Inicia um túnel público para receber webhooks do Mercado Pago localmente.
 *
 * Tenta na ordem:
 *   1. ngrok (se instalado e NGROK_AUTHTOKEN estiver no .env.local)
 *   2. localtunnel (instala automaticamente via npx, sem conta)
 *
 * Ao obter a URL pública, atualiza MP_NOTIFICATION_BASE_URL no .env.local
 * e exibe as instruções para registrar o webhook no painel do Mercado Pago.
 *
 * Uso: node scripts/tunel.mjs [--port 3000]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync, spawn } from 'child_process';
import { loadEnv } from './lib/env.mjs';

const env = loadEnv();
const PORT = parseInt(process.argv[process.argv.indexOf('--port') + 1] || '3000');

const VERDE   = '\x1b[32m';
const VERMELHO= '\x1b[31m';
const AMARELO = '\x1b[33m';
const CIANO   = '\x1b[36m';
const RESET   = '\x1b[0m';
const NEGRITO = '\x1b[1m';
const DIM     = '\x1b[2m';

function atualizarEnv(key, value, file = '.env.local') {
  const path = resolve(process.cwd(), file);
  let content = '';
  try { content = readFileSync(path, 'utf-8'); } catch { /* novo */ }

  const lines = content.split('\n');
  const idx = lines.findIndex(l => l.startsWith(`${key}=`) || l.startsWith(`# ${key}`));
  const newLine = `${key}="${value}"`;

  if (idx >= 0) {
    lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }
  writeFileSync(path, lines.filter(Boolean).join('\n') + '\n');
}

function exibirInstrucoes(url) {
  const webhookUrl = `${url}/api/webhooks/mercadopago`;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${VERDE}${NEGRITO}✅ Túnel ativo!${RESET}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`\n  URL pública : ${CIANO}${NEGRITO}${url}${RESET}`);
  console.log(`  Webhook URL : ${CIANO}${NEGRITO}${webhookUrl}${RESET}\n`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`${AMARELO}${NEGRITO}📋 Próximos passos:${RESET}\n`);
  console.log(`  ${NEGRITO}1.${RESET} Abra o painel do Mercado Pago:`);
  console.log(`     ${CIANO}https://www.mercadopago.com.br/developers/panel/app${RESET}`);
  console.log(`\n  ${NEGRITO}2.${RESET} Vá em: Seu App → Webhooks → Criar webhook`);
  console.log(`     URL:    ${CIANO}${webhookUrl}${RESET}`);
  console.log(`     Evento: ${NEGRITO}payment${RESET}`);
  console.log(`\n  ${NEGRITO}3.${RESET} Copie o ${NEGRITO}Webhook Secret${RESET} gerado pelo painel e adicione ao .env.local:`);
  console.log(`     ${AMARELO}MP_WEBHOOK_SECRET="cole_aqui_o_secret"${RESET}`);
  console.log(`\n  ${NEGRITO}4.${RESET} Reinicie o servidor dev (o .env.local foi atualizado):`);
  console.log(`     ${CIANO}npm run dev${RESET}`);
  console.log(`\n  ${NEGRITO}5.${RESET} Faça um pedido e o MP enviará o webhook para o seu computador.`);
  console.log(`     Monitore os logs do servidor para ver o webhook chegando.\n`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`${DIM}Pressione Ctrl+C para encerrar o túnel.${RESET}\n`);
}

// ─── Tentar ngrok ─────────────────────────────────────────────────────────────
async function tentarNgrok() {
  const authtoken = env.NGROK_AUTHTOKEN;

  // Verificar se ngrok está no PATH
  try { execSync('ngrok version', { stdio: 'pipe' }); } catch { return null; }

  if (!authtoken) {
    console.log(`  ${AMARELO}ngrok encontrado mas NGROK_AUTHTOKEN não está no .env.local${RESET}`);
    console.log(`  ${DIM}→ Crie uma conta gratuita em https://ngrok.com e adicione:`);
    console.log(`     NGROK_AUTHTOKEN="seu_token_aqui"${RESET}`);
    return null;
  }

  return new Promise((resolve, reject) => {
    console.log(`  Iniciando ngrok na porta ${PORT}...`);
    const proc = spawn('ngrok', ['http', String(PORT), '--authtoken', authtoken, '--log=stdout', '--log-format=json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let urlEncontrada = false;
    proc.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.url && obj.url.startsWith('https://') && !urlEncontrada) {
            urlEncontrada = true;
            resolve({ url: obj.url, proc });
          }
        } catch { /* linha não é JSON */ }
      }
    });

    proc.on('error', reject);
    setTimeout(() => { if (!urlEncontrada) reject(new Error('ngrok timeout')); }, 15_000);
  });
}

// ─── Usar localtunnel (sem conta) ─────────────────────────────────────────────
async function usarLocalTunnel() {
  console.log(`  ${AMARELO}Usando localtunnel (sem conta necessária)...${RESET}`);

  let lt;
  try {
    // Tenta importar se já instalado
    const { default: localtunnel } = await import('localtunnel');
    lt = await localtunnel({ port: PORT });
  } catch {
    // Instala localtunnel
    console.log(`  Instalando localtunnel...`);
    try {
      execSync('npm install localtunnel --save-dev --silent', { stdio: 'inherit', cwd: process.cwd() });
      const { default: localtunnel } = await import('localtunnel');
      lt = await localtunnel({ port: PORT });
    } catch (e) {
      throw new Error(`Não foi possível instalar localtunnel: ${e.message}`);
    }
  }

  return { url: lt.url, tunnel: lt };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${CIANO}${NEGRITO}🚇 Iniciando Túnel para Webhooks Mercado Pago${RESET}`);
  console.log(`${DIM}Porta local: ${PORT}${RESET}`);
  console.log('─'.repeat(60));
  console.log(`\n  ${NEGRITO}ATENÇÃO:${RESET} O servidor Next.js deve estar rodando em paralelo:`);
  console.log(`  ${CIANO}npm run dev${RESET}  ← execute em outro terminal antes de continuar\n`);
  console.log('─'.repeat(60));

  let resultado = null;

  // 1. Tentar ngrok
  console.log(`\n  ${NEGRITO}Tentando ngrok...${RESET}`);
  try {
    resultado = await tentarNgrok();
    if (resultado) console.log(`  ${VERDE}✅ ngrok iniciado${RESET}`);
  } catch (e) {
    console.log(`  ${AMARELO}ngrok falhou: ${e.message}${RESET}`);
  }

  // 2. Fallback: localtunnel
  if (!resultado) {
    console.log(`\n  ${NEGRITO}Usando localtunnel como alternativa...${RESET}`);
    try {
      resultado = await usarLocalTunnel();
      console.log(`  ${VERDE}✅ localtunnel iniciado${RESET}`);
    } catch (e) {
      console.log(`\n  ${VERMELHO}❌ Não foi possível iniciar nenhum túnel.${RESET}`);
      console.log(`\n  ${NEGRITO}Alternativas manuais:${RESET}`);
      console.log(`  ${CIANO}ngrok http ${PORT}${RESET}`);
      console.log(`  ${CIANO}npx localtunnel --port ${PORT}${RESET}`);
      process.exit(1);
    }
  }

  const { url } = resultado;

  // Atualizar .env.local
  atualizarEnv('MP_NOTIFICATION_BASE_URL', url);
  console.log(`  ${VERDE}✅ MP_NOTIFICATION_BASE_URL atualizado no .env.local${RESET}`);

  // Exibir instruções
  exibirInstrucoes(url);

  // Manter processo vivo (localtunnel)
  if (resultado.tunnel) {
    resultado.tunnel.on('close', () => {
      console.log(`\n${AMARELO}Túnel encerrado.${RESET}\n`);
      process.exit(0);
    });
    resultado.tunnel.on('error', (e) => {
      console.log(`\n${VERMELHO}Erro no túnel: ${e.message}${RESET}\n`);
    });
  }

  // Captura Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n\n${AMARELO}Encerrando túnel...${RESET}`);
    if (resultado.tunnel) resultado.tunnel.close();
    if (resultado.proc) resultado.proc.kill();
    console.log(`${VERDE}Túnel encerrado. Até mais!${RESET}\n`);
    process.exit(0);
  });

  // Mantém o processo vivo
  await new Promise(() => {});
}

main().catch(e => {
  console.error(`\n${'\x1b[31m'}Erro: ${e.message}${'\x1b[0m'}\n`);
  process.exit(1);
});
