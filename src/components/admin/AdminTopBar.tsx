'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/src/viewmodels/admin.vm';
import { ChevronRight, LogOut } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard:   'Dashboard',
  produtos:    'Produtos',
  categorias:  'Categorias',
  secoes:      'Seções da Home',
  novo:        'Novo Produto',
};

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading } = useAdmin();

  const parts = pathname.split('/').filter((p) => p && p !== 'admin');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const initials = admin?.nome
    ? admin.nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between bg-white border-b border-gray-100 px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors font-medium">
          Início
        </Link>
        {parts.map((part, i) => {
          const href = `/admin/${parts.slice(0, i + 1).join('/')}`;
          const label = routeLabels[part] ?? part;
          const isLast = i === parts.length - 1;
          return (
            <span key={href} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-gray-300" />
              {isLast ? (
                <span className="font-semibold text-gray-800">{label}</span>
              ) : (
                <Link href={href} className="text-gray-400 hover:text-gray-700 transition-colors">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Direita */}
      <div className="flex items-center gap-3">
        {/* Divisor */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Admin info */}
        {loading ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">{admin?.nome ?? 'Admin'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{admin?.email ?? ''}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sair"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
