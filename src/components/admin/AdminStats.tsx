import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Target, Activity, AlertTriangle } from 'lucide-react';
import { getTokenBySymbol } from '@/lib/tokens';

interface AdminStatsProps {
    stats: {
        pledged: Array<{ network: string; token: string; raised: string }>;
        counts: {
            totalCampaigns: number;
            activeCampaigns: number;
            totalBackers: number;
        };
    };
    loading: boolean;
}

const AdminStats = ({ stats, loading, error }: { stats: any, loading: boolean, error?: boolean }) => {
    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>;
    }

    if (!stats) return null;

    const calculateTotalUSD = () => {
        if (!stats?.pledged) return 0;
        return stats.pledged.reduce((sum, row) => {
            const token = row.token === '0x0000000000000000000000000000000000000000'
                ? (row.network === 'sonic' ? getTokenBySymbol('S', 'sonic') : getTokenBySymbol('ETH', 'ethereum'))
                : { price: 1, decimals: 18 };

            const amount = Number(row.raised) / Math.pow(10, (token as any)?.decimals || 18);
            return sum + (amount * ((token as any)?.price || 1));
        }, 0);
    };

    const totalUSD = calculateTotalUSD();

    const cards = [
        {
            title: 'Global Pledged',
            value: `$${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            description: 'Across all networks',
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Active Projects',
            value: stats?.counts?.activeCampaigns || 0,
            description: `of ${stats?.counts?.totalCampaigns || 0} total`,
            icon: Target,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Total Backers',
            value: (stats?.counts?.totalBackers || 0).toLocaleString(),
            description: 'Unique contributors',
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            title: 'Avg Project Raise',
            value: `$${(totalUSD / (stats?.counts?.totalCampaigns || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            description: 'Per created campaign',
            icon: Activity,
            color: 'text-green-600',
            bg: 'bg-green-50'
        }
    ];

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 italic">
                    <AlertTriangle size={14} />
                    PARTIAL SYNC: Some metrics are temporarily unavailable
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                <card.icon size={18} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                            <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminStats;
