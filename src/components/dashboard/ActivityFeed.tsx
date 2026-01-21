import { FileText } from 'lucide-react';

interface Activity {
    id: string;
    type: 'invoice' | 'payment' | 'expense';
    description: string;
    amount?: number;
    timestamp: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'invoice':
                return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="text-green-600" size={16} />
                </div>;
            case 'payment':
                return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="text-blue-600" size={16} />
                </div>;
            case 'expense':
                return <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="text-orange-600" size={16} />
                </div>;
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades</h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay actividades recientes</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                            {getIcon(activity.type)}
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{activity.description}</p>
                                {activity.amount && (
                                    <p className="text-sm font-medium text-gray-700">
                                        €{activity.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
