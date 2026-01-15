import React from 'react';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { MessageSquare, Users, Heart, TrendingUp, Loader2, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-fundhub-primary/10`}>
                <Icon className="w-6 h-6 text-fundhub-primary" />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {trend}
                </div>
            )}
        </div>
        <div className="text-3xl font-black text-fundhub-dark mb-1">{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
);

const ActivityItem = ({ activity }: any) => {
    let icon = MessageSquare;
    let colorClass = 'text-blue-500';
    let bgClass = 'bg-blue-50';
    let title = '';

    if (activity.eventName === 'FundsLocked') {
        icon = ArrowUpRight;
        colorClass = 'text-green-500';
        bgClass = 'bg-green-50';
        title = `New contribution received`;
    } else if (activity.eventName === 'CampaignCreated') {
        icon = Users;
        colorClass = 'text-blue-500';
        bgClass = 'bg-blue-50';
        title = `Campaign launched on ${activity.network}`;
    } else {
        title = activity.eventName;
    }

    const Icon = icon;

    return (
        <div className="flex gap-4 p-4 hover:bg-white/40 transition-all rounded-xl">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold text-fundhub-dark mb-1">{title}</p>
                <p className="text-xs text-gray-400 font-medium">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
};

const Community = () => {
    const { stats, activities, isLoading } = useCreatorDashboard();

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading community data...</p>
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
                        <h1 className="text-4xl font-black text-fundhub-dark tracking-tight mb-2">Community</h1>
                        <p className="text-gray-500 font-medium">
                            Engage with your supporters and track community growth
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            icon={Users}
                            label="Total Backers"
                            value={stats.totalBackers}
                            trend="+12%"
                        />
                        <StatCard
                            icon={Heart}
                            label="Active Supporters"
                            value={stats.totalBackers}
                        />
                        <StatCard
                            icon={MessageSquare}
                            label="Interactions"
                            value={activities.length}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Recent Activity */}
                        <div className="xl:col-span-2">
                            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80">
                                <h2 className="text-2xl font-black text-fundhub-dark mb-6">Recent Activity</h2>
                                <div className="space-y-2">
                                    {activities.length > 0 ? (
                                        activities.slice(0, 10).map((activity, i) => (
                                            <ActivityItem key={i} activity={activity} />
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold">No activity yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Community Insights */}
                        <div className="space-y-6">
                            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80">
                                <h3 className="text-lg font-black text-fundhub-dark mb-4">Top Contributors</h3>
                                <div className="space-y-3">
                                    <div className="text-center py-8">
                                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-400 font-medium">
                                            Contributor data will appear here
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80">
                                <h3 className="text-lg font-black text-fundhub-dark mb-4">Engagement Tips</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-fundhub-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-fundhub-primary font-black text-xs">1</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Post regular updates to keep backers engaged
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-fundhub-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-fundhub-primary font-black text-xs">2</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Respond to comments and questions promptly
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-fundhub-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-fundhub-primary font-black text-xs">3</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Share milestone achievements with your community
                                        </p>
                                    </div>
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

export default Community;
