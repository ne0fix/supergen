'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { ChevronDown, ChevronUp, Trash2, X, Search, Plus, Save } from 'lucide-react';
import Toggle from './ui/Toggle';
import SecaoPreviaProdutos from './SecaoPreviaProdutos';
import DragList from './ui/DragList';
import { SecaoAdminDTO, ProdutoPublicoDTO } from '@/src/lib/dto';

interface CategoriaOpcao {
  id: string;
  nome: string;
}

interface TagOpcao {
  id: string;
  label: string;
}

interface ItemLista {
  id: string;
  produtoId: string;
  ordem: number;
  produto: ProdutoPublicoDTO;
}

interface Props {
  secao: SecaoAdminDTO;
  categorias: CategoriaOpcao[];
  tags: TagOpcao[];
  onDeleted: (id: string) => void;
  onSaved: (secao: SecaoAdminDTO) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function SecaoCard({
  secao,
  categorias,
  tags,
  onDeleted,
  onSaved,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ativo, setAtivo] = useState(secao.ativo);
  const [dados, setDados] = useState({
    titulo: secao.titulo,
    subtitulo: secao.subtitulo ?? '',
    maxItens: secao.maxItens,
    modoSelecao: secao.modoSelecao,
    filtroCategoriaId: secao.filtroCategoriaId ?? '',
    filtroTag: secao.filtroTag ?? '',
  });
  const [itens, setItens] = useState<ItemLista[]>(
    secao.itens.map((it) => ({ id: it.produtoId, ...it })),
  );
  const [previa, setPrevia] = useState<ProdutoPublicoDTO[]>(secao.produtosPrevia);
  const [busca, setBusca] = useState('');
  const [buscaDebounced] = useDebounce(busca, 400);
  const [resultados, setResultados] = useState<ProdutoPublicoDTO[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const buscarProdutos = useCallback(async (q: string) => {
    if (!q.trim()) { setResultados([]); return; }
    setBuscando(true);
    try {
      const res = await fetch(`/api/admin/produtos?q=${encodeURIComponent(q)}&limit=6`);
      const json = await res.json();
      setResultados(json.data ?? []);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => { buscarProdutos(buscaDebounced); }, [buscaDebounced, buscarProdutos]);

  async function toggleAtivo() {
    const res = await fetch(`/api/admin/secoes/${secao.id}/toggle`, { method: 'PATCH' });
    if (res.ok) setAtivo((v) => !v);
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro('');
    try {
      const body = {
        titulo: dados.titulo,
        subtitulo: dados.subtitulo || null,
        maxItens: dados.maxItens,
        modoSelecao: dados.modoSelecao,
        filtroCategoriaId: dados.filtroCategoriaId || null,
        filtroTag: dados.filtroTag || null,
      };
      const res = await fetch(`/api/admin/secoes/${secao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setErro('Falha ao salvar.'); return; }
      const atualizado: SecaoAdminDTO = await res.json();
      setPrevia(atualizado.produtosPrevia);
      onSaved(atualizado);
    } finally {
      setSalvando(false);
    }
  }

  async function handleAdicionarProduto(produto: ProdutoPublicoDTO) {
    const res = await fetch(`/api/admin/secoes/${secao.id}/itens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produtoId: produto.id }),
    });
    if (!res.ok) return;
    const novoItem: ItemLista = {
      id: produto.id,
      produtoId: produto.id,
      ordem: itens.length,
      produto,
    };
    const novosItens = [...itens, novoItem];
    setItens(novosItens);
    setPrevia(novosItens.map((i) => i.produto).slice(0, dados.maxItens));
    setBusca('');
    setResultados([]);
  }

  async function handleRemoverProduto(produtoId: string) {
    await fetch(`/api/admin/secoes/${secao.id}/itens?produtoId=${produtoId}`, { method: 'DELETE' });
    const novosItens = itens.filter((i) => i.produtoId !== produtoId);
    setItens(novosItens);
    setPrevia(novosItens.map((i) => i.produto).slice(0, dados.maxItens));
  }

  async function reordenarItens(novosItens: ItemLista[]) {
    const payload = novosItens.map((it, idx) => ({ produtoId: it.produtoId, ordem: idx }));
    await fetch(`/api/admin/secoes/${secao.id}/ordem`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setItens(novosItens.map((it, idx) => ({ ...it, ordem: idx })));
  }

  function moverItem(index: number, direction: 'up' | 'down') {
    const nova = [...itens];
    const troca = direction === 'up' ? index - 1 : index + 1;
    [nova[index], nova[troca]] = [nova[troca], nova[index]];
    reordenarItens(nova);
  }

  async function handleExcluir() {
    if (!confirm('Excluir esta seção permanentemente?')) return;
    await fetch(`/api/admin/secoes/${secao.id}`, { method: 'DELETE' });
    onDeleted(secao.id);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
            <ChevronUp size={16} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{secao.titulo}</p>
          <p className="text-xs text-gray-400 truncate">{secao.slug} · {secao.produtosPrevia.length} produto(s)</p>
        </div>

        <Toggle checked={ativo} onChange={toggleAtivo} label="Ativo" />

        <button
          onClick={() => setAberto((v) => !v)}
          className="text-gray-400 hover:text-gray-700 ml-2"
          aria-label={aberto ? 'Recolher' : 'Expandir'}
        >
          {aberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Body */}
      {aberto && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          {/* Campos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Título</label>
              <input
                value={dados.titulo}
                onChange={(e) => setDados((d) => ({ ...d, titulo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subtítulo</label>
              <input
                value={dados.subtitulo}
                onChange={(e) => setDados((d) => ({ ...d, subtitulo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Máx. cards</label>
              <input
                type="number"
                min={1}
                max={20}
                value={dados.maxItens}
                onChange={(e) => setDados((d) => ({ ...d, maxItens: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Modo</label>
              <select
                value={dados.modoSelecao}
                onChange={(e) =>
                  setDados((d) => ({ ...d, modoSelecao: e.target.value as 'AUTOMATICO' | 'MANUAL' }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
              >
                <option value="AUTOMATICO">Automático (filtros)</option>
                <option value="MANUAL">Manual (selecionar produtos)</option>
              </select>
            </div>
          </div>

          {/* Filtros — modo AUTOMATICO */}
          {dados.modoSelecao === 'AUTOMATICO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Filtrar por categoria</label>
                <select
                  value={dados.filtroCategoriaId}
                  onChange={(e) => setDados((d) => ({ ...d, filtroCategoriaId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white"
                >
                  <option value="">— Todas —</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Filtrar por tag</label>
                <select
                  value={dados.filtroTag}
                  onChange={(e) => setDados((d) => ({ ...d, filtroTag: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white"
                >
                  <option value="">— Todas —</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Lista de itens — modo MANUAL */}
          {dados.modoSelecao === 'MANUAL' && (
            <div className="p-4 bg-green-50 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-gray-600">Produtos selecionados</p>
              {itens.length > 0 ? (
                <DragList
                  items={itens}
                  onMoveUp={(i) => moverItem(i, 'up')}
                  onMoveDown={(i) => moverItem(i, 'down')}
                  renderItem={(item) => (
                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm">
                      <span className="truncate text-gray-800">{item.produto.nome}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoverProduto(item.produtoId)}
                        className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                />
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum produto selecionado.</p>
              )}

              {/* Busca de produtos */}
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar produto para adicionar..."
                    className="flex-1 text-sm outline-none"
                  />
                  {buscando && <span className="text-xs text-gray-400">buscando...</span>}
                </div>
                {resultados.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {resultados.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => handleAdicionarProduto(p)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center gap-2"
                        >
                          <Plus size={12} className="text-green-600 flex-shrink-0" />
                          <span className="truncate">{p.nome}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Prévia */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Prévia ({previa.length} produto{previa.length !== 1 ? 's' : ''})
            </p>
            <SecaoPreviaProdutos
              produtos={previa}
              vazio="Nenhum produto encontrado com os filtros atuais."
            />
          </div>

          {/* Rodapé */}
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleExcluir}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} /> Excluir seção
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
            >
              <Save size={14} />
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
