import { createClient } from '@/lib/supabase/server';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

async function getBreakevenData(supabase: any) {
    // Get sales total
    const { data: salesData } = await supabase
        .from('invoices')
        .select('amount')
        .eq('type', 'venta');
    const totalVentas = salesData?.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0) || 0;

    // Get received invoices total
    const { data: receivedData } = await supabase
        .from('invoices')
        .select('amount')
        .eq('type', 'recibida');
    const totalRecibidas = receivedData?.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0) || 0;

    // Get fixed costs total
    const { data: fixedCostsData } = await supabase
        .from('fixed_costs')
        .select('monthly_amount');
    const gastosFijos = fixedCostsData?.reduce((acc: number, cost: any) => acc + Number(cost.monthly_amount), 0) || 0;

    return { totalVentas, totalRecibidas, gastosFijos };
}

export default async function BreakevenPage() {
    const supabase = await createClient();
    const { totalVentas, totalRecibidas, gastosFijos } = await getBreakevenData(supabase);

    // Breakeven calculation: Faltante = (Gastos Fijos + Facturas Recibidas) - Total Ventas
    const totalGastos = gastosFijos + totalRecibidas;
    const breakeven = totalGastos - totalVentas;
    const isDeficit = breakeven > 0;
    const percentage = totalGastos > 0 ? Math.min((totalVentas / totalGastos) * 100, 100) : 0;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Breakeven</h1>

            {/* Main Status Card */}
            <div className={`rounded-xl p-8 ${isDeficit ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-green-500 to-green-700'}`}>
                <div className="flex items-center gap-4 mb-4">
                    {isDeficit ? (
                        <AlertCircle className="text-white" size={40} />
                    ) : (
                        <CheckCircle className="text-white" size={40} />
                    )}
                    <div>
                        <p className="text-white/80 text-lg">
                            {isDeficit ? 'Falta para cubrir gastos' : 'Superávit'}
                        </p>
                        <p className="text-4xl font-bold text-white">
                            €{Math.abs(breakeven).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white/20 rounded-full h-4 mt-6">
                    <div
                        className="bg-white rounded-full h-4 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-white/80 text-sm mt-2">
                    {percentage.toFixed(1)}% de gastos cubiertos con ventas
                </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="text-green-600" size={20} />
                        </div>
                        <p className="text-gray-500 font-medium">Total Ventas</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        €{totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ingresos por facturación</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingDown className="text-blue-600" size={20} />
                        </div>
                        <p className="text-gray-500 font-medium">Facturas Recibidas</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        €{totalRecibidas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Gastos por compras</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <TrendingDown className="text-orange-600" size={20} />
                        </div>
                        <p className="text-gray-500 font-medium">Gastos Fijos</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        €{gastosFijos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Costes mensuales fijos</p>
                </div>
            </div>

            {/* Formula explanation */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fórmula de Cálculo</h3>
                <div className="bg-white rounded-lg p-4 font-mono text-sm">
                    <p className="text-gray-600">
                        <span className={isDeficit ? 'text-red-600' : 'text-green-600'}>
                            {isDeficit ? 'Faltante' : 'Superávit'}
                        </span>
                        {' = (Gastos Fijos + Facturas Recibidas) − Total Ventas'}
                    </p>
                    <p className="text-gray-800 mt-2">
                        <span className={isDeficit ? 'text-red-600' : 'text-green-600'}>
                            €{Math.abs(breakeven).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                        {' = (€' + gastosFijos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        {' + €' + totalRecibidas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        {') − €' + totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
