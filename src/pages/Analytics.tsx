import React from 'react';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { TrendingUp, DollarSign, Users, Activity, Loader2, BarChart3, PieChart } from 'lucide-react';
import { formatUnits } from 'viem';
import { getTokenBySymbol } from '@/lib/tokens';

const MetricCard = ({ icon: Icon, label, value, change, trend }: any) => (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-fundhub-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-fundhub-primary" />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    {change}
                </div>
            )}
        </div>
        <div className="text-3xl font-black text-fundhub-dark mb-1">{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
);

const Analytics = () => {
    const { campaigns, stats, isLoading } = useCreatorDashboard();
    const { sonic: sonicPrice, ethereum: ethPrice } = useTokenPrice();

    const calculateTotalUSD = () => {
        return stats.totals.reduce((acc, t) => {
            const price = t.network === 'sonic' ? sonicPrice : ethPrice;
            const tokenSymbol = t.token.toUpperCase();
            const tokenInfo = getTokenBySymbol(tokenSymbol, t.network as any);
            const decimals = tokenInfo?.decimals || 18;

            const amount = parseFloat(formatUnits(BigInt(t.raised), decimals));
            return acc + (amount * (price || 0));
        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading analytics...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-inter">
            <DashboardSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-fundhub-dark tracking-tight mb-2">Analytics</h1>
                        <p className="text-gray-500 font-medium">
                            Track your campaign performance and growth metrics
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                        <MetricCard
                            icon={DollarSign}
                            label="Total Raised"
                            value={`$${calculateTotalUSD()}`}
                            change="+15.3%"
                            trend="up"
                        />
                        <MetricCard
                            icon={Users}
                            label="Total Backers"
                            value={stats.totalBackers}
                            change="+8.2%"
                            trend="up"
                        />
                        <MetricCard
                            icon={Activity}
                            label="Active Campaigns"
                            value={campaigns.length}
                        />
                        <MetricCard
                            icon={TrendingUp}
                            label="Avg. Contribution"
                            value={stats.totalBackers > 0 ? `$${(parseFloat(calculateTotalUSD()) / stats.totalBackers).toFixed(2)}` : '$0'}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Campaign Performance */}
                        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 className="w-6 h-6 text-fundhub-primary" />
                                <h2 className="text-2xl font-black text-fundhub-dark">Campaign Performance</h2>
                            </div>
                            <div className="space-y-4">
                                {campaigns.length > 0 ? (
                                    campaigns.map((campaign, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-fundhub-dark">{campaign.title}</span>
                                                <span className="text-xs font-black text-fundhub-primary">{campaign.percentComplete}%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-fundhub-primary to-fundhub-secondary transition-all duration-1000"
                                                    style={{ width: `${Math.min(campaign.percentComplete, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{campaign.raised} {campaign.currency} raised</span>
                                                <span>{campaign.daysLeft} days left</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">No campaign data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Funding Distribution */}
                        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <PieChart className="w-6 h-6 text-fundhub-primary" />
                                <h2 className="text-2xl font-black text-fundhub-dark">Funding Distribution</h2>
                            </div>
                            <div className="space-y-4">
                                {stats.totals.length > 0 ? (
                                    stats.totals.map((total, i) => {
                                        const amount = parseFloat(formatUnits(BigInt(total.raised), 18));
                                        const price = total.network === 'sonic' ? sonicPrice : ethPrice;
                                        const usdValue = amount * (price || 0);

                                        return (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                                                <div>
                                                    <div className="text-sm font-black text-fundhub-dark uppercase">{total.network}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{total.token}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-fundhub-primary">${usdValue.toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">{amount.toFixed(4)} {total.token}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 text-center">
                                        <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">No funding data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Growth Insights */}
                        <div className="xl:col-span-2 bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80">
                            <h2 className="text-2xl font-black text-fundhub-dark mb-6">Growth Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-white/40 rounded-xl">
                                    <div className="text-4xl font-black text-fundhub-primary mb-2">
                                        {campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.percentComplete, 0) / campaigns.length) : 0}%
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg. Completion</div>
                                </div>
                                <div className="text-center p-6 bg-white/40 rounded-xl">
                                    <div className="text-4xl font-black text-green-600 mb-2">
                                        {campaigns.filter(c => c.percentComplete >= 100).length}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Successful Campaigns</div>
                                </div>
                                <div className="text-center p-6 bg-white/40 rounded-xl">
                                    <div className="text-4xl font-black text-blue-600 mb-2">
                                        {campaigns.filter(c => c.daysLeft > 0).length}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Campaigns</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Background Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
    );
};

export default Analytics;
