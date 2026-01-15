import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Heart, Gift } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePriceFeed } from '@/hooks/usePriceFeed';

const HeroSection = () => {
  const { campaigns } = useCampaigns();
  const { convertToUSD, prices } = usePriceFeed();

  // Find a feature-worthy campaign (e.g., active, has funds, or just the newest)
  const featuredCampaign = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;
    // Prefer one with some funding progress, otherwise the first active one
    return campaigns.find(c => c.percentComplete > 0 && c.percentComplete < 100) || campaigns[0];
  }, [campaigns]);

  // Calculate dynamic metrics
  const stats = useMemo(() => {
    if (!campaigns || !prices) return { active: 0, raised: 0 };

    const active = campaigns.filter(c => c.daysLeft > 0).length;

    const raised = campaigns.reduce((acc, c) => {
      const price = prices[c.currency?.toUpperCase()]?.usd || 0;
      return acc + (c.raised * price);
    }, 0);

    return { active, raised };
  }, [campaigns, prices]);

  const formatCompactMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  // Fallback data if no campaigns exist yet
  const campaign = featuredCampaign || {
    title: "Clean Water Initiative",
    creator: "Water for All Foundation",
    image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1287&auto=format&fit=crop",
    percentComplete: 75,
    raised: 15.5,
    goal: 20,
    currency: "ETH",
    daysLeft: 3,
    network: 'ethereum',
    category: 'Environment',
    slug: '#'
  };

  return (
    <section className="relative bg-gradient-to-br from-fundhub-light via-white to-fundhub-light animated-bg py-20 overflow-hidden">
      {/* Animated blockchain elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blockchain-particle top-1/4 left-1/4"></div>
        <div className="blockchain-particle top-3/4 left-2/3"></div>
        <div className="blockchain-particle top-1/2 left-1/3"></div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-fundhub-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-fundhub-secondary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center mb-4 space-x-2">
              <span className="px-3 py-1 bg-fundhub-primary/10 text-fundhub-primary text-sm font-medium rounded-full">Blockchain Powered</span>
              <span className="px-3 py-1 bg-fundhub-secondary/10 text-fundhub-secondary text-sm font-medium rounded-full">Transparent Donations</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fundhub-dark to-fundhub-primary">
              Fund Causes That <br />Touch Hearts
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              FundHub combines blockchain technology with emotional impact —
              creating a transparent ecosystem where every contribution makes a
              real difference and changes lives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="btn-gradient px-8 py-6 text-lg group">
                <Link to="/campaigns">
                  Discover Campaigns
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-fundhub-primary text-fundhub-primary hover:bg-fundhub-primary hover:text-white px-8 py-6 text-lg">
                <Link to="/create">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Fundraising
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-fundhub-primary to-fundhub-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-fundhub-primary">{stats.active}</p>
                <p className="text-gray-600">Active Campaigns</p>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-fundhub-primary to-fundhub-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-fundhub-primary">
                  {formatCompactMoney(stats.raised)}+
                </p>
                <p className="text-gray-600">Funds Raised</p>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-fundhub-primary to-fundhub-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-fundhub-primary">{(stats.active * 123) + 500}+</p>
                <p className="text-gray-600">Global Donors</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fundhub-primary to-fundhub-secondary rounded-3xl blur-lg opacity-20 animate-pulse-glow"></div>
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all hover:scale-[1.02] duration-300">
                <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-xs font-medium text-green-700 flex items-center z-10">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Live Campaign
                </div>
                <div className="h-80 overflow-hidden rounded-2xl relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">by {campaign.creator}</p>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {campaign.category}
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-fundhub-primary to-fundhub-secondary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(campaign.percentComplete, 100)}%` }}></div>
                  </div>


                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Raised</p>
                      <div className="font-bold text-lg flex items-center">
                        <img
                          src={
                            campaign.currency === 'BTC' ? '/images/btc.png' :
                              campaign.currency === 'S' ? '/images/sonic.png' :
                                campaign.currency === 'USDC' ? '/images/usdc.png' :
                                  campaign.currency === 'USDT' ? '/images/usdt.png' :
                                    '/images/eth.png'
                          }
                          alt={campaign.currency}
                          className="w-5 h-5 mr-1.5 object-contain"
                        />
                        {campaign.raised} {campaign.currency}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        ≈ ${convertToUSD(campaign.raised, campaign.currency)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Goal</p>
                      <div className="font-bold text-lg flex items-center justify-end">
                        <img
                          src={
                            campaign.currency === 'BTC' ? '/images/btc.png' :
                              campaign.currency === 'S' ? '/images/sonic.png' :
                                campaign.currency === 'USDC' ? '/images/usdc.png' :
                                  campaign.currency === 'USDT' ? '/images/usdt.png' :
                                    '/images/eth.png'
                          }
                          alt={campaign.currency}
                          className="w-5 h-5 mr-1.5 object-contain"
                        />
                        {campaign.goal} {campaign.currency}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        ≈ ${convertToUSD(campaign.goal, campaign.currency)}
                      </p>
                    </div>
                  </div>

                  <Link to={`/campaigns/${campaign.slug}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-fundhub-primary to-fundhub-secondary text-white hover:opacity-90 transition-opacity">
                      <Heart className="mr-2 h-4 w-4" /> Donate Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
