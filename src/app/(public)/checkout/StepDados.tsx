'use client';

import { useState } from 'react';
import { DadosComprador } from '@/src/models/checkout.model';
import { validarCPF, formatarCPF, formatarTelefone } from '@/src/utils/validators';

interface Props {
  inicial: DadosComprador | null;
  onNext: (dados: DadosComprador) => void;
}

export default function StepDados({ inicial, onNext }: Props) {
  const [form, setForm] = useState<DadosComprador>(inicial ?? {
    nome: '', email: '', cpf: '', telefone: '',
  });
  const [erros, setErros] = useState<Partial<DadosComprador>>({});

  const validar = (): boolean => {
    const e: Partial<DadosComprador> = {};
    if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome completo obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) e.cpf = 'CPF inválido';
    const telLimpo = form.telefone.replace(/\D/g, '');
    if (telLimpo.length < 10) e.telefone = 'Telefone inválido';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    onNext({
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      cpf: form.cpf.replace(/\D/g, ''),
      telefone: form.telefone.replace(/\D/g, ''),
    });
  };

  const campo = (label: string, key: keyof DadosComprador, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => {
          let v = e.target.value;
          if (key === 'cpf') v = formatarCPF(v);
          if (key === 'telefone') v = formatarTelefone(v);
          setForm(f => ({ ...f, [key]: v }));
          if (erros[key]) setErros(e2 => ({ ...e2, [key]: undefined }));
        }}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
          ${erros[key] ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
      />
      {erros[key] && <p className="text-xs text-red-500 mt-1">{erros[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900">Seus dados</h2>
      {campo('Nome completo', 'nome', 'text', 'João da Silva')}
      {campo('E-mail', 'email', 'email', 'joao@email.com')}
      {campo('CPF', 'cpf', 'text', '000.000.000-00')}
      {campo('Telefone / WhatsApp', 'telefone', 'tel', '(11) 99999-9999')}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        Continuar para Entrega →
      </button>
    </form>
  );
}
