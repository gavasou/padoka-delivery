import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IconTicket, IconGift, IconUser, IconPlus, IconCheck, IconX, IconClock, IconTrendingUp } from './StatIcons';

interface Coupon {
  id: string;
  name: string;
  code: string;
  type: 'fixed_value' | 'percentage' | 'influencer_credit';
  value: number;
  min_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  target_cpf: string | null;
  created_at: string;
}

interface Influencer {
  id: string;
  influencer_cpf: string;
  influencer_name: string;
  total_credits: number;
  used_credits: number;
  available_credits: number;
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  customer_cpf: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

export default function CouponManager() {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'influencers' | 'history'>('create');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [usageHistory, setUsageHistory] = useState<CouponUsage[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'fixed_value' as 'fixed_value' | 'percentage' | 'influencer_credit',
    value: '',
    minAmount: '',
    maxUses: '',
    validUntil: '',
    targetCpf: ''
  });

  const [influencerForm, setInfluencerForm] = useState({
    cpf: '',
    name: '',
    credits: ''
  });

  useEffect(() => {
    if (activeTab === 'list') {
      loadCoupons();
    } else if (activeTab === 'influencers') {
      loadInfluencers();
    } else if (activeTab === 'history') {
      loadUsageHistory();
    }
  }, [activeTab]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coupon-manager', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setCoupons(data.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cupons:', error);
      alert('Erro ao carregar cupons: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInfluencers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('influencer-credit-manager', {
        body: { action: 'list_influencers' }
      });

      if (error) throw error;
      setInfluencers(data.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar influencers:', error);
      alert('Erro ao carregar influencers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coupon-manager', {
        body: { action: 'usage_history', limit: 50 }
      });

      if (error) throw error;
      setUsageHistory(data.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar historico:', error);
      alert('Erro ao carregar historico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('coupon-manager', {
        body: {
          action: 'create',
          name: formData.name,
          code: formData.code,
          type: formData.type,
          value: parseFloat(formData.value),
          minAmount: formData.minAmount ? parseFloat(formData.minAmount) : 0,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          validUntil: formData.validUntil,
          targetCpf: formData.targetCpf || null
        }
      });

      if (error) throw error;

      alert('Cupom criado com sucesso!');
      setFormData({
        name: '',
        code: '',
        type: 'fixed_value',
        value: '',
        minAmount: '',
        maxUses: '',
        validUntil: '',
        targetCpf: ''
      });
      setActiveTab('list');
    } catch (error: any) {
      console.error('Erro ao criar cupom:', error);
      alert('Erro ao criar cupom: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInfluencerCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('influencer-credit-manager', {
        body: {
          action: 'add_credits',
          influencerCpf: influencerForm.cpf,
          influencerName: influencerForm.name,
          credits: parseFloat(influencerForm.credits)
        }
      });

      if (error) throw error;

      alert(data.data.message || 'Creditos adicionados com sucesso!');
      setInfluencerForm({ cpf: '', name: '', credits: '' });
      loadInfluencers();
    } catch (error: any) {
      console.error('Erro ao adicionar creditos:', error);
      alert('Erro ao adicionar creditos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('coupon-manager', {
        body: {
          action: 'update',
          couponId,
          is_active: !currentStatus
        }
      });

      if (error) throw error;
      alert(`Cupom ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      loadCoupons();
    } catch (error: any) {
      console.error('Erro ao atualizar cupom:', error);
      alert('Erro ao atualizar cupom: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed_value': return 'Valor Fixo';
      case 'percentage': return 'Percentual';
      case 'influencer_credit': return 'Credito Influencer';
      default: return type;
    }
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IconTicket className="w-7 h-7 text-amber-600" />
          Gerenciamento de Cupons
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <IconPlus className="w-4 h-4 inline mr-1" />
            Criar Cupom
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'list'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <IconTicket className="w-4 h-4 inline mr-1" />
            Lista de Cupons
          </button>
          <button
            onClick={() => setActiveTab('influencers')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'influencers'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <IconUser className="w-4 h-4 inline mr-1" />
            Influencers
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <IconClock className="w-4 h-4 inline mr-1" />
            Historico de Uso
          </button>
        </div>

        {/* Create Coupon Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome do Cupom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Desconto Primeira Compra"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Codigo do Cupom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="CODIGO123"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo de Desconto
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="fixed_value">Valor Fixo (R$)</option>
                  <option value="percentage">Percentual (%)</option>
                  <option value="influencer_credit">Credito Influencer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valor {formData.type === 'percentage' ? '(%)' : '(R$)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={formData.type === 'percentage' ? '10' : '50.00'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valor Minimo da Compra (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Numero Maximo de Usos
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ilimitado"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valido Ate
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  CPF Especifico (opcional)
                </label>
                <input
                  type="text"
                  value={formData.targetCpf}
                  onChange={(e) => setFormData({ ...formData, targetCpf: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="12345678900"
                  maxLength={11}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Cupom'}
            </button>
          </form>
        )}

        {/* List Coupons Tab */}
        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : coupons.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum cupom cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Codigo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Usos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Validade</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map((coupon) => {
                      const isExpired = new Date(coupon.valid_until) < new Date();
                      const isMaxed = coupon.max_uses && coupon.current_uses >= coupon.max_uses;
                      
                      return (
                        <tr key={coupon.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono font-bold text-amber-600">
                            {coupon.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{coupon.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getTypeLabel(coupon.type)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${parseFloat(coupon.value.toString()).toFixed(2)}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              isExpired ? 'bg-red-100 text-red-800' :
                              isMaxed ? 'bg-orange-100 text-orange-800' :
                              coupon.is_active ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {isExpired ? 'Expirado' :
                               isMaxed ? 'Esgotado' :
                               coupon.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                              disabled={isExpired || isMaxed}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                coupon.is_active
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {coupon.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Influencers Tab */}
        {activeTab === 'influencers' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">Adicionar Creditos para Influencer</h3>
              <form onSubmit={handleAddInfluencerCredit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={influencerForm.cpf}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, cpf: e.target.value.replace(/\D/g, '') })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="CPF (somente numeros)"
                  maxLength={11}
                  required
                />
                <input
                  type="text"
                  value={influencerForm.name}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Nome do Influencer"
                />
                <input
                  type="number"
                  step="0.01"
                  value={influencerForm.credits}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, credits: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Valor (R$)"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adicionando...' : 'Adicionar Creditos'}
                </button>
              </form>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : influencers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum influencer cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.map((inf) => (
                  <div key={inf.id} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <IconUser className="w-8 h-8" />
                      <IconGift className="w-6 h-6 opacity-75" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">{inf.influencer_name}</h4>
                    <p className="text-sm opacity-90 mb-4">CPF: {formatCpf(inf.influencer_cpf)}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-90">Total:</span>
                        <span className="font-bold">R$ {parseFloat(inf.total_credits.toString()).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-90">Usado:</span>
                        <span className="font-bold">R$ {parseFloat(inf.used_credits.toString()).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/30">
                        <span className="opacity-90">Disponivel:</span>
                        <span className="font-bold text-lg">R$ {parseFloat(inf.available_credits.toString()).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Usage History Tab */}
        {activeTab === 'history' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : usageHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum uso registrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CPF Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pedido</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Desconto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usageHistory.map((usage) => (
                      <tr key={usage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(usage.used_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCpf(usage.customer_cpf)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {usage.order_id || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          R$ {parseFloat(usage.discount_amount.toString()).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
