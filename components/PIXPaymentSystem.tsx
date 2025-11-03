import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentTransfer {
  id: string;
  daily_sales_division_id: string;
  recipient_type: string;
  recipient_name: string;
  bank_name: string;
  pix_key: string;
  amount: number;
  pix_qr_code: string;
  pix_qr_code_text: string;
  pix_transaction_id: string;
  status: string;
  generated_at: string;
  expires_at: string;
  created_at: string;
}

interface Props {
  userId: string;
  userRole: string;
}

export default function PIXPaymentSystem({ userId, userRole }: Props) {
  const [transfers, setTransfers] = useState<PaymentTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<PaymentTransfer | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTransfers();
  }, [userId, filter]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payment_transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole !== 'ADMIN') {
        query = query.eq('recipient_id', userId);
      }

      if (filter !== 'all') {
        if (filter === 'pending') {
          query = query.in('status', ['PENDING', 'GENERATED', 'PROCESSING']);
        } else {
          query = query.eq('status', 'COMPLETED');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransfers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar transferencias:', error);
      alert('Erro ao carregar transferencias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Codigo PIX copiado!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'GENERATED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'GENERATED': 'Gerado',
      'PROCESSING': 'Processando',
      'COMPLETED': 'Concluido',
      'FAILED': 'Falhou',
      'CANCELLED': 'Cancelado',
      'EXPIRED': 'Expirado'
    };
    return labels[status] || status;
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
          <h2 className="text-2xl font-bold text-gray-800">Transferencias PIX</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Concluidas
            </button>
          </div>
        </div>

        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma transferencia encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Beneficiario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Banco</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(transfer.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transfer.recipient_name}</p>
                        <p className="text-xs text-gray-500">{transfer.pix_key}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transfer.bank_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        R$ {parseFloat(transfer.amount.toString()).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                        {getStatusLabel(transfer.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedTransfer(transfer)}
                        className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                      >
                        Ver QR Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Detalhes da Transferencia</h3>
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Beneficiario</p>
                  <p className="font-semibold">{selectedTransfer.recipient_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Banco</p>
                  <p className="font-semibold">{selectedTransfer.bank_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Chave PIX</p>
                  <p className="font-semibold">{selectedTransfer.pix_key}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-semibold text-green-600 text-xl">
                    R$ {parseFloat(selectedTransfer.amount.toString()).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                    {getStatusLabel(selectedTransfer.status)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">ID Transacao</p>
                  <p className="font-mono text-xs">{selectedTransfer.pix_transaction_id}</p>
                </div>
              </div>

              {selectedTransfer.pix_qr_code && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code abaixo:</p>
                    <img
                      src={selectedTransfer.pix_qr_code}
                      alt="QR Code PIX"
                      className="mx-auto border-4 border-gray-200 rounded-lg"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>

                  {selectedTransfer.pix_qr_code_text && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Ou copie o codigo PIX:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedTransfer.pix_qr_code_text}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => copyPixCode(selectedTransfer.pix_qr_code_text)}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTransfer.expires_at && (
                    <p className="text-sm text-gray-500 text-center">
                      Expira em: {new Date(selectedTransfer.expires_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
