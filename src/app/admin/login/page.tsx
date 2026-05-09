'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { LoginSchema, LoginFormData } from '@/src/utils/validators';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Credenciais inválidas.');
      }
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <Image src="/gn2.png" alt="Ekomart" width={160} height={76} style={{ height: 'auto' }} className="drop-shadow-lg" />
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed">
            "Gerencie seu supermercado com facilidade, controle e agilidade."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
              GN
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Painel Administrativo</p>
              <p className="text-green-300 text-xs">Super G & N · Pacatuba, CE</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-green-300 text-xs">
          <ShieldCheck size={14} />
          <span>Acesso restrito a administradores autorizados</span>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/gn2.png" alt="Ekomart" width={140} height={67} style={{ height: 'auto' }} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo</h1>
            <p className="text-gray-500 mt-1">Entre com suas credenciais de administrador</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="admin@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register('senha')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.senha.message}
                </p>
              )}
            </div>

            {/* Erro geral */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-green-600/25 hover:shadow-green-600/40 hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Entrando...</>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} Super G & N · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
