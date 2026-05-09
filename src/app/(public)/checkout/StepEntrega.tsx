'use client';

import { useState } from 'react';
import { DadosEntrega, FreteResponse } from '@/src/models/checkout.model';
import { formatarMoeda } from '@/src/utils/formatadores';
import { MapPin, Store, Loader2 } from 'lucide-react';

interface Props {
  subtotal: number;
  inicial: DadosEntrega | null;
  onBack: () => void;
  onNext: (dados: DadosEntrega, frete: number) => void;
}

export default function StepEntrega({ subtotal, inicial, onBack, onNext }: Props) {
  const [tipo, setTipo] = useState<'ENTREGA' | 'RETIRADA'>(inicial?.tipo ?? 'ENTREGA');
  const [cep, setCep] = useState(inicial?.cep ?? '');
  const [endereco, setEndereco] = useState<FreteResponse | null>(null);
  const [numero, setNumero] = useState(inicial?.numero ?? '');
  const [complemento, setComplemento] = useState(inicial?.complemento ?? '');
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState('');

  const buscarCep = async (valor: string) => {
    const limpo = valor.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    setBuscando(true);
    setErroCep('');
    try {
      const res = await fetch(`/api/frete/calcular?cep=${limpo}&subtotal=${subtotal}`);
      if (!res.ok) throw new Error('CEP não encontrado');
      const data: FreteResponse = await res.json();
      setEndereco(data);
    } catch {
      setErroCep('CEP não encontrado. Verifique e tente novamente.');
      setEndereco(null);
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipo === 'ENTREGA') {
      if (!endereco) { setErroCep('Consulte o CEP primeiro'); return; }
      if (!numero.trim()) return;
      onNext({
        tipo: 'ENTREGA',
        cep: cep.replace(/\D/g, ''),
        logradouro: endereco.logradouro,
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
      }, endereco.frete);
    } else {
      onNext({ tipo: 'RETIRADA' }, 0);
    }
  };

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? d.replace(/(\d{5})(\d)/, '$1-$2') : d;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900">Entrega</h2>

      {/* Tipo */}
      <div className="grid grid-cols-2 gap-3">
        {(['ENTREGA', 'RETIRADA'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors
              ${tipo === t ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            {t === 'ENTREGA' ? <MapPin size={20} className={tipo === t ? 'text-green-600' : 'text-gray-400'} />
              : <Store size={20} className={tipo === t ? 'text-green-600' : 'text-gray-400'} />}
            <span className={`text-sm font-bold ${tipo === t ? 'text-green-700' : 'text-gray-600'}`}>
              {t === 'ENTREGA' ? 'Receber em casa' : 'Retirar na loja'}
            </span>
            {t === 'RETIRADA' && <span className="text-xs text-green-600 font-bold">Grátis</span>}
          </button>
        ))}
      </div>

      {tipo === 'ENTREGA' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
            <div className="flex gap-2">
              <input
                value={cep}
                onChange={e => {
                  const v = formatCep(e.target.value);
                  setCep(v);
                  setEndereco(null);
                  if (v.replace(/\D/g,'').length === 8) buscarCep(v);
                }}
                placeholder="00000-000"
                className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                  ${erroCep ? 'border-red-400' : 'border-gray-300 focus:border-green-500'}`}
              />
              {buscando && <Loader2 size={20} className="self-center animate-spin text-green-600" />}
            </div>
            {erroCep && <p className="text-xs text-red-500 mt-1">{erroCep}</p>}
          </div>

          {endereco && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
                <p className="font-bold">{endereco.logradouro}</p>
                <p>{endereco.bairro} — {endereco.cidade}/{endereco.uf}</p>
                <p className="font-bold text-green-600 mt-2">
                  Frete: {endereco.freteGratis ? 'Grátis' : formatarMoeda(endereco.frete)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Número *</label>
                  <input
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                    required
                    placeholder="123"
                    className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Complemento</label>
                  <input
                    value={complemento}
                    onChange={e => setComplemento(e.target.value)}
                    placeholder="Apto, bloco..."
                    className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tipo === 'RETIRADA' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-bold text-green-800">📍 {process.env.NEXT_PUBLIC_LOJA_ENDERECO}</p>
          <p className="text-green-700 mt-1">🕐 {process.env.NEXT_PUBLIC_LOJA_HORARIO}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          Continuar para Pagamento →
        </button>
      </div>
    </form>
  );
}
