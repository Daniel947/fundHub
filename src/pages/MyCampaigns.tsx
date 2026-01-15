import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { Plus, Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import CampaignCard from '@/components/dashboard/CampaignCard';

const MyCampaigns = () => {
    const navigate = useNavigate();
    const { campaigns, isLoading } = useCreatorDashboard();

    const formatCryptoAmount = (amount: number) => {
        if (amount === 0) return '0';
        if (amount < 0.0001) return amount.toExponential(2);
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: amount < 1 ? 6 : 4
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <DashboardSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading your campaigns...</p>
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
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-4xl font-black text-fundhub-dark tracking-tight">My Campaigns</h1>
                            <button
                                onClick={() => navigate('/create')}
                                className="btn-gradient px-6 py-3 rounded-xl font-bold shadow-lg shadow-fundhub-primary/30 hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Campaign
                            </button>
                        </div>
                        <p className="text-gray-500 font-medium">
                            Manage and monitor all your fundraising campaigns
                        </p>
                    </div>

                    {/* Campaigns Grid */}
                    {campaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {campaigns.map((campaign, i) => (
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
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-20 text-center border-2 border-gray-200/80">
                            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Plus className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-3xl font-black text-fundhub-dark mb-4">No campaigns yet</h3>
                            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg">
                                Start your fundraising journey by creating your first campaign and bringing your vision to life.
                            </p>
                            <button
                                onClick={() => navigate('/create')}
                                className="btn-gradient px-12 py-5 rounded-xl font-black text-lg shadow-xl shadow-fundhub-primary/30 hover:shadow-2xl transition-all"
                            >
                                Create Your First Campaign
                            </button>
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

export default MyCampaigns;
