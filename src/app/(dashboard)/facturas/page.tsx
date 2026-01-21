'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Upload, Trash2, Wand2, Loader2, FileText } from 'lucide-react';
import { processInvoice } from '@/app/actions/process-invoice';

interface Invoice {
    id: string;
    type: 'venta' | 'recibida';
    amount: number;
    provider_customer: string;
    issue_date: string;
    file_url: string | null;
    created_at: string;
}

export default function FacturasPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<{
        type: 'venta' | 'recibida';
        amount: string;
        provider_customer: string;
        issue_date: string;
    }>({
        type: 'venta',
        amount: '',
        provider_customer: '',
        issue_date: new Date().toISOString().split('T')[0],
    });
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInvoices(data);
        }
        setLoading(false);
    };

    const handleAutofill = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const result = await processInvoice(formData);

            if (result && !result.error) {
                setFormData({
                    type: result.type === 'venta' || result.type === 'recibida' ? result.type : 'venta',
                    amount: result.amount?.toString() || '',
                    provider_customer: result.provider_customer || '',
                    issue_date: result.issue_date || new Date().toISOString().split('T')[0],
                });
                // alert('Datos extraídos correctamente: ' + JSON.stringify(result)); // Opcional: Feedback positivo
            } else {
                alert('Error devuelto por IA: ' + JSON.stringify(result));
            }
        } catch (error: any) {
            console.error('Error autofilling invoice:', error);
            alert(`Error al procesar el archivo: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated');

            let file_url = null;

            // Upload PDF if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('invoices')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('invoices')
                    .getPublicUrl(fileName);

                file_url = publicUrl;
            }

            // Insert invoice
            const { error } = await supabase.from('invoices').insert({
                user_id: user.id,
                type: formData.type,
                amount: parseFloat(formData.amount),
                provider_customer: formData.provider_customer,
                issue_date: formData.issue_date,
                file_url,
                is_manual: true,
            });

            if (error) throw error;

            setShowForm(false);
            setFormData({
                type: 'venta',
                amount: '',
                provider_customer: '',
                issue_date: new Date().toISOString().split('T')[0],
            });
            setFile(null);
            fetchInvoices();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta factura?')) return;

        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (!error) {
            fetchInvoices();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nueva Factura
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Nueva Factura</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 size={20} className="rotate-45" />
                            </button>
                        </div>

                        {/* AI Authenticated Zone */}
                        <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Wand2 className="text-primary-600" size={20} />
                                <h3 className="font-medium text-primary-900">Autocompletar con IA</h3>
                            </div>
                            <p className="text-sm text-primary-700 mb-3">
                                Sube tu factura en PDF y dejame rellenar los datos por ti.
                            </p>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleAutofill}
                                    className="hidden"
                                    id="ai-upload"
                                    disabled={isProcessing}
                                />
                                <label
                                    htmlFor="ai-upload"
                                    className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed transition-all cursor-pointer bg-white
                                        ${isProcessing
                                            ? 'border-gray-300 opacity-75 cursor-wait'
                                            : 'border-primary-200 hover:border-primary-500 hover:bg-primary-50'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin text-primary-600" size={20} />
                                            <span className="text-primary-600 font-medium">Analizando factura...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="text-primary-600" size={20} />
                                            <span className="text-primary-600 font-medium">Subir PDF</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">O rellena manualmente</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'venta' | 'recibida' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg input-focus"
                                >
                                    <option value="venta">Venta (Emitida)</option>
                                    <option value="recibida">Recibida (Compra)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.type === 'venta' ? 'Cliente' : 'Proveedor'}
                                </label>
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

                            {/* Mostrar archivo seleccionado si viene del autofill */}
                            {file && !isProcessing && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <FileText className="text-gray-400" size={24} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}

                            {!file && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF (opcional)</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                            <p className="text-sm text-gray-500">
                                                Haz clic para subir PDF
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || isProcessing}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invoices List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 hidden md:table-header-group">
                        <tr className="text-left text-xs text-gray-500 uppercase">
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Cliente/Proveedor</th>
                            <th className="px-6 py-3">Importe</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">PDF</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Cargando...
                                </td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No hay facturas registradas
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 flex flex-col md:table-row border-b md:border-none p-4 md:p-0">
                                    <td className="px-6 py-2 md:py-4">
                                        <div className="flex items-center justify-between md:block">
                                            <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Tipo</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.type === 'venta' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {inv.type === 'venta' ? 'Venta' : 'Recibida'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 md:py-4 text-gray-900">
                                        <div className="flex items-center justify-between md:block">
                                            <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Cliente</span>
                                            {inv.provider_customer}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 md:py-4 font-medium text-gray-900">
                                        <div className="flex items-center justify-between md:block">
                                            <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Importe</span>
                                            €{Number(inv.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 md:py-4 text-gray-600">
                                        <div className="flex items-center justify-between md:block">
                                            <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Fecha</span>
                                            {new Date(inv.issue_date).toLocaleDateString('es-ES')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 md:py-4">
                                        <div className="flex items-center justify-between md:block">
                                            <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">PDF</span>
                                            {inv.file_url ? (
                                                <a href={inv.file_url} target="_blank" className="text-primary-600 hover:underline text-sm">
                                                    Ver PDF
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 md:py-4 text-right md:text-left">
                                        <div className="flex items-center justify-end md:block">
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
