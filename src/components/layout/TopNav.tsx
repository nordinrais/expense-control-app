'use client';

import { Search, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TopNav() {
    const [userName, setUserName] = useState('Usuario');
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserName(user.email.split('@')[0]);
            }
        };
        getUser();
    }, [supabase.auth]);

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm input-focus"
                    />
                </div>
            </div>

            {/* User section */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900 capitalize">{userName}</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
