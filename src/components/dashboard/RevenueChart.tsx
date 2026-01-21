interface ChartData {
    month: string;
    value: number;
}

interface RevenueChartProps {
    data: ChartData[];
    title?: string;
}

export default function RevenueChart({ data, title = 'Ingresos Totales' }: RevenueChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const total = data.reduce((acc, d) => acc + d.value, 0);

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-500 text-sm">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        €{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <option>Mensual</option>
                    <option>Anual</option>
                </select>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-2 h-48">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className="w-full bg-gradient-to-t from-primary-900 to-primary-500 rounded-t-md transition-all duration-300 hover:from-primary-800 hover:to-primary-400"
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                minHeight: item.value > 0 ? '8px' : '0px',
                            }}
                        />
                        <span className="text-xs text-gray-500">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
