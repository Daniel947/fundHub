import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Milestone {
    title: string;
    fundingPercentage: bigint;
    description: string;
    released: boolean;
}

interface MilestoneTimelineProps {
    milestones: Milestone[];
    goal: number;
    currency: string;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones, goal, currency }) => {
    return (
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-fundhub-primary before:via-gray-200 before:to-transparent">
            {milestones.map((milestone, index) => {
                const milestoneAmount = (goal * Number(milestone.fundingPercentage)) / 100;
                const isNext = index === 0 || milestones[index - 1].released;

                return (
                    <div key={index} className="relative flex items-start gap-10 group">
                        {/* Milestone Indicator Node */}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${milestone.released
                                    ? 'bg-green-500 scale-100'
                                    : isNext
                                        ? 'bg-fundhub-primary scale-100 animate-pulse'
                                        : 'bg-gray-200 scale-75'
                                }`} />
                            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                                {milestone.released ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <div className={`h-2 w-2 rounded-full ${isNext ? 'bg-fundhub-primary' : 'bg-gray-300'}`} />
                                )}
                            </div>
                        </div>

                        {/* Milestone Content Card */}
                        <div className={`flex-1 glass-card rounded-[2rem] p-8 border transition-all duration-500 ${milestone.released
                                ? 'border-green-500/20 bg-green-500/5'
                                : isNext
                                    ? 'border-fundhub-primary/30 shadow-xl shadow-fundhub-primary/5'
                                    : 'border-white/40 opacity-70'
                            }`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-fundhub-dark tracking-tight">{milestone.title}</h3>
                                        <div className="px-3 py-1 bg-fundhub-dark/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-fundhub-dark/5">
                                            Phase {index + 1}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-fundhub-primary uppercase tracking-[0.2em]">{milestone.fundingPercentage.toString()}% Funding Allocation</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-lg font-black text-fundhub-dark tracking-tighter">
                                        {milestoneAmount.toLocaleString()} <span className="text-xs text-gray-400 font-bold uppercase">{currency}</span>
                                    </div>
                                    {milestone.released ? (
                                        <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">
                                            <Unlock className="w-3 h-3" /> Disbursed
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-1 ${isNext ? 'text-fundhub-primary' : 'text-gray-400'}`}>
                                            <Lock className="w-3 h-3" /> Secured in Escrow
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-500 font-medium leading-relaxed mb-6">
                                {milestone.description}
                            </p>

                            <div className="pt-6 border-t border-fundhub-dark/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Pool Active</span>
                                </div>
                                {milestone.released && (
                                    <div className="px-3 py-1 bg-green-500/10 rounded-lg text-[8px] font-black text-green-600 uppercase tracking-widest border border-green-500/10">
                                        TX Confirmed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MilestoneTimeline;
