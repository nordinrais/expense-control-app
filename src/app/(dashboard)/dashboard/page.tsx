import { createClient } from '@/lib/supabase/server';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import RecentInvoices from '@/components/dashboard/RecentInvoices';

async function getDashboardData(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

    // Get recent invoices
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    return {
        totalVentas,
        totalRecibidas,
        gastosFijos,
        recentInvoices: recentInvoices || [],
    };
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const data = await getDashboardData(supabase);

    const chartData = [
        { month: 'Ene', value: 5000 },
        { month: 'Feb', value: 7500 },
        { month: 'Mar', value: 6000 },
        { month: 'Abr', value: 8000 },
        { month: 'May', value: 12000 },
        { month: 'Jun', value: 15000 },
        { month: 'Jul', value: 11000 },
        { month: 'Ago', value: 9000 },
        { month: 'Sep', value: 10000 },
        { month: 'Oct', value: 8500 },
        { month: 'Nov', value: 7000 },
        { month: 'Dic', value: 0 },
    ];

    const activities = [
        {
            id: '1',
            type: 'invoice' as const,
            description: 'Nueva factura de venta creada',
            amount: 1500,
            timestamp: 'hace 2 minutos',
        },
        {
            id: '2',
            type: 'payment' as const,
            description: 'Pago recibido de Cliente ABC',
            amount: 3200,
            timestamp: 'hace 1 hora',
        },
        {
            id: '3',
            type: 'expense' as const,
            description: 'Gasto fijo registrado: Alquiler',
            amount: 800,
            timestamp: 'hace 3 horas',
        },
    ];

    const invoices = data?.recentInvoices.map((inv: any) => ({
        id: inv.id.slice(0, 8),
        date: new Date(inv.created_at).toLocaleDateString('es-ES'),
        client: inv.provider_customer,
        amount: Number(inv.amount),
        status: 'paid' as const,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards
                totalVentas={data?.totalVentas || 0}
                totalRecibidas={data?.totalRecibidas || 0}
                gastosFijos={data?.gastosFijos || 0}
            />

            {/* Chart */}
            <div className="w-full">
                <RevenueChart data={chartData} />
            </div>

            {/* Activities and Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ActivityFeed activities={activities} />
                <div className="lg:col-span-2">
                    <RecentInvoices invoices={invoices} />
                </div>
            </div>
        </div>
    );
}
