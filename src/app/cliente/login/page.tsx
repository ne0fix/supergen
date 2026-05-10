'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ShieldCheck, Package, Star, ArrowRight } from 'lucide-react';
import { PinInput } from '@/src/components/ui/PinInput';
import { formatarCPF } from '@/src/utils/validators';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/cliente';
  const redirect = decodeURIComponent(redirectParam);
  const sucesso = searchParams.get('sucesso') === '1';

  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (cpf.replace(/\D/g, '').length === 11) {
      setTimeout(() => {
        const pinInput = document.querySelector('input[type="password"]');
        (pinInput as HTMLInputElement)?.focus();
      }, 80);
    }
  }, [cpf]);

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
    <div className="min-h-screen flex">

      {/* ─── Painel esquerdo — brand ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 flex-col relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/">
            <Image src="/gn2.png" alt="Ekomart" width={160} height={64} className="h-12 w-auto brightness-200" />
          </Link>

          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
                Compras com mais<br />
                <span className="text-green-300">facilidade</span>
              </h1>
              <p className="text-green-200 text-lg leading-relaxed">
                Acesse sua conta e aproveite todos os benefícios de comprar no Ekomart.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: Package, text: 'Histórico completo de pedidos' },
                { icon: ShieldCheck, text: 'Seus dados e endereços salvos' },
                { icon: Star, text: 'Checkout mais rápido nas próximas compras' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-green-300" />
                  </div>
                  <p className="text-green-100 font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-green-400 text-sm">© 2026 Ekomart — Todos os direitos reservados</p>
        </div>
      </div>

      {/* ─── Painel direito — formulário ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50">

        {/* Mobile header */}
        <div className="lg:hidden bg-green-800 px-6 py-5 flex items-center gap-3">
          <Link href="/">
            <Image src="/gn2.png" alt="Ekomart" width={120} height={48} className="h-9 w-auto brightness-200" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px] space-y-8">

            {/* Cabeçalho */}
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500">Entre com seu CPF e PIN para continuar</p>
            </div>

            {/* Toast de cadastro */}
            {sucesso && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Conta criada com sucesso!</p>
                  <p className="text-xs text-emerald-600">Agora faça seu primeiro login.</p>
                </div>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">CPF</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={cpf}
                  onChange={e => { setCpf(formatarCPF(e.target.value)); setErro(''); }}
                  placeholder="000.000.000-00"
                  autoComplete="off"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20
                    focus:border-green-500 transition-all duration-200 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">PIN de 4 dígitos</label>
                <PinInput value={pin} onChange={v => { setPin(v); setErro(''); }} />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-60
                  text-white font-bold py-4 rounded-xl transition-all duration-200
                  flex items-center justify-center gap-2 text-sm tracking-wide shadow-sm shadow-green-600/25"
              >
                {carregando
                  ? <><Loader2 size={18} className="animate-spin" /> Entrando...</>
                  : <> Entrar na minha conta <ArrowRight size={18} /></>}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Link de cadastro */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Ainda não tem conta?</p>
                <p className="text-xs text-gray-500 mt-0.5">Cadastre-se em menos de 2 minutos</p>
              </div>
              <Link
                href="/cadastro"
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2.5
                  rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                Criar conta <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={36} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
