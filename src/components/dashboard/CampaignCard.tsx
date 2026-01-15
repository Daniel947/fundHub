import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CampaignCardProps {
    title: string;
    categories: string[];
    percentComplete: number;
    raised: string;
    goal: string;
    daysLeft: number;
    currency: string;
    onViewDetails?: () => void;
    onManage?: () => void;
    onWithdraw?: () => void;
}

const CampaignCard = ({
    title,
    categories,
    percentComplete,
    raised,
    goal,
    daysLeft,
    currency,
    onViewDetails,
    onManage,
    onWithdraw
}: CampaignCardProps) => {
    const isSuccess = percentComplete >= 100;

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80 card-hover flex flex-col h-full">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat, i) => (
                    <Badge key={i} className="bg-white/50 text-gray-600 border-white/40 font-bold hover:bg-white/70">
                        {cat}
                    </Badge>
                ))}
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-fundhub-dark mb-6 leading-tight flex-grow">
                {title}
            </h3>

            {/* Progress */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-fundhub-dark">{percentComplete}% Funded</span>
                    {isSuccess && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            Campaign Successful
                        </span>
                    )}
                </div>
                <div className="h-3 bg-white/40 rounded-full overflow-hidden border border-white/40">
                    <div
                        className="h-full bg-gradient-to-r from-fundhub-primary to-fundhub-secondary transition-all duration-1000"
                        style={{ width: `${percentComplete}%` }}
                    />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                    <span><span className="text-fundhub-dark">{raised} {currency}</span> raised of {goal} {currency} goal</span>
                    <span>{daysLeft} Days Left</span>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="rounded-xl border-white/40 bg-white/30 hover:bg-white/50 hover:border-2 hover:border-gray-300 text-fundhub-dark font-bold py-6 shadow-sm transition-all"
                    onClick={onViewDetails}
                >
                    View Details
                </Button>
                {isSuccess ? (
                    <Button
                        className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold py-6 shadow-lg shadow-green-500/20"
                        onClick={onWithdraw}
                    >
                        Withdraw Funds
                    </Button>
                ) : (
                    <Button
                        className="rounded-xl bg-fundhub-dark hover:bg-black text-white font-bold py-6 shadow-lg shadow-fundhub-dark/20"
                        onClick={onManage}
                    >
                        Manage
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CampaignCard;
