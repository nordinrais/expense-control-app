'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

interface FixedCost {
    id: string;
    category: string;
    monthly_amount: number;
    created_at: string;
}

const CATEGORIES = [
    'Alquiler',
    'Luz',
    'Agua',
    'Gas',
    'Internet',
    'Teléfono',
    'Salarios',
    'Seguros',
    'Impuestos',
    'Software',
    'Marketing',
    'Otros',
];

export default function GastosFijosPage() {
    const [costs, setCosts] = useState<FixedCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: CATEGORIES[0],
        monthly_amount: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchCosts();
    }, []);

    const fetchCosts = async () => {
        const { data, error } = await supabase
            .from('fixed_costs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCosts(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated');

            const { error } = await supabase.from('fixed_costs').insert({
                user_id: user.id,
                category: formData.category,
                monthly_amount: parseFloat(formData.monthly_amount),
            });

            if (error) throw error;

            setShowForm(false);
            setFormData({ category: CATEGORIES[0], monthly_amount: '' });
            fetchCosts();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto fijo?')) return;

        const { error } = await supabase.from('fixed_costs').delete().eq('id', id);
        if (!error) {
            fetchCosts();
        }
    };

    const totalMensual = costs.reduce((acc, cost) => acc + Number(cost.monthly_amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Gastos Fijos</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Gasto
                </button>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl p-6 text-white">
                <p className="text-sm text-white/80 mb-1">Total Gastos Fijos Mensuales</p>
                <p className="text-3xl font-bold">
                    €{totalMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Gasto Fijo</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg input-focus"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Importe Mensual (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.monthly_amount}
                                    onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                                    required
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

            {/* Costs List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">Cargando...</div>
                ) : costs.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        No hay gastos fijos registrados
                    </div>
                ) : (
                    costs.map((cost) => (
                        <div key={cost.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-medium text-lg">
                                        {cost.category.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{cost.category}</p>
                                    <p className="text-sm text-gray-500">Gasto mensual</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-xl font-bold text-gray-900">
                                    €{Number(cost.monthly_amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                </p>
                                <button onClick={() => handleDelete(cost.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
