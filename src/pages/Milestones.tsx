import React, { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useMilestoneManagement } from '@/hooks/useMilestoneManagement';
import { CAMPAIGN_MANAGER_ABI, CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_SEPOLIA_ADDRESS } from '@/lib/abi';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Lock, Clock, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
    locked: { icon: Lock, color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Locked' },
    submitted: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Submitted' },
    released: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Released' },
    upcoming: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Upcoming' },
};

const MilestoneCard = ({ milestone, campaignTitle, onRelease, isReleasing }: any) => {
    const config = statusConfig[milestone.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                    config.color,
                    config.bg,
                    config.border
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    config.color,
                    config.bg
                )}>
                    {config.label}
                </span>
            </div>

            <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {campaignTitle}
                </div>
                <h3 className="text-xl font-black text-fundhub-dark mb-2">{milestone.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs">
                    <span className="text-gray-400 font-bold">Funding: </span>
                    <span className="text-fundhub-primary font-black">{milestone.funding}</span>
                </div>
                {milestone.status === 'upcoming' && onRelease && (
                    <button
                        onClick={() => onRelease(milestone.id - 1)}
                        disabled={isReleasing}
                        className="text-xs font-black text-fundhub-primary hover:underline disabled:opacity-50"
                    >
                        Release Funds
                    </button>
                )}
            </div>
        </div>
    );
};

const Milestones = () => {
    const { campaigns, isLoading } = useCreatorDashboard();
    const activeCampaign = useMemo(() => campaigns[0], [campaigns]);

    const {
        releaseMilestone,
        isReleasing
    } = useMilestoneManagement(
        activeCampaign?.internalId || '',
        activeCampaign?.currency || 'ETH',
        activeCampaign?.network || 'sonic'
    );

    const { data: milestonesRaw } = useReadContract({
        address: activeCampaign?.network === 'ethereum' ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getMilestones',
        args: activeCampaign ? [activeCampaign.internalId as `0x${string}`] : undefined,
        query: {
            enabled: !!activeCampaign,
        }
    });

    const milestones = useMemo(() => {
        if (!milestonesRaw) return [];
        return (milestonesRaw as any[]).map((ms, idx) => {
            const status = ms.released ? 'released' : (idx === 0 || (milestonesRaw as any[])[idx - 1].released) ? 'upcoming' : 'locked';
            return {
                id: idx + 1,
                title: ms.title,
                description: ms.description,
                status: status as 'released' | 'upcoming' | 'locked',
                date: 'Scheduled',
                funding: `${ms.fundingPercentage}% of total`
            };
        });
    }, [milestonesRaw]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading milestones...</p>
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
                        <h1 className="text-4xl font-black text-fundhub-dark tracking-tight mb-2">Milestone Management</h1>
                        <p className="text-gray-500 font-medium">
                            Track and release milestone-based funding for your campaigns
                        </p>
                    </div>

                    {/* Active Campaign Info */}
                    {activeCampaign && (
                        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Campaign</div>
                                    <div className="text-lg font-black text-fundhub-dark">{activeCampaign.title}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestones Grid */}
                    {milestones.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {milestones.map((milestone, i) => (
                                <MilestoneCard
                                    key={i}
                                    milestone={milestone}
                                    campaignTitle={activeCampaign?.title || 'Campaign'}
                                    onRelease={releaseMilestone}
                                    isReleasing={isReleasing}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-20 text-center border-2 border-gray-200/80">
                            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <AlertCircle className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-3xl font-black text-fundhub-dark mb-4">No milestones found</h3>
                            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg">
                                {activeCampaign
                                    ? "This campaign doesn't have any milestones set up yet."
                                    : "Create a campaign with milestones to manage funding releases."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Background Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
    );
};

export default Milestones;
