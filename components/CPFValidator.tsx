import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface CPFData {
  id?: string;
  customer_id: string;
  cpf: string;
  full_name: string;
  credits_balance: number;
  total_credits_earned: number;
  total_credits_used: number;
  is_verified: boolean;
}

interface Props {
  customerId: string;
  onCPFVerified?: (cpfData: CPFData) => void;
}

export default function CPFValidator({ customerId, onCPFVerified }: Props) {
  const [cpfData, setCpfData] = useState<CPFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    full_name: ''
  });
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    loadCPFData();
  }, [customerId]);

  const loadCPFData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_cpf_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCpfData(data);
        setFormData({
          cpf: data.cpf,
          full_name: data.full_name
        });
      } else {
        setEditing(true); // Se não tem CPF, entra em modo de edição
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados de CPF:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    setCpfError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cpfNumbers = formData.cpf.replace(/[^\d]/g, '');
    
    if (!validateCPF(cpfNumbers)) {
      setCpfError('CPF invalido');
      return;
    }

    setSaving(true);

    try {
      const dataToSave = {
        customer_id: customerId,
        cpf: cpfNumbers,
        full_name: formData.full_name,
        is_verified: true,
        verified_at: new Date().toISOString()
      };

      if (cpfData?.id) {
        // Atualizar
        const { error } = await supabase
          .from('customer_cpf_data')
          .update(dataToSave)
          .eq('id', cpfData.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from('customer_cpf_data')
          .insert([dataToSave]);

        if (error) throw error;
      }

      alert('CPF verificado com sucesso!');
      setEditing(false);
      await loadCPFData();
      
      if (onCPFVerified) {
        const updatedData = await supabase
          .from('customer_cpf_data')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle();
        
        if (updatedData.data) {
          onCPFVerified(updatedData.data);
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar CPF:', error);
      if (error.message.includes('duplicate')) {
        alert('Este CPF ja esta cadastrado');
      } else {
        alert('Erro ao salvar CPF: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const isViewing = cpfData && !editing;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sistema de CPF e Creditos</h2>
        {isViewing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      {isViewing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Nome Completo</p>
              <p className="font-semibold text-lg">{cpfData.full_name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-semibold text-lg">{formatCPF(cpfData.cpf)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
              <p className="text-sm opacity-90">Saldo de Creditos</p>
              <p className="font-bold text-3xl">R$ {parseFloat(cpfData.credits_balance.toString()).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
              <p className="text-sm opacity-90">Total Acumulado</p>
              <p className="font-bold text-3xl">R$ {parseFloat(cpfData.total_credits_earned.toString()).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white">
              <p className="text-sm opacity-90">Total Utilizado</p>
              <p className="font-bold text-3xl">R$ {parseFloat(cpfData.total_credits_used.toString()).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
              {cpfData.is_verified && (
                <div className="text-center">
                  <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-green-600">CPF Verificado</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Como funcionam os creditos:</h3>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
              <li>Voce recebe 3% de credito em cada compra</li>
              <li>Os creditos sao adicionados automaticamente ao seu saldo</li>
              <li>Use seus creditos em compras futuras</li>
              <li>Os creditos nao expiram</li>
            </ul>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!cpfData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Para participar do programa de creditos, precisamos verificar seu CPF. 
                Voce ganhara 3% de credito em cada compra!
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <input
              type="text"
              required
              value={formData.cpf}
              onChange={(e) => handleCPFChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                cpfError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {cpfError && (
              <p className="mt-1 text-sm text-red-600">{cpfError}</p>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Politica de Privacidade:</h3>
            <p className="text-xs text-gray-600">
              Seu CPF sera usado exclusivamente para o programa de creditos e fidelidade. 
              Seus dados estao protegidos conforme a LGPD.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Verificando...' : 'Verificar CPF'}
            </button>
            {editing && cpfData && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    cpf: cpfData.cpf,
                    full_name: cpfData.full_name
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
