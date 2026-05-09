'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminTableSkeleton } from '@/src/components/ui/Skeleton';
import { ColumnDef } from '@/src/components/admin/ui/DataTable';
import DataTable from '@/src/components/admin/ui/DataTable';
import Badge from '@/src/components/admin/ui/Badge';
import { formatarMoeda } from '@/src/utils/formatadores';

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  PENDING_PAYMENT: { label: 'Aguardando', variant: 'warning' },
  PROCESSING:      { label: 'Processando', variant: 'info' },
  PAID:            { label: 'Pago',        variant: 'success' },
  FAILED:          { label: 'Falhou',      variant: 'danger' },
  CANCELLED:       { label: 'Cancelado',   variant: 'default' },
};

function PageFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    p.set('page', '1');
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get('status') || ''}
        onChange={(e) => set('status', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
      >
        <option value="">Todos os status</option>
        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}

function PedidosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(searchParams.toString());
      if (!q.get('page')) q.set('page', '1');
      const res = await fetch(`/api/admin/pedidos?${q.toString()}`);
      const json = await res.json();
      setPedidos(json.pedidos ?? []);
      setPagination({ page: json.page, totalPages: json.pages, total: json.total });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { carregar(); }, [carregar]);

  const setPage = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(page));
    router.push(`${pathname}?${p.toString()}`);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Pedido',
      accessor: 'id',
      cell: (id) => <span className="font-mono text-xs text-gray-500">#{(id as string).slice(-8).toUpperCase()}</span>,
    },
    {
      header: 'Data',
      accessor: 'criadoEm',
      cell: (val) => <span className="text-xs">{new Date(val as string).toLocaleString('pt-BR')}</span>,
    },
    {
      header: 'Comprador',
      accessor: 'compradorNome',
      cell: (val, row) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{val as string}</p>
          <p className="text-xs text-gray-400">{row.compradorEmail}</p>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (val) => <span className="font-bold text-gray-900">{formatarMoeda(val as number)}</span>,
    },
    {
      header: 'Método',
      accessor: 'metodoPagamento',
      cell: (val) => <span className="text-xs font-medium text-gray-500">{val as string}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (val) => {
        const config = STATUS_CONFIG[val as string] || { label: val, variant: 'default' };
        return <Badge label={config.label} variant={config.variant} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} pedido(s) encontrado(s)</p>
        </div>
      </div>

      <PageFilters />

      {loading ? (
        <AdminTableSkeleton rows={10} cols={6} />
      ) : (
        <DataTable columns={columns} data={pedidos} loading={false} pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

export default function AdminPedidosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="animate-spin text-green-600" size={28} /></div>}>
      <PedidosContent />
    </Suspense>
  );
}
