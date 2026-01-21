'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

interface Invoice {
    id: string;
    amount: number;
    provider_customer: string;
    issue_date: string;
    created_at: string;
}

export default function VentasPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        provider_customer: '',
        issue_date: new Date().toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('type', 'venta')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInvoices(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated');

            const { error } = await supabase.from('invoices').insert({
                user_id: user.id,
                type: 'venta',
                amount: parseFloat(formData.amount),
                provider_customer: formData.provider_customer,
                issue_date: formData.issue_date,
                is_manual: true,
            });

            if (error) throw error;

            setShowForm(false);
            setFormData({
                amount: '',
                provider_customer: '',
                issue_date: new Date().toISOString().split('T')[0],
            });
            fetchInvoices();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (!error) fetchInvoices();
    };

    const totalVentas = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Nueva Venta
                </button>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
                <p className="text-sm text-white/80 mb-1">Total Ventas</p>
                <p className="text-3xl font-bold">
                    €{totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Venta</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <input
                                    type="text"
                                    value={formData.provider_customer}
                                    onChange={(e) => setFormData({ ...formData, provider_customer: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg input-focus"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg input-focus"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg input-focus"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sales List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-500 uppercase">
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Importe</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay ventas registradas</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-900">{inv.provider_customer}</td>
                                    <td className="px-6 py-4 font-medium text-green-600">
                                        +€{Number(inv.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(inv.issue_date).toLocaleDateString('es-ES')}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
