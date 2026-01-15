import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import TrustPanel from '@/components/campaign-detail/TrustPanel';
import { CommunityTab } from '@/components/campaign-detail/CommunityTab';
import { BackersTab } from '@/components/campaign-detail/BackersTab';
import DonationSidebar from '@/components/campaign-detail/DonationSidebar';
import MilestoneTimeline from '@/components/campaign-detail/MilestoneTimeline';
import { Users, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useCampaignDetail } from '@/hooks/useCampaignDetail';

const CampaignDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const {
    campaign,
    milestones,
    creatorVerified,
    aiTrustScore,
    isEscrowLocked,
    totalLockedInEscrow,
    totalPledged, // [NEW] Added for real-time BTC support
    backerCount,
    btcAddress,
    backers, // [NEW] Destructure updated list
    isLoading,
    exists,
    refetch
  } = useCampaignDetail(slug);

  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['story', 'milestones', 'community', 'backers'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleDonate = (amount: string) => {
    toast({
      title: "Initiating Transaction",
      description: `Please confirm donation of ${amount} ${campaign?.currency} in your wallet.`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-fundhub-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium font-inter">Loading Project Details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!exists || !campaign) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
          <div className="glass-card rounded-[3rem] p-12 text-center max-w-lg">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-fundhub-dark mb-4">Project Not Found</h2>
            <p className="text-gray-500 mb-8">The campaign you are looking for does not exist or has been removed from the registry.</p>
            <Link to="/campaigns">
              <Button size="lg" className="btn-gradient px-10 shadow-xl shadow-fundhub-primary/20">
                Browse Active Projects
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#f8fafc] min-h-screen pb-24 font-inter">
        {/* Background Decorative Blurs */}
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Hero Section - Premium Glass Layout */}
        <div className="relative pt-12 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Breadcrumbs & Category */}
              <div className="flex flex-wrap items-center gap-4 animate-fade-in">
                <Link to="/campaigns" className="text-xs font-bold text-gray-400 hover:text-fundhub-primary transition-colors flex items-center gap-2">
                  CAMPAIGNS <span className="text-[10px] text-gray-300">/</span>
                </Link>
                <div className="px-3 py-1 bg-white/60 backdrop-blur-md rounded-full border border-white/40 text-[10px] font-black text-fundhub-primary uppercase tracking-widest shadow-sm">
                  {campaign.category}
                </div>
              </div>

              {/* Title & Creator */}
              <div className="space-y-4 animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-black text-fundhub-dark leading-[1.1] tracking-tight">
                  {campaign.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    to={`/creator/${campaign.creator}`}
                    className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-sm hover:border-fundhub-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fundhub-primary to-fundhub-secondary flex items-center justify-center text-white font-black text-lg shadow-inner">
                      {campaign.creator.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Created By</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-fundhub-dark">{campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
                        {creatorVerified && (
                          <img
                            src="/images/verified-badge.png"
                            alt="Verified"
                            className="w-4 h-4 object-contain"
                            title="Verified Creator"
                          />
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-fundhub-primary" />
                      <span>{backerCount} Backers</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>ON {campaign.network === 'ethereum' ? 'SEPOLIA' : campaign.network === 'btc' ? 'BITCOIN' : 'SONIC BLAZE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Gallery (Integrated Hero) */}
              <div className="relative group rounded-[3rem] overflow-hidden shadow-2xl shadow-fundhub-primary/10 border-4 border-white/60 aspect-video lg:aspect-[21/9] animate-fade-in-up">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fundhub-dark/80 via-transparent to-transparent flex items-end p-8 md:p-12">
                  <div className="max-w-3xl space-y-4">
                    <p className="text-xl md:text-2xl text-white font-medium italic opacity-90 leading-relaxed">
                      "Empowering transparency through {campaign.currency} escrow and multi-network trust architecture."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Details & Evidence */}
            <div className="lg:col-span-8 space-y-12">

              {/* Trust Panel (Redesigned as Safety Brief) */}
              <TrustPanel
                contractAddress={campaign.internalId}
                network={campaign.network}
                creatorVerified={creatorVerified}
                aiTrustScore={aiTrustScore}
                isEscrowLocked={isEscrowLocked}
              />

              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 mb-8 inline-flex h-auto">
                  <TabsTrigger
                    value="story"
                    className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-fundhub-dark data-[state=active]:text-white transition-all"
                  >
                    The Story
                  </TabsTrigger>
                  <TabsTrigger
                    value="milestones"
                    className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-fundhub-dark data-[state=active]:text-white transition-all"
                  >
                    Escrow & Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="community"
                    className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-fundhub-dark data-[state=active]:text-white transition-all"
                  >
                    Interaction
                  </TabsTrigger>
                  <TabsTrigger
                    value="backers"
                    className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-fundhub-dark data-[state=active]:text-white transition-all"
                  >
                    Backers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="font-inter animate-fade-in">
                  <div className="glass-card rounded-[2.5rem] p-10 border-2 border-gray-200/80">
                    <h3 className="text-2xl font-black text-fundhub-dark mb-6">Mission & Vision</h3>
                    <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-[1.8] whitespace-pre-wrap">
                      {campaign.description}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-8 animate-fade-in">
                  <div className="premium-glass rounded-[2rem] p-8 border-2 border-gray-200/80 border-l-8 border-l-fundhub-primary flex gap-6 items-center">
                    <div className="w-16 h-16 bg-fundhub-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <FileText className="w-8 h-8 text-fundhub-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-fundhub-dark">Programmable Trust</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Funds are held in high-security escrow contracts. Each release requires proof-of-work verification on {campaign.network === 'ethereum' ? 'Sepolia' : campaign.network === 'btc' ? 'Bitcoin' : 'Sonic'}.
                      </p>
                      <div className="mt-2 text-xs font-black text-fundhub-primary uppercase tracking-widest flex items-center gap-2">
                        Currently Secured: {totalLockedInEscrow} {campaign.currency}
                      </div>
                    </div>
                  </div>
                  <MilestoneTimeline milestones={milestones} goal={campaign.goal} currency={campaign.currency} />
                </TabsContent>

                <TabsContent value="community" className="animate-fade-in">
                  <CommunityTab
                    campaignId={campaign.internalId}
                    currency={campaign.currency}
                    creator={campaign.creator}
                    network={campaign.network}
                  />
                </TabsContent>

                <TabsContent value="backers" className="animate-fade-in">
                  <BackersTab
                    campaignId={campaign.internalId}
                    currency={campaign.currency}
                    network={campaign.network as 'sonic' | 'ethereum'}
                    backers={backers}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column: Donation Sidebar (Glass) */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
              <DonationSidebar
                campaignId={campaign.internalId}
                currency={campaign.currency}
                network={campaign.network as any}
                daysLeft={campaign.daysLeft}
                raised={totalPledged}
                goal={campaign.goal}
                btcAddress={btcAddress}
                onDonate={handleDonate}
                onSuccess={refetch}
              />
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetail;
