import React from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface ImpactSummaryProps {
    totalRaised: Record<string, number>;
    totalReleased: Record<string, number>;
    totalRaisedUsd: number;
    totalReleasedUsd: number;
    campaignsCompleted: number;
    onTimeRate: number;
    aiHighlights?: string[];
}

const formatCurrencyStats = (stats: Record<string, number>) => {
    return Object.entries(stats)
        .filter(([_, val]) => val > 0)
        .map(([symbol, value]) => {
            return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol}`;
        });
};

const StatCard = ({ icon: Icon, label, value, sublabel }: any) => (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border-2 border-gray-200/80 hover:border-fundhub-primary/30 transition-all group flex flex-col h-full min-h-[160px]">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-fundhub-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Icon className="w-5 h-5 text-fundhub-primary" />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
        </div>

        <div className="flex-grow flex flex-col justify-start">
            <div className="text-2xl font-black text-fundhub-dark mb-2">{value}</div>

            {sublabel && (
                <div className="space-y-1 mt-1 border-t border-gray-100 pt-2">
                    {Array.isArray(sublabel) ? (
                        sublabel.length > 0 ? (
                            sublabel.map((s, i) => (
                                <div key={i} className="text-[11px] font-bold text-gray-500 leading-tight uppercase tracking-tight">
                                    {s}
                                </div>
                            ))
                        ) : (
                            <div className="text-[11px] font-bold text-gray-400 italic">No funds recorded</div>
                        )
                    ) : (
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{sublabel}</div>
                    )}
                </div>
            )}
        </div>
    </div>
);

const ImpactSummary = ({
    totalRaised,
    totalReleased,
    totalRaisedUsd,
    totalReleasedUsd,
    campaignsCompleted,
    onTimeRate,
    aiHighlights
}: ImpactSummaryProps) => {
    return (
        <div className="mb-8">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-fundhub-dark mb-2">Impact Summary</h2>
                <p className="text-sm text-gray-500 font-medium">Verified track record and historical performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    icon={DollarSign}
                    label="Total Raised"
                    value={`$${totalRaisedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    sublabel={formatCurrencyStats(totalRaised)}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Funds Released"
                    value={`$${totalReleasedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    sublabel={formatCurrencyStats(totalReleased)}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Campaigns"
                    value={campaignsCompleted}
                    sublabel="Successfully completed"
                />
                <StatCard
                    icon={Clock}
                    label="On-Time Rate"
                    value={`${onTimeRate}%`}
                    sublabel="Milestone completion"
                />
            </div>

            {/* AI Highlights */}
            {aiHighlights && aiHighlights.length > 0 && (
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="px-2 py-1 bg-purple-100 rounded text-xs font-black text-purple-700">
                            AI-ASSISTED
                        </div>
                        <h3 className="text-lg font-black text-fundhub-dark">Impact Highlights</h3>
                    </div>
                    <ul className="space-y-2">
                        {aiHighlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                <span className="font-medium">{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ImpactSummary;
