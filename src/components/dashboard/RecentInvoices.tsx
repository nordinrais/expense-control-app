interface Invoice {
    id: string;
    date: string;
    client: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
}

interface RecentInvoicesProps {
    invoices: Invoice[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
    const getStatusBadge = (status: Invoice['status']) => {
        const styles = {
            paid: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            overdue: 'bg-red-100 text-red-700',
        };
        const labels = {
            paid: 'Pagada',
            pending: 'Pendiente',
            overdue: 'Vencida',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Facturas Recientes</h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <option>Mensual</option>
                    <option>Anual</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                            <th className="pb-3 font-medium">ID</th>
                            <th className="pb-3 font-medium">Fecha</th>
                            <th className="pb-3 font-medium">Cliente</th>
                            <th className="pb-3 font-medium">Importe</th>
                            <th className="pb-3 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-500">
                                    No hay facturas recientes
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-4">
                                        <span className="text-primary-600 font-medium">#{invoice.id}</span>
                                    </td>
                                    <td className="py-4 text-gray-600">{invoice.date}</td>
                                    <td className="py-4 text-gray-900">{invoice.client}</td>
                                    <td className="py-4 font-medium text-gray-900">
                                        €{invoice.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4">{getStatusBadge(invoice.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
