import { DollarSign, FileText, TrendingDown, TrendingUp } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
    change?: {
        value: string;
        positive: boolean;
    };
}

function SummaryCard({ title, value, icon, iconBg, change }: SummaryCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-500">{title}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {change && (
                            <span
                                className={`flex items-center text-xs font-medium ${change.positive ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {change.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {change.value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SummaryCardsProps {
    totalVentas: number;
    totalRecibidas: number;
    gastosFijos: number;
}

export default function SummaryCards({ totalVentas, totalRecibidas, gastosFijos }: SummaryCardsProps) {
    const breakeven = gastosFijos + totalRecibidas - totalVentas;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
                title="Total Ventas"
                value={`€${totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                icon={<DollarSign className="text-green-600" size={24} />}
                iconBg="bg-green-100"
            />
            <SummaryCard
                title="Facturas Recibidas"
                value={`€${totalRecibidas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                icon={<FileText className="text-blue-600" size={24} />}
                iconBg="bg-blue-100"
            />
            <SummaryCard
                title="Gastos Fijos"
                value={`€${gastosFijos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                icon={<TrendingDown className="text-orange-600" size={24} />}
                iconBg="bg-orange-100"
            />
            <SummaryCard
                title={breakeven > 0 ? 'Faltante' : 'Superávit'}
                value={`€${Math.abs(breakeven).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                icon={
                    breakeven > 0 ? (
                        <TrendingDown className="text-red-600" size={24} />
                    ) : (
                        <TrendingUp className="text-green-600" size={24} />
                    )
                }
                iconBg={breakeven > 0 ? 'bg-red-100' : 'bg-green-100'}
            />
        </div>
    );
}
