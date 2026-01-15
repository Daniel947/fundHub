import React, { useState } from 'react';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Bell, Loader2, CheckCircle, AlertCircle, Info, TrendingUp, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const UpdateCard = ({ update }: any) => {
    const iconMap: any = {
        success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
        trending: { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    };

    const config = iconMap[update.type] || iconMap.info;
    const Icon = config.icon;

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80 hover:border-gray-300 transition-all">
            <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-black text-fundhub-dark">{update.title}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                            {formatDistanceToNow(new Date(update.time), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{update.description}</p>
                    {update.action && (
                        <button className="text-xs font-black text-fundhub-primary hover:underline">
                            {update.action}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Updates = () => {
    const { activities, isLoading } = useCreatorDashboard();
    const [filter, setFilter] = useState('all');

    // Transform activities into updates
    const updates = activities.map((activity) => {
        if (activity.eventName === 'FundsLocked') {
            return {
                type: 'success',
                title: 'New Contribution Received',
                description: `A backer has contributed to your campaign on ${activity.network}.`,
                time: activity.time,
                action: 'View Details'
            };
        } else if (activity.eventName === 'CampaignCreated') {
            return {
                type: 'info',
                title: 'Campaign Launched',
                description: `Your campaign was successfully deployed on ${activity.network}.`,
                time: activity.time,
                action: 'View Campaign'
            };
        } else {
            return {
                type: 'info',
                title: activity.eventName,
                description: `Activity recorded on ${activity.network}.`,
                time: activity.time,
            };
        }
    });

    // Add some mock updates for demonstration
    const mockUpdates = [
        {
            type: 'trending',
            title: 'Campaign Trending',
            description: 'Your campaign is gaining traction! Views increased by 45% this week.',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            action: 'View Analytics'
        },
        {
            type: 'warning',
            title: 'Milestone Due Soon',
            description: 'Milestone 2 deadline is approaching in 3 days. Make sure to submit your progress.',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            action: 'View Milestone'
        },
    ];

    const allUpdates = [...updates, ...mockUpdates].sort((a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading updates...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-inter">
            <DashboardSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-4xl font-black text-fundhub-dark tracking-tight">Updates</h1>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-xl border-2 border-gray-200/80 hover:border-gray-300 transition-all">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-bold text-gray-700">Filter</span>
                            </button>
                        </div>
                        <p className="text-gray-500 font-medium">
                            Stay informed about your campaigns and community activity
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-8">
                        {['all', 'success', 'warning', 'info'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === type
                                        ? 'bg-fundhub-dark text-white'
                                        : 'bg-white/40 backdrop-blur-md text-gray-600 hover:bg-white/60 border-2 border-gray-200/80'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Updates List */}
                    <div className="space-y-4">
                        {allUpdates.length > 0 ? (
                            allUpdates
                                .filter(update => filter === 'all' || update.type === filter)
                                .map((update, i) => (
                                    <UpdateCard key={i} update={update} />
                                ))
                        ) : (
                            <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-20 text-center border-2 border-gray-200/80">
                                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <Bell className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-3xl font-black text-fundhub-dark mb-4">No updates yet</h3>
                                <p className="text-gray-500 max-w-md mx-auto text-lg">
                                    You'll see notifications about your campaigns, milestones, and community activity here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Background Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
    );
};

export default Updates;
