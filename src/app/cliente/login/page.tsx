'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { formatarCPF } from '@/src/utils/validators';

/* ─── Ícone do cadeado igual ao da referência ─────────────────────────── */
function LockIllustration() {
  return (
    <div className="relative mx-auto" style={{ width: 110, height: 110 }}>
      <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Arco do cadeado */}
        <path
          d="M30 52V38C30 24.2 41.2 13 55 13C68.8 13 80 24.2 80 38V52"
          stroke="#4ade80" strokeWidth="9" strokeLinecap="round"
        />
        {/* Corpo do cadeado */}
        <rect x="14" y="50" width="82" height="56" rx="16" fill="#16a34a" />
        {/* Buraco da chave */}
        <circle cx="55" cy="74" r="9" fill="white" opacity="0.9" />
        <rect x="51.5" y="76" width="7" height="12" rx="3.5" fill="white" opacity="0.9" />
      </svg>
      {/* Badge de usuário — amarelo como na imagem */}
      <div
        className="absolute bottom-1 right-0 flex items-center justify-center rounded-full bg-yellow-400 border-2 border-white shadow-md"
        style={{ width: 38, height: 38 }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Ícone de envelope ───────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400 flex-shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Ícone de cadeado pequeno ────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400 flex-shrink-0">
      <rect x="3" y="11" width="18" height="11" rx="3" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Conteúdo principal ──────────────────────────────────────────────── */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/cliente';
  const redirect = decodeURIComponent(redirectParam);
  const sucesso = searchParams.get('sucesso') === '1';

  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [manter, setManter] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && cpf.replace(/\D/g, '').length === 11 && !carregando) {
      handleLogin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (carregando) return;
    setErro('');
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) { setErro('CPF inválido'); return; }
    if (pin.length !== 4) { setErro('PIN deve ter 4 dígitos'); return; }
    setCarregando(true);
    try {
      const res = await fetch('/api/cliente/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo, pin }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || 'CPF ou PIN inválidos'); return; }
      router.push(redirect);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    /*
     * Estrutura fiel à imagem:
     * - Fundo branco no topo (ícone + título + desc)
     * - Card branco com shadow no centro
     * - Fundo verde-escuro no rodapé
     */
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0fdf4' }}>

      {/* ── Área superior — branca/clara com ícone e título ── */}
      <div className="flex flex-col items-center text-center px-6 pt-10 pb-6 bg-white">
        <LockIllustration />

        <h1 className="mt-5 text-[26px] font-black text-gray-900 tracking-tight">
          Bem-vindo de volta!
        </h1>
        <p className="mt-2 text-gray-500 text-sm leading-relaxed max-w-[280px]">
          Acesse sua conta e acompanhe seus pedidos com facilidade e segurança.
        </p>
      </div>

      {/* ── Card branco central ── */}
      <div className="mx-4 rounded-3xl bg-white shadow-xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

        {sucesso && (
          <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-xl">
            ✅ Conta criada! Agora faça seu login.
          </div>
        )}

        <div className="px-6 pt-6 pb-7 space-y-4">

          {/* Título do card */}
          <h2 className="text-[17px] font-bold text-gray-900 text-center mb-5">
            Entrar na conta
          </h2>

          {/* Campo CPF */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-4" style={{ backgroundColor: '#f4f6f8' }}>
            <MailIcon />
            <input
              type="text"
              inputMode="numeric"
              maxLength={14}
              value={cpf}
              onChange={e => { setCpf(formatarCPF(e.target.value)); setErro(''); }}
              onBlur={() => {
                if (cpf.replace(/\D/g, '').length === 11) {
                  (document.getElementById('pin-field') as HTMLInputElement)?.focus();
                }
              }}
              placeholder="CPF (000.000.000-00)"
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Campo PIN */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-4" style={{ backgroundColor: '#f4f6f8' }}>
            <LockIcon />
            <input
              id="pin-field"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setErro(''); }}
              placeholder="PIN de 4 dígitos"
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none tracking-[0.5em] font-bold"
            />
            {/* Indicador de progresso do PIN */}
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < pin.length ? 'bg-green-600' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>

          {/* Manter conectado + Esqueci PIN */}
          <div className="flex items-center justify-between px-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => setManter(m => !m)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 border
                  ${manter ? 'bg-green-600 border-green-600' : 'border-gray-400 bg-white'}`}
              >
                {manter && (
                  <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                    <path d="M1 4l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-gray-600 font-medium">Salvar acesso</span>
            </label>
            <button type="button" className="text-[13px] text-gray-500 hover:text-green-600 transition-colors font-medium">
              Esqueci meu PIN
            </button>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs font-bold text-center">
              {erro}
            </div>
          )}

          {/* Botão principal */}
          <button
            type="button"
            onClick={() => handleLogin()}
            disabled={carregando}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-60
              text-white font-bold py-4 rounded-2xl transition-all duration-200
              flex items-center justify-center gap-2 text-[15px] mt-2"
            style={{ boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
          >
            {carregando
              ? <><Loader2 size={18} className="animate-spin" /> Entrando...</>
              : 'Entrar na conta'}
          </button>

          {/* Or. Login with */}
          <p className="text-center text-[13px] text-gray-500 font-medium py-1">
            Ou. Acesse com
          </p>

          {/* Três círculos — A, B, C */}
          <div className="flex items-center justify-center gap-5 pb-1">
            {[
              { letra: 'A', href: '/produtos',  bg: '#16a34a' },
              { letra: 'B', href: '/carrinho',  bg: '#15803d' },
              { letra: 'C', href: '/cadastro',  bg: '#166534' },
            ].map(({ letra, href, bg }) => (
              <Link key={letra} href={href}
                className="flex items-center justify-center rounded-full text-white font-black text-base transition-all hover:scale-110 active:scale-95"
                style={{ width: 50, height: 50, backgroundColor: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                {letra}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* ── Rodapé — fundo verde-escuro como o azul escuro da imagem ── */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 mt-4"
        style={{ backgroundColor: '#166534', minHeight: 90 }}
      >
        <p className="text-green-300 text-[13px]">Não tem uma conta?</p>
        <Link href="/cadastro"
          className="text-white font-black text-[16px] mt-0.5 hover:underline underline-offset-2 tracking-wide"
        >
          Criar Conta
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#166534' }}>
        <Loader2 className="animate-spin text-white" size={36} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
