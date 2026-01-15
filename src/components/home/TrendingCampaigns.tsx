
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignCard from '@/components/campaigns/CampaignCard';

const TrendingCampaigns = () => {
  const { campaigns, isLoading } = useCampaigns();

  // Show first 4 campaigns as trending
  const displayedCampaigns = campaigns.slice(0, 4);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Trending Campaigns</h2>
            <p className="text-gray-600 mt-2">Discover the most impactful projects on FundHub</p>
          </div>
          <Link
            to="/campaigns"
            className="text-fundhub-primary font-medium hover:underline hidden md:block"
          >
            View All Campaigns →
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-fundhub-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading trending campaigns...</p>
          </div>
        ) : displayedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No campaigns found yet. Be the first to launch one!</p>
            <Link to="/create">
              <Button className="mt-4 bg-fundhub-primary">Create Campaign</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/campaigns"
            className="text-fundhub-primary font-medium hover:underline"
          >
            View All Campaigns →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingCampaigns;
