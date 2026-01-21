'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileText,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Settings,
    HelpCircle,
    LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/facturas', label: 'Facturas', icon: FileText },
    { href: '/ventas', label: 'Ventas', icon: ShoppingCart },
    { href: '/gastos-fijos', label: 'Gastos Fijos', icon: DollarSign },
    { href: '/breakeven', label: 'Breakeven', icon: TrendingUp },
    { href: '/settings', label: 'Configuración', icon: Settings },
    { href: '/help', label: 'Ayuda', icon: HelpCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">I</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Inva</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-900 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
