import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { formatUnits } from 'viem';
import { Plus, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGN_MANAGER_ABI, CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_SEPOLIA_ADDRESS, FUND_ESCROW_ABI, FUND_ESCROW_ADDRESS, FUND_ESCROW_SEPOLIA_ADDRESS } from '@/lib/abi';
import { getTokenBySymbol } from '@/lib/tokens';

// New Components
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CampaignCard from '@/components/dashboard/CampaignCard';
import MilestoneTimeline from '@/components/dashboard/MilestoneTimeline';
import AlertsFeed from '@/components/dashboard/AlertsFeed';

import { useMilestoneManagement } from '@/hooks/useMilestoneManagement';

const Dashboard = () => {
    const navigate = useNavigate();
    const { campaigns, stats, activities, profile, isLoading, address } = useCreatorDashboard();
    const { sonic: sonicPrice, ethereum: ethPrice } = useTokenPrice();
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

    // Initialize active campaign once data loads
    useEffect(() => {
        if (campaigns.length > 0 && !activeCampaignId) {
            setActiveCampaignId(campaigns[0].internalId);
        }
    }, [campaigns]);

    // Select the campaign for focus
    const activeCampaign = useMemo(() => {
        if (!activeCampaignId) return campaigns[0];
        return campaigns.find(c => c.internalId === activeCampaignId) || campaigns[0];
    }, [activeCampaignId, campaigns]);

    const {
        releaseMilestone,
        withdrawSurplus,
        isReleasing
    } = useMilestoneManagement(
        activeCampaign?.internalId || '',
        activeCampaign?.currency || 'ETH',
        activeCampaign?.network || 'sonic'
    );

    const isOverfunded = activeCampaign && activeCampaign.raised > activeCampaign.goal;

    const { data: milestonesRaw } = useReadContract({
        address: activeCampaign?.network === 'ethereum' ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getMilestones',
        args: activeCampaign ? [activeCampaign.internalId as `0x${string}`] : undefined,
        query: {
            enabled: !!activeCampaign,
        }
    });

    const activeTokenInfo = getTokenBySymbol(activeCampaign?.currency || 'ETH', activeCampaign?.network || 'sonic');
    const activeTokenAddr = activeTokenInfo?.address || '0x0000000000000000000000000000000000000000';

    const { data: lockedBalanceRaw } = useReadContract({
        address: activeCampaign?.network === 'ethereum' ? FUND_ESCROW_SEPOLIA_ADDRESS : FUND_ESCROW_ADDRESS,
        abi: FUND_ESCROW_ABI,
        functionName: 'lockedFunds',
        args: activeCampaign ? [activeCampaign.internalId as `0x${string}`, activeTokenAddr as `0x${string}`] : undefined,
        query: {
            enabled: !!activeCampaign,
            refetchInterval: 10000,
        }
    });

    const lockedBalance = lockedBalanceRaw ? parseFloat(formatUnits(BigInt(lockedBalanceRaw as string), activeTokenInfo?.decimals || 18)) : 0;

    const calculateDashboardTrustScore = () => {
        if (!activeCampaign) return 0;
        let score = 50; // Base score for having an active campaign

        // Add verification bonus if profile exists (meaning they've set it up)
        if (profile) score += 10;

        // Add more based on milestones
        if (milestones.length >= 3) score += 15;
        else if (milestones.length >= 1) score += 5;

        // Add based on activity
        if (activities.length > 5) score += 20;
        else if (activities.length > 0) score += 10;

        return Math.min(100, score);
    };

    const formatCryptoAmount = (amount: number) => {
        if (amount === 0) return '0';
        if (amount < 0.0001) return amount.toExponential(2);
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: amount < 1 ? 6 : 4
        });
    };

    const milestones = useMemo(() => {
        if (!milestonesRaw) return [];
        let cumulativeFundingRequired = 0;

        return (milestonesRaw as any[]).map((ms, idx) => {
            const status = ms.released ? 'released' : (idx === 0 || (milestonesRaw as any[])[idx - 1].released) ? 'upcoming' : 'locked';

            // Calculate if this milestone is funded based on goal and escrow balance
            const milestoneFundingGoal = (activeCampaign?.goal || 0) * (Number(ms.fundingPercentage) / 100);
            cumulativeFundingRequired += milestoneFundingGoal;

            // Note: Since 'lockedBalance' is what's CURRENTLY in escrow, 
            // the check should be: is (lockedBalance + alreadyReleasedFunds) >= cumulativeFundingRequired
            // But a simpler check is often: is milestoneFundingGoal <= lockedBalance (for the current upcoming one)
            const isFunded = status === 'released' || (status === 'upcoming' && lockedBalance >= milestoneFundingGoal);

            return {
                id: idx + 1,
                title: ms.title,
                description: ms.description,
                status: status as 'released' | 'upcoming' | 'locked',
                date: 'Scheduled',
                funding: `${ms.fundingPercentage}% of total`,
                isFunded
            };
        });
    }, [milestonesRaw, lockedBalance, activeCampaign]);

    const allMilestonesReleased = milestones.length > 0 && milestones.every(m => m.status === 'released');

    const calculateTotalUSD = () => {
        return stats.totals.reduce((acc, t) => {
            const price = t.network === 'sonic' ? sonicPrice : ethPrice;

            // Decimal-aware calculation
            const tokenSymbol = t.token.toUpperCase();
            const tokenInfo = getTokenBySymbol(tokenSymbol, t.network as any);
            const decimals = tokenInfo?.decimals || 18;

            const amount = parseFloat(formatUnits(BigInt(t.raised), decimals));
            return acc + (amount * (price || 0));
        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getPrimaryTokenTotal = () => {
        if (stats.totals.length === 0) return '0 ETH';
        const t = stats.totals[0];
        const val = parseFloat(formatUnits(BigInt(t.raised), 18));
        return `${formatCryptoAmount(val)} ${t.network === 'sonic' ? 'S' : 'ETH'}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-fundhub-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium font-inter">Initializing Glass Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-inter font-medium selection:bg-fundhub-primary/10">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-10">

                    {/* Header Section */}
                    <DashboardHeader
                        address={address || ''}
                        totalRaisedUSD={calculateTotalUSD()}
                        totalRaisedToken={getPrimaryTokenTotal()}
                        totalBackers={stats.totalBackers}
                        trustScore={calculateDashboardTrustScore()}
                        profile={profile}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Left Column: Campaigns & Timeline */}
                        <div className="xl:col-span-2 space-y-10">

                            {/* Campaigns Grid */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-fundhub-dark">Active Campaigns</h3>
                                    <button
                                        onClick={() => navigate('/campaigns')}
                                        className="text-sm font-bold text-fundhub-primary flex items-center gap-1 hover:underline"
                                    >
                                        View All Campaigns <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {campaigns.length > 0 ? (
                                        campaigns.map((campaign, i) => (
                                            <CampaignCard
                                                key={i}
                                                title={campaign.title}
                                                categories={[campaign.category || 'General']}
                                                percentComplete={campaign.percentComplete}
                                                raised={formatCryptoAmount(campaign.raised)}
                                                goal={formatCryptoAmount(campaign.goal)}
                                                daysLeft={campaign.daysLeft}
                                                currency={campaign.currency}
                                                onViewDetails={() => navigate(`/campaigns/${campaign.slug}`)}
                                                onManage={() => navigate(`/campaigns/${campaign.slug}`)}
                                                onWithdraw={() => navigate(`/campaigns/${campaign.slug}?tab=milestones`)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 bg-white/40 backdrop-blur-md rounded-[3rem] p-16 text-center border-2 border-gray-200/80">
                                            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Plus className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-2xl font-black text-fundhub-dark mb-3">No active campaigns</h3>
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your journey hasn't started yet. Create a campaign to power your vision.</p>
                                            <button
                                                onClick={() => navigate('/create')}
                                                className="btn-gradient px-10 py-4 shadow-xl shadow-fundhub-primary/20"
                                            >
                                                Launch First Campaign
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Milestone Management Section */}
                            <MilestoneTimeline
                                milestones={milestones}
                                onRelease={releaseMilestone}
                                onWithdrawSurplus={withdrawSurplus}
                                isReleasing={isReleasing}
                                allMilestonesReleased={allMilestonesReleased}
                                isOverfunded={isOverfunded}
                                campaigns={campaigns}
                                selectedCampaignId={activeCampaignId}
                                onSelectCampaign={setActiveCampaignId}
                            />
                        </div>

                        {/* Right Column: Alerts Feed & Insights */}
                        <div className="space-y-10 flex flex-col">
                            <div className="flex-grow">
                                <AlertsFeed activities={activities} />
                            </div>

                            {/* AI Insights / Pro Card */}
                            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fundhub-primary/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                        <TrendingUp className="w-6 h-6 text-fundhub-primary" />
                                    </div>
                                    <h4 className="text-xl font-black text-fundhub-dark mb-2">Grow your impact</h4>
                                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                        Creators with verified Trust Scores see <span className="text-fundhub-primary font-bold">40% higher</span> reaching on their campaigns.
                                    </p>
                                    <button className="w-full py-4 bg-fundhub-dark text-white rounded-2xl font-black text-sm shadow-xl shadow-fundhub-dark/20 hover:bg-black hover:translate-y-[-2px] active:translate-y-[1px] transition-all">
                                        Get Pro Creator Badge
                                    </button>
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

export default Dashboard;
