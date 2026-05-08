'use client';

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { ProdutoPublicoDTO } from '@/src/lib/dto';
import { formatarMoeda } from '@/src/utils/formatadores';

interface Props {
  produtos: ProdutoPublicoDTO[];
  vazio?: string;
}

export default function SecaoPreviaProdutos({ produtos, vazio = 'Nenhum produto.' }: Props) {
  if (produtos.length === 0) {
    return <p className="text-sm text-gray-400 italic py-2">{vazio}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
      {produtos.map((p) => (
        <div key={p.id} className="border border-gray-100 rounded-xl p-2 bg-white text-center">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
            {p.imagem ? (
              <Image src={p.imagem} alt={p.nome} fill sizes="120px" className="object-contain p-1" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageOff size={20} className="text-gray-300" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-700 font-medium line-clamp-2 leading-tight">{p.nome}</p>
          <p className="text-[11px] text-green-600 font-bold mt-0.5">{formatarMoeda(p.preco)}</p>
        </div>
      ))}
    </div>
  );
}
