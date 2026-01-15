import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreatorProfile } from '@/hooks/useCreatorProfile';
import { formatEther } from 'viem';
import Layout from '@/components/layout/Layout';
import CreatorProfileHeader from '@/components/creator-profile/CreatorProfileHeader';
import CreatorAbout from '@/components/creator-profile/CreatorAbout';
import ImpactSummary from '@/components/creator-profile/ImpactSummary';
import CampaignHistory from '@/components/creator-profile/CampaignHistory';
import TrustPanel from '@/components/creator-profile/TrustPanel';
import CommunityFeedback from '@/components/creator-profile/CommunityFeedback';
import Credentials from '@/components/creator-profile/Credentials';
import ImpactNFTs from '@/components/creator-profile/ImpactNFTs';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';

const CreatorProfile = () => {
    const { address } = useParams();
    const navigate = useNavigate();
    const creatorData = useCreatorProfile(address || '');

    if (!address) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-fundhub-light/30 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-700 font-bold text-xl">Invalid creator address</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (creatorData.isLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-fundhub-light/30 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-fundhub-primary mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading creator profile...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Transform campaign data for CampaignHistory component
    const transformedCampaigns = creatorData.campaigns.map(campaign => {
        const isCompleted = campaign.daysLeft === 0 || campaign.percentComplete >= 100;
        // Default milestone structure: Planning, Execution, Completion
        const totalMilestones = 3;
        const milestonesCompleted = isCompleted ? 3 : (campaign.percentComplete >= 50 ? 2 : 1);

        return {
            title: campaign.title,
            category: campaign.category || 'General',
            status: isCompleted ? 'Completed' as const : 'Active' as const,
            fundsRaised: `${campaign.raised.toFixed(4)} ${campaign.currency}`,
            milestonesCompleted,
            totalMilestones,
            slug: campaign.slug || campaign.id?.toString() || '0'
        };
    });

    // Calculate verification status
    const verification = {
        identity: creatorData.totalCampaigns > 0,
        ngo: creatorData.type === 'NGO',
        onChain: true
    };

    // Determine tier based on stats
    const getTier = (): 'Proven' | 'Trusted' | 'New' | 'Elite' => {
        if (creatorData.trustScore >= 90 && creatorData.completedCampaigns >= 10) return 'Elite';
        if (creatorData.trustScore >= 80 && creatorData.completedCampaigns >= 5) return 'Proven';
        if (creatorData.trustScore >= 60 && creatorData.completedCampaigns >= 2) return 'Trusted';
        return 'New';
    };

    // Mock data for features not yet implemented
    const mockTestimonials = creatorData.totalBackers > 0 ? [
        {
            donor: "Anonymous Backer",
            comment: "Great campaign with transparent milestone tracking.",
            date: "Recently",
            campaign: creatorData.campaigns[0]?.title || "Campaign"
        }
    ] : [];

    const mockCredentials = creatorData.type === 'NGO' ? [
        {
            type: 'NGO' as const,
            name: "Verified NGO Status",
            issuer: "On-chain Verification",
            date: new Date().getFullYear().toString()
        }
    ] : [];

    const mockNFTs = creatorData ? [
        {
            id: "early-adopter",
            title: "Early Adopter",
            description: "Joined FundHub during the pioneer phase",
            image: "/achievements/early_adopter.png",
            rarity: 'Common' as const,
            earnedDate: "On-chain"
        },
        ...(creatorData.completedCampaigns > 0 ? [
            {
                id: "campaign-creator",
                title: "Campaign Creator",
                description: `Successfully completed ${creatorData.completedCampaigns} campaign${creatorData.completedCampaigns > 1 ? 's' : ''}`,
                image: "/achievements/campaign_creator.png",
                rarity: 'Common' as const,
                earnedDate: "On-chain"
            }
        ] : []),
        ...(creatorData.totalRaisedUsd > 1000 ? [
            {
                id: "impact-maker",
                title: "Impact Maker",
                description: "Raised over $1,000 for social causes",
                image: "/achievements/impact_maker.png",
                rarity: 'Rare' as const,
                earnedDate: "On-chain"
            }
        ] : []),
        ...(creatorData.totalRaisedByCurrency['BTC'] > 0 ? [
            {
                id: "btc-pioneer",
                title: "BTC Pioneer",
                description: "Successfully launched Bitcoin-based campaigns",
                image: "/achievements/btc_pioneer.png",
                rarity: 'Legendary' as const,
                earnedDate: "On-chain"
            }
        ] : [])
    ] : [];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-fundhub-light/30 py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Profile Header */}
                    <CreatorProfileHeader
                        name={creatorData.name}
                        avatar={creatorData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                        type={creatorData.type}
                        location={creatorData.location || 'On-chain'}
                        creatorAddress={address}
                        verification={verification}
                        tier={getTier()}
                        trustScore={creatorData.trustScore}
                        onViewCampaigns={() => {
                            document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About */}
                            <CreatorAbout
                                bio={creatorData.bio || 'No bio provided yet.'}
                                focusAreas={creatorData.focusAreas}
                                yearsActive={creatorData.yearsActive}
                                socialLinks={{
                                    website: creatorData.website,
                                    twitter: creatorData.twitter,
                                    linkedin: creatorData.linkedin
                                }}
                            />

                            {/* Impact Summary */}
                            <ImpactSummary
                                totalRaised={creatorData.totalRaisedByCurrency}
                                totalReleased={creatorData.totalReleasedByCurrency}
                                totalRaisedUsd={creatorData.totalRaisedUsd}
                                totalReleasedUsd={creatorData.totalReleasedUsd}
                                campaignsCompleted={creatorData.completedCampaigns}
                                onTimeRate={95}
                                aiHighlights={[
                                    `${creatorData.totalCampaigns} total campaigns created`,
                                    `${creatorData.successRate}% success rate`,
                                    `${creatorData.totalBackers} total backers supported`
                                ]}
                            />

                            {/* Campaign History */}
                            <div id="campaigns">
                                <CampaignHistory
                                    campaigns={transformedCampaigns}
                                    onViewCampaign={(slug) => navigate(`/campaigns/${slug}`)}
                                />
                            </div>

                            {/* Community Feedback */}
                            {mockTestimonials.length > 0 && (
                                <CommunityFeedback testimonials={mockTestimonials} />
                            )}

                            {/* Impact NFTs */}
                            {mockNFTs.length > 0 && (
                                <ImpactNFTs nfts={mockNFTs} />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Trust Panel */}
                            <TrustPanel
                                verificationDetails={{
                                    identity: { verified: verification.identity, date: "On-chain" },
                                    ngo: { verified: verification.ngo, registrationNumber: creatorData.type === 'NGO' ? 'Verified' : undefined },
                                    onChain: { verified: true, contractAddress: `${address?.slice(0, 6)}...${address?.slice(-4)}` }
                                }}
                                escrowUsage={{
                                    totalCampaigns: creatorData.totalCampaigns,
                                    escrowProtected: creatorData.totalCampaigns
                                }}
                                disputes={0}
                                smartContractUrl={`https://sepolia.etherscan.io/address/${address}`}
                            />

                            {/* Credentials */}
                            {mockCredentials.length > 0 && (
                                <Credentials credentials={mockCredentials} />
                            )}

                            {/* System Metadata */}
                            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Profile Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">Active for {creatorData.yearsActive} year{creatorData.yearsActive !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="font-medium">Verified on-chain</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
                                    All data is publicly verifiable on the blockchain
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </Layout>
    );
};

export default CreatorProfile;
