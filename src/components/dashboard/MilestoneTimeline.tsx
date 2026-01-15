import React from 'react';
import { Lock, Clock, CheckCircle2, Send, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
    id: number;
    title: string;
    description: string;
    status: 'locked' | 'submitted' | 'released' | 'upcoming';
    date: string;
    funding?: string;
    progress?: string;
    isFunded?: boolean;
}

const statusConfig = {
    locked: { icon: Lock, color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Locked' },
    submitted: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Submitted' },
    released: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Released' },
    upcoming: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Upcoming' },
};

const MilestoneCard = ({
    milestone,
    onRelease,
    isReleasing
}: {
    milestone: Milestone;
    onRelease?: (index: number) => void;
    isReleasing?: boolean;
}) => {
    const config = statusConfig[milestone.status];
    const Icon = config.icon;

    return (
        <div className="flex-shrink-0 w-64 group">
            <div className="flex items-center mb-4">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-all duration-300 group-hover:scale-110 shadow-sm",
                    config.color,
                    config.border
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-grow h-1 bg-gray-100 relative -ml-1">
                    <div className={cn(
                        "absolute inset-0 transition-all duration-1000",
                        milestone.status === 'released' ? 'bg-green-400' :
                            milestone.status === 'submitted' ? 'bg-blue-400' : 'bg-gray-200'
                    )} />
                </div>
            </div>

            <div className="space-y-2 pr-6">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Milestone {milestone.id}</span>
                    {milestone.status === 'upcoming' && onRelease && (
                        <button
                            onClick={() => onRelease(milestone.id - 1)}
                            disabled={isReleasing || !milestone.isFunded}
                            className={cn(
                                "text-[10px] font-black flex items-center gap-0.5 transition-all",
                                milestone.isFunded
                                    ? "text-fundhub-primary hover:underline"
                                    : "text-gray-400 cursor-not-allowed opacity-70"
                            )}
                            title={!milestone.isFunded ? "Wait for more funding to release this milestone" : ""}
                        >
                            {isReleasing ? 'Releasing...' : milestone.isFunded ? 'Release Funds' : 'Raising Funds'} <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <h4 className="text-sm font-black text-fundhub-dark leading-tight">{milestone.title}</h4>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border", config.bg, config.color, config.border)}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </div>
                    {milestone.status === 'upcoming' && (
                        <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                            milestone.isFunded ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"
                        )}>
                            {milestone.isFunded ? 'Fully Funded' : 'Raising'}
                        </div>
                    )}
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/40 shadow-sm space-y-2 mt-2">
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        {milestone.description}
                    </p>
                    <div className="flex flex-col gap-1 pt-1 border-t border-white/40">
                        <span className="text-[10px] font-bold text-fundhub-dark">
                            {milestone.status === 'released' ? 'Funds Released:' : 'Due:'}
                            <span className="text-gray-500 ml-1">{milestone.date}</span>
                        </span>
                        {milestone.funding && (
                            <span className="text-[10px] font-bold text-fundhub-dark">
                                Funding: <span className="text-fundhub-primary ml-1">{milestone.funding}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MilestoneTimelineProps {
    milestones: Milestone[];
    onRelease?: (index: number) => void;
    onWithdrawSurplus?: () => void;
    isReleasing?: boolean;
    allMilestonesReleased?: boolean;
    isOverfunded?: boolean;
    campaigns?: any[];
    selectedCampaignId?: string | null;
    onSelectCampaign?: (id: string) => void;
}

const MilestoneTimeline = ({
    milestones,
    onRelease,
    onWithdrawSurplus,
    isReleasing,
    allMilestonesReleased,
    isOverfunded,
    campaigns = [],
    selectedCampaignId,
    onSelectCampaign
}: MilestoneTimelineProps) => {
    return (
        <section className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black text-fundhub-dark flex items-center gap-2">
                        Milestone Management
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Track progress & release funds
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {campaigns.length > 1 && onSelectCampaign && (
                        <select
                            value={selectedCampaignId || ''}
                            onChange={(e) => onSelectCampaign(e.target.value)}
                            className="bg-white/60 backdrop-blur-sm border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-fundhub-dark focus:outline-none focus:border-fundhub-primary/40 transition-all cursor-pointer shadow-sm"
                        >
                            {campaigns.map(c => (
                                <option key={c.internalId} value={c.internalId}>
                                    {c.title.slice(0, 20)}{c.title.length > 20 ? '...' : ''}
                                </option>
                            ))}
                        </select>
                    )}

                    {allMilestonesReleased && isOverfunded && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <button
                                onClick={onWithdrawSurplus}
                                disabled={isReleasing}
                                className="btn-gradient px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-fundhub-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {isReleasing ? 'Withdrawing...' : 'Withdraw Surplus'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {allMilestonesReleased && isOverfunded && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-4 items-center animate-in zoom-in-95 duration-500">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-green-700 uppercase tracking-widest">Goal Exceeded! 🎉</div>
                        <div className="text-xs text-green-600 font-medium leading-tight">
                            All milestones are cleared. You can now withdraw the excess funds raised during this campaign.
                        </div>
                    </div>
                </div>
            )}

            {milestones.length > 0 ? (
                <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                    {milestones.map((m, i) => (
                        <MilestoneCard
                            key={i}
                            milestone={m}
                            onRelease={onRelease}
                            isReleasing={isReleasing}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold">No milestones found for this campaign.</p>
                </div>
            )}
        </section>
    );
};

export default MilestoneTimeline;
