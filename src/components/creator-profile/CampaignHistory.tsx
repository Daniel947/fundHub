import React, { useState } from 'react';
import { CheckCircle, Clock, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Campaign {
    title: string;
    category: string;
    status: 'Active' | 'Completed';
    fundsRaised: string;
    milestonesCompleted: number;
    totalMilestones: number;
    slug: string;
}

interface CampaignHistoryProps {
    campaigns: Campaign[];
    onViewCampaign: (slug: string) => void;
}

const CampaignHistory = ({ campaigns, onViewCampaign }: CampaignHistoryProps) => {
    const [filter, setFilter] = useState<'all' | 'Active' | 'Completed'>('all');

    const filteredCampaigns = campaigns.filter(c =>
        filter === 'all' || c.status === filter
    );

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-fundhub-dark mb-2">Campaign History</h2>
                    <p className="text-sm text-gray-500 font-medium">Verified track record of campaigns</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {(['all', 'Active', 'Completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === status
                                ? 'bg-fundhub-dark text-white'
                                : 'bg-white/40 backdrop-blur-md text-gray-600 hover:bg-white/60 border-2 border-gray-200/80'
                                }`}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign, i) => (
                    <div
                        key={i}
                        className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80 hover:border-gray-300 transition-all cursor-pointer"
                        onClick={() => onViewCampaign(campaign.slug)}
                    >
                        {/* Status & Category */}
                        <div className="flex items-center justify-between mb-4">
                            <Badge className={`${campaign.status === 'Completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                } border-2 font-black`}>
                                {campaign.status}
                            </Badge>
                            <span className="text-xs font-bold text-gray-500 uppercase">{campaign.category}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black text-fundhub-dark mb-4 line-clamp-2">
                            {campaign.title}
                        </h3>

                        {/* Stats */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Funds Raised</span>
                                <span className="text-lg font-black text-fundhub-primary">{campaign.fundsRaised}</span>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span
                                        className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-help"
                                        title="Default 3-phase structure: Planning → Execution → Completion. Progress based on funding percentage."
                                    >
                                        Milestones
                                    </span>
                                    <span className="text-sm font-black text-fundhub-dark">
                                        {campaign.milestonesCompleted}/{campaign.totalMilestones}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-fundhub-primary to-fundhub-secondary transition-all"
                                        style={{ width: `${(campaign.milestonesCompleted / campaign.totalMilestones) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {campaign.status === 'Completed' && (
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-green-700">Campaign Successfully Completed</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredCampaigns.length === 0 && (
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border-2 border-gray-200/80 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No campaigns found</p>
                </div>
            )}
        </div>
    );
};

export default CampaignHistory;
