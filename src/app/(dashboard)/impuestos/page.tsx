import { createClient } from '@/lib/supabase/server';

function calculateTax(amount: number) {
    // Assumption: amount is Total (Base + VAT)
    // VAT Rate: 21%
    // Base = Amount / 1.21
    // VAT = Amount - Base
    const base = amount / 1.21;
    const vat = amount - base;
    return {
        base,
        vat
    };
}

async function getTaxData(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get all invoices
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });

    if (!invoices) return { sales: [], purchases: [], totals: { salesVat: 0, purchaseVat: 0, balance: 0 } };

    let totalSalesVat = 0;
    let totalPurchaseVat = 0;

    const sales = invoices.filter((inv: any) => inv.type === 'venta').map((inv: any) => {
        const { base, vat } = calculateTax(inv.amount);
        totalSalesVat += vat;
        return { ...inv, base, vat };
    });

    const purchases = invoices.filter((inv: any) => inv.type === 'recibida').map((inv: any) => {
        const { base, vat } = calculateTax(inv.amount);
        totalPurchaseVat += vat;
        return { ...inv, base, vat };
    });

    return {
        sales,
        purchases,
        totals: {
            salesVat: totalSalesVat,
            purchaseVat: totalPurchaseVat,
            balance: totalSalesVat - totalPurchaseVat
        }
    };
}

export default async function TaxesPage() {
    const supabase = await createClient();
    const data = await getTaxData(supabase);

    if (!data) return <div>Cargando...</div>;

    const formatter = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Impuestos (IVA 21%)</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">IVA Repercutido (Ventas)</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {formatter.format(data.totals.salesVat)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Lo que has cobrado de IVA</p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-medium">IVA Soportado (Compras)</h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {formatter.format(data.totals.purchaseVat)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Lo que has pagado de IVA</p>
                </div>

                <div className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${data.totals.balance >= 0 ? 'border-primary-500' : 'border-orange-500'}`}>
                    <h3 className="text-gray-500 text-sm font-medium">Resultado IVA</h3>
                    <p className={`text-2xl font-bold mt-2 ${data.totals.balance >= 0 ? 'text-primary-600' : 'text-orange-600'}`}>
                        {formatter.format(data.totals.balance)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {data.totals.balance >= 0 ? 'A pagar a Hacienda' : 'A devolver por Hacienda'}
                    </p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Desglose de Facturas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Cliente/Proveedor</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3 text-right">Base Imponible</th>
                                <th className="px-6 py-3 text-right">IVA (21%)</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...data.sales, ...data.purchases]
                                .sort((a: any, b: any) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
                                .map((invoice: any) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{invoice.provider_customer}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.type === 'venta'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {invoice.type === 'venta' ? 'Venta' : 'Compra'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatter.format(invoice.base)}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{formatter.format(invoice.vat)}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatter.format(invoice.amount)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
