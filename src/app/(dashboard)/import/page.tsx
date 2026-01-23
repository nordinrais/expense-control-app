'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Check, AlertCircle, Save, Loader2 } from 'lucide-react';
import { processBulkImport, saveBulkInvoices } from '@/app/actions/import-actions';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [rawRows, setRawRows] = useState<any[]>([]);
    const [processedRows, setProcessedRows] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);
        setSuccess(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                setRawRows(data);
            } catch (err) {
                console.error(err);
                setError('Error leyendo el archivo Excel. Asegúrate de que sea válido.');
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleProcessAI = async () => {
        if (rawRows.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await processBulkImport(rawRows);
            if (result.error) {
                setError(result.error);
            } else {
                setProcessedRows(result.data);
            }
        } catch (err) {
            setError('Error de conexión con la IA');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await saveBulkInvoices(processedRows);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess('¡Facturas importadas correctamente!');
                setProcessedRows([]);
                setRawRows([]);
                setFile(null);
                setTimeout(() => router.push('/facturas'), 2000);
            }
        } catch (err) {
            setError('Error guardando en base de datos');
        } finally {
            setIsSaving(false);
        }
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newRows = [...processedRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setProcessedRows(newRows);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Importación Masiva de Facturas</h1>

            {/* Upload Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center">
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-4"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {file ? file.name : 'Sube tu Excel o CSV aquí'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Arrastra o haz clic para seleccionar
                        </p>
                    </div>
                </label>

                {rawRows.length > 0 && !processedRows.length && (
                    <div className="mt-6">
                        <p className="text-sm text-green-600 mb-4">
                            <Check className="inline w-4 h-4 mr-1" />
                            {rawRows.length} filas detectadas
                        </p>
                        <button
                            onClick={handleProcessAI}
                            disabled={isProcessing}
                            className="bg-primary-900 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Analizando con IA...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={20} />
                                    Procesar con IA
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Error / Success Messages */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
                    <Check size={20} />
                    {success}
                </div>
            )}

            {/* Review Table */}
            {processedRows.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Revisar Datos ({processedRows.length})</h3>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Guardar Todo
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Tercero (Cliente/Prov)</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3 text-right">Importe Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="date"
                                                value={row.issue_date || ''}
                                                onChange={(e) => updateRow(idx, 'issue_date', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={row.provider_customer || ''}
                                                onChange={(e) => updateRow(idx, 'provider_customer', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={row.type}
                                                onChange={(e) => updateRow(idx, 'type', e.target.value)}
                                                className={`border rounded px-2 py-1 ${row.type === 'venta' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                    }`}
                                            >
                                                <option value="venta">Venta</option>
                                                <option value="recibida">Gasto/Compra</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={row.amount || 0}
                                                onChange={(e) => updateRow(idx, 'amount', Number(e.target.value))}
                                                className="border rounded px-2 py-1 w-24 text-right"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
