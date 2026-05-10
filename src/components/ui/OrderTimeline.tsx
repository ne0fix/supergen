export function OrderTimeline({ statusAtual, entregaTipo }: { statusAtual: string; entregaTipo?: string }) {
  // A lógica tem exatamente 4 etapas.
  const labels = [
    'Pedido Realizado',
    'Pagamento Confirmado',
    'Em Separação',
    entregaTipo === 'RETIRADA' ? 'Disponível' : 'Saiu para Entrega'
  ];

  // Mapeia o status do banco para um índice numérico
  const getIdx = (status: string) => {
    switch (status) {
      case 'PEDIDO_REALIZADO':
      case 'PAGAMENTO_PROCESSANDO':
        return 0;
      case 'APROVADO':
        return 1;
      case 'EM_SEPARACAO':
        return 2;
      case 'LIBERADO':
        return 3;
      default:
        return 0; // fallback
    }
  };

  const currentIdx = getIdx(statusAtual);

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 pb-14">
      {labels.map((label, i) => {
        const concluido = i <= currentIdx;
        const atual = i === currentIdx;
        return (
          <div key={label} className="flex flex-col items-center relative">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 bg-white
                ${concluido ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'}
                ${atual ? 'ring-2 ring-green-600 ring-offset-2' : ''}`}>
                {concluido ? '✓' : i + 1}
              </div>
              {i < labels.length - 1 && (
                <div className={`h-1 w-16 sm:w-24 -ml-1 ${i < currentIdx ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
            <span className={`text-[10px] sm:text-xs mt-2 text-center absolute top-10 w-24 ${atual || concluido ? 'font-bold text-gray-900' : 'text-gray-400 font-medium'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
