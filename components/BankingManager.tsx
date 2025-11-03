import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BankingData {
  id?: string;
  bank_name: string;
  bank_code: string;
  agency: string;
  account_number: string;
  account_type: 'CORRENTE' | 'POUPANCA';
  pix_key_type: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'CHAVE_ALEATORIA';
  pix_key: string;
  cpf_cnpj?: string;
  cpf?: string;
  account_holder_name: string;
  is_active: boolean;
}

interface Props {
  userType: 'BAKERY' | 'DELIVERY';
  userId: string;
}

export default function BankingManager({ userType, userId }: Props) {
  const [bankingData, setBankingData] = useState<BankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<BankingData>({
    bank_name: '',
    bank_code: '',
    agency: '',
    account_number: '',
    account_type: 'CORRENTE',
    pix_key_type: 'CPF',
    pix_key: '',
    cpf_cnpj: '',
    cpf: '',
    account_holder_name: '',
    is_active: true
  });

  const tableName = userType === 'BAKERY' ? 'bakery_banking_data' : 'delivery_banking_data';
  const idField = userType === 'BAKERY' ? 'bakery_id' : 'delivery_id';

  useEffect(() => {
    loadBankingData();
  }, [userId]);

  const loadBankingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idField, userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBankingData(data);
        setFormData(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados bancarios:', error);
      alert('Erro ao carregar dados bancarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave: any = {
        ...formData,
        [idField]: userId
      };

      if (bankingData?.id) {
        // Atualizar
        const { error } = await supabase
          .from(tableName)
          .update(dataToSave)
          .eq('id', bankingData.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from(tableName)
          .insert([dataToSave]);

        if (error) throw error;
      }

      alert('Dados bancarios salvos com sucesso!');
      setEditing(false);
      await loadBankingData();
    } catch (error: any) {
      console.error('Erro ao salvar dados bancarios:', error);
      alert('Erro ao salvar dados bancarios: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BankingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const isViewing = bankingData && !editing;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {userType === 'BAKERY' ? 'Dados Bancarios da Padaria' : 'Dados Bancarios do Entregador'}
        </h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Nome do Titular</p>
            <p className="font-semibold">{bankingData.account_holder_name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Banco</p>
            <p className="font-semibold">{bankingData.bank_name} ({bankingData.bank_code})</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Agencia</p>
            <p className="font-semibold">{bankingData.agency}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Conta</p>
            <p className="font-semibold">{bankingData.account_number} ({bankingData.account_type})</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Tipo de Chave PIX</p>
            <p className="font-semibold">{bankingData.pix_key_type}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Chave PIX</p>
            <p className="font-semibold">{bankingData.pix_key}</p>
          </div>
          {bankingData.cpf_cnpj && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">CPF/CNPJ</p>
              <p className="font-semibold">{bankingData.cpf_cnpj}</p>
            </div>
          )}
          {bankingData.cpf && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-semibold">{bankingData.cpf}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Titular *
              </label>
              <input
                type="text"
                required
                value={formData.account_holder_name}
                onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Banco *
              </label>
              <input
                type="text"
                required
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codigo do Banco *
              </label>
              <input
                type="text"
                required
                value={formData.bank_code}
                onChange={(e) => handleInputChange('bank_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agencia *
              </label>
              <input
                type="text"
                required
                value={formData.agency}
                onChange={(e) => handleInputChange('agency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 1234-5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero da Conta *
              </label>
              <input
                type="text"
                required
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 12345-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Conta *
              </label>
              <select
                required
                value={formData.account_type}
                onChange={(e) => handleInputChange('account_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="CORRENTE">Corrente</option>
                <option value="POUPANCA">Poupanca</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Chave PIX *
              </label>
              <select
                required
                value={formData.pix_key_type}
                onChange={(e) => handleInputChange('pix_key_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">Email</option>
                <option value="TELEFONE">Telefone</option>
                <option value="CHAVE_ALEATORIA">Chave Aleatoria</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave PIX *
              </label>
              <input
                type="text"
                required
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Digite a chave PIX"
              />
            </div>

            {userType === 'BAKERY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF/CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>
            )}

            {userType === 'DELIVERY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Digite o CPF"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Salvando...' : 'Salvar Dados Bancarios'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(bankingData || formData);
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
