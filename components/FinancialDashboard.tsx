import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DailySalesDivision {
  id: string;
  date: string;
  bakery_id: string;
  total_sale_amount: number;
  bakery_amount: number;
  delivery_amount: number;
  customer_credit_amount: number;
  platform_amount: number;
  status: string;
}

interface SummaryData {
  totalSales: number;
  totalBakeryShare: number;
  totalDeliveryShare: number;
  totalCustomerCredits: number;
  totalPlatformShare: number;
  transactionCount: number;
}

interface Props {
  userId: string;
  userRole: string;
}

export default function FinancialDashboard({ userId, userRole }: Props) {
  const [divisions, setDivisions] = useState<DailySalesDivision[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalSales: 0,
    totalBakeryShare: 0,
    totalDeliveryShare: 0,
    totalCustomerCredits: 0,
    totalPlatformShare: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadDashboardData();
  }, [userId, dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    return startDate.toISOString().split('T')[0];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const startDate = getDateFilter();

      let query = supabase
        .from('daily_sales_division')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: false });

      if (userRole === 'BAKERY') {
        query = query.eq('bakery_id', userId);
      } else if (userRole === 'DELIVERY') {
        query = query.eq('delivery_id', userId);
      } else if (userRole === 'CLIENT') {
        query = query.eq('customer_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDivisions(data || []);
      calculateSummary(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      alert('Erro ao carregar dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: DailySalesDivision[]) => {
    const summary = data.reduce(
      (acc, division) => ({
        totalSales: acc.totalSales + parseFloat(division.total_sale_amount.toString()),
        totalBakeryShare: acc.totalBakeryShare + parseFloat(division.bakery_amount.toString()),
        totalDeliveryShare: acc.totalDeliveryShare + parseFloat(division.delivery_amount.toString()),
        totalCustomerCredits: acc.totalCustomerCredits + parseFloat(division.customer_credit_amount.toString()),
        totalPlatformShare: acc.totalPlatformShare + parseFloat(division.platform_amount.toString()),
        transactionCount: acc.transactionCount + 1
      }),
      {
        totalSales: 0,
        totalBakeryShare: 0,
        totalDeliveryShare: 0,
        totalCustomerCredits: 0,
        totalPlatformShare: 0,
        transactionCount: 0
      }
    );

    setSummary(summary);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Financeiro</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === 'today'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === 'week'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === 'month'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              30 Dias
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total de Vendas</p>
            <p className="text-3xl font-bold">R$ {summary.totalSales.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">{summary.transactionCount} transacoes</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Padarias (90%)</p>
            <p className="text-3xl font-bold">R$ {summary.totalBakeryShare.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">Repasses para padarias</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Entregadores (97%)</p>
            <p className="text-3xl font-bold">R$ {summary.totalDeliveryShare.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">Repasses para entregadores</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Creditos Clientes (3%)</p>
            <p className="text-3xl font-bold">R$ {summary.totalCustomerCredits.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">Creditos gerados</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Plataforma (16%)</p>
            <p className="text-3xl font-bold">R$ {summary.totalPlatformShare.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">Taxas da plataforma</p>
          </div>

          <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Ticket Medio</p>
            <p className="text-3xl font-bold">
              R$ {summary.transactionCount > 0 ? (summary.totalSales / summary.transactionCount).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm opacity-75 mt-2">Por transacao</p>
          </div>
        </div>

        {divisions.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Historico de Divisoes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Venda Total</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Padaria</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Entregador</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Plataforma</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {divisions.map((division) => (
                    <tr key={division.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(division.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        R$ {parseFloat(division.total_sale_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-green-600">
                        R$ {parseFloat(division.bakery_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-purple-600">
                        R$ {parseFloat(division.delivery_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-amber-600">
                        R$ {parseFloat(division.customer_credit_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-indigo-600">
                        R$ {parseFloat(division.platform_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          division.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          division.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {division.status === 'COMPLETED' ? 'Concluido' :
                           division.status === 'PROCESSING' ? 'Processando' :
                           'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {divisions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma transacao encontrada no periodo selecionado</p>
          </div>
        )}
      </div>
    </div>
  );
}
