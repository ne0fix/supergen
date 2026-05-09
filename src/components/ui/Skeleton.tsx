import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-100', className)} />
  );
}

/* ── Card de produto ── */
export function ProdutoCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden min-h-[340px]">
      <div className="w-full px-3 pt-3">
        <Skeleton className="w-full aspect-square rounded-xl" />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-3 w-3 rounded-full" />)}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Grid de produtos ── */
export function ProdutosGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProdutoCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Detalhe do produto ── */
export function ProdutoDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 max-w-7xl py-5 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-10">
        {/* Imagem */}
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full aspect-square rounded-2xl" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-4 rounded-full" />)}
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl hidden md:block" />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <Skeleton className="h-5 w-48" />
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 last:border-0">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <Skeleton className="h-5 w-32 mb-4" />
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tabela admin genérica ── */
export function AdminTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      {/* Filtros */}
      <div className="px-6 py-3 border-b border-gray-50 flex gap-3">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <Skeleton key={j} className={`h-4 rounded ${j === 0 ? 'flex-1' : 'w-20'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Formulário de produto ── */
export function ProdutoFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
            <div className="sm:col-span-2 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full rounded-lg" /></div>
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
