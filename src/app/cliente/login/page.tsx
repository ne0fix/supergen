'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, ShoppingBag, Tag, UserPlus } from 'lucide-react';
import { formatarCPF } from '@/src/utils/validators';

/* ─── Ícone decorativo do topo (cadeado + usuário) ──────────────────────── */
function TopIcon() {
  return (
    <div className="relative mx-auto w-24 h-24">
      {/* Cadeado */}
      <svg viewBox="0 0 96 96" fill="none" className="w-full h-full drop-shadow-xl">
        {/* Arco do cadeado */}
        <path d="M28 44V32C28 21.507 36.507 13 47 13 57.493 13 66 21.507 66 32V44"
          stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* Corpo */}
        <rect x="16" y="42" width="64" height="44" rx="10" fill="white" />
        {/* Buraco do cadeado */}
        <circle cx="48" cy="60" r="7" fill="#16a34a" />
        <rect x="44" y="60" width="8" height="11" rx="3" fill="#16a34a" />
      </svg>
      {/* Badge usuário */}
      <div className="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow-md">
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Conteúdo do login ──────────────────────────────────────────────────── */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/cliente';
  const redirect = decodeURIComponent(redirectParam);
  const sucesso = searchParams.get('sucesso') === '1';

  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [manter, setManter] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Auto-submit quando PIN estiver com 4 dígitos
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
    if (cpfLimpo.length !== 11) { setErro('Informe um CPF válido'); return; }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-700 via-green-700 to-green-900">

      {/* ─── Seção superior (ícone + título + descrição) ─────────────────── */}
      <div className="flex flex-col items-center justify-center pt-14 pb-10 px-6 text-center">
        <TopIcon />
        <h1 className="mt-6 text-3xl font-black text-white tracking-tight">
          Bem-vindo de volta!
        </h1>
        <p className="mt-2 text-green-200 text-sm leading-relaxed max-w-xs">
          Acesse sua conta para ver seus pedidos, gerenciar endereços e comprar com mais agilidade.
        </p>
      </div>

      {/* ─── Card branco ─────────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-sm mx-auto px-4">
        <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden">

          {/* Header do card */}
          <div className="pt-7 pb-2 px-7 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">Entrar na conta</h2>
            <Link href="/">
              <Image src="/gn2.png" alt="Ekomart" width={80} height={32} className="h-8 w-auto" />
            </Link>
          </div>

          {sucesso && (
            <div className="mx-7 mt-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-xl">
              ✅ Conta criada! Faça seu login.
            </div>
          )}

          <form onSubmit={handleLogin} className="px-7 pt-5 pb-7 space-y-4">

            {/* Campo CPF */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/15 transition-all bg-gray-50/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400 flex-shrink-0">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 10h8M8 14h5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={e => { setCpf(formatarCPF(e.target.value)); setErro(''); }}
                onBlur={() => { if (cpf.replace(/\D/g, '').length === 11) { const el = document.getElementById('pin-input'); el?.focus(); } }}
                placeholder="CPF (000.000.000-00)"
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Campo PIN */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/15 transition-all bg-gray-50/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400 flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
              </svg>
              <input
                id="pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setPin(v); setErro(''); }}
                placeholder="PIN de 4 dígitos"
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none tracking-[0.4em] font-bold"
              />
              <button type="button" onClick={() => setShowPin(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Manter conectado + indicador PIN */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setManter(m => !m)}
                  className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0
                    ${manter ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}
                >
                  {manter && <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                </div>
                <span className="text-xs font-medium text-gray-600">Manter conectado</span>
              </label>
              <div className="flex gap-1">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < pin.length ? 'bg-green-600' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold">
                {erro}
              </div>
            )}

            {/* Botão principal */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-60
                text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-green-600/30
                flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
            >
              {carregando
                ? <><Loader2 size={18} className="animate-spin" /> Entrando...</>
                : 'Entrar na conta'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">Ou. Acesse com</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Botões rápidos (A, B, C) */}
            <div className="flex items-center justify-center gap-4">
              {[
                { href: '/produtos',  bg: 'bg-green-500',   icon: <ShoppingBag size={20} className="text-white" />,  title: 'Produtos' },
                { href: '/carrinho',  bg: 'bg-emerald-500', icon: <Tag size={20} className="text-white" />,          title: 'Carrinho' },
                { href: '/cadastro',  bg: 'bg-teal-500',    icon: <UserPlus size={20} className="text-white" />,     title: 'Cadastro' },
              ].map(({ href, bg, icon, title }) => (
                <Link key={href} href={href} title={title}
                  className={`w-13 h-13 w-12 h-12 rounded-full ${bg} flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200`}>
                  {icon}
                </Link>
              ))}
            </div>

          </form>
        </div>
      </div>

      {/* ─── Rodapé (fora do card, no gradiente) ─────────────────────────── */}
      <div className="py-8 text-center">
        <p className="text-green-300 text-sm">Não tem uma conta?</p>
        <Link href="/cadastro" className="text-white font-black text-base hover:underline underline-offset-2 tracking-wide">
          Criar Conta
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-green-800">
        <Loader2 className="animate-spin text-white" size={36} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
