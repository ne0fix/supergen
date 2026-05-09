'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, X, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
}

const MAX_SIZE = 4.5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

async function uploadWithRetry(file: File, attempts = 3): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (res.status === 503 && i < attempts - 1) {
        // Timeout transiente — aguarda e tenta novamente
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        continue;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Falha no upload.');
      }

      const blob = await res.json();
      return blob.url as string;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error('Falha após múltiplas tentativas.');
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError('Formato inválido. Use PNG, JPG, WEBP ou GIF.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Arquivo muito grande. Máximo 4.5 MB.');
      return;
    }

    setUploading(true);
    setProgress(30);

    try {
      const fakeProgress = setInterval(() => setProgress(p => Math.min(p + 10, 85)), 400);
      const url = await uploadWithRetry(file);
      clearInterval(fakeProgress);
      setProgress(100);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload. Tente novamente.');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={`border-2 border-dashed rounded-xl transition-colors ${
          uploading ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {value ? (
          <div className="relative p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              <Image src={value} alt="Preview" fill className="object-contain p-1" sizes="80px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">Imagem carregada</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{value.split('/').pop()}</p>
              <button
                type="button"
                onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = ''; }}
                className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
              >
                <X size={12} /> Remover
              </button>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 cursor-pointer bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              <RefreshCw size={13} /> Trocar
              <input ref={inputRef} type="file" className="sr-only" onChange={handleChange} accept="image/*" disabled={uploading} />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                <p className="text-sm text-green-600 font-medium">Enviando imagem...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Arraste ou clique para enviar</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF — máx. 4.5 MB</p>
              </>
            )}
            <input ref={inputRef} type="file" className="sr-only" onChange={handleChange} accept="image/*" disabled={uploading} />
          </label>
        )}
      </div>

      {/* Barra de progresso */}
      {uploading && progress > 0 && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Erro com botão de retry */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 flex-shrink-0"
          >
            <RefreshCw size={12} /> Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
