import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export function loadEnv(file = '.env.local') {
  const path = resolve(process.cwd(), file);
  try {
    const content = readFileSync(path, 'utf-8');
    const env = {};
    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

export function writeEnvKey(key, value, file = '.env.local') {
  const path = resolve(process.cwd(), file);
  let content = '';
  try { content = readFileSync(path, 'utf-8'); } catch { /* novo */ }

  const lines = content.split('\n');
  const idx = lines.findIndex(l => l.startsWith(`${key}=`) || l.startsWith(`${key} =`));
  const newLine = `${key}="${value}"`;

  if (idx >= 0) {
    lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }

  writeFileSync(path, lines.filter(Boolean).join('\n') + '\n');
}
