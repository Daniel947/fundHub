import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CampaignCard from '@/components/campaigns/CampaignCard';
import CampaignFilters from '@/components/campaigns/CampaignFilters';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import { ArrowRight, Sparkles } from 'lucide-react';

const Campaigns = () => {
  const { campaigns, isLoading: isContractLoading, error } = useCampaigns();
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const campaignsPerPage = 6;

  // Initialize data
  useEffect(() => {
    if (campaigns) {
      setFilteredCampaigns(campaigns);
      setIsLoading(isContractLoading);
    }
  }, [campaigns, isContractLoading]);

  // Filter campaigns based on user selections
  const handleFilterChange = (filters: any) => {
    setIsLoading(true);
    // Simulate short delay for UI feel
    setTimeout(() => {
      if (!campaigns) return;

      let filtered = [...campaigns];

      // Filter by search query
      if (filters.searchQuery) {
        filtered = filtered.filter(
          campaign => campaign.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            campaign.creator.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(campaign => campaign.category === filters.category);
      }

      // Filter by network
      if (filters.network && filters.network !== 'all') {
        filtered = filtered.filter(campaign => campaign.network === filters.network);
      }

      // Filter by funding range
      if (filters.fundingRange) {
        filtered = filtered.filter(
          campaign => campaign.percentComplete >= filters.fundingRange[0] &&
            campaign.percentComplete <= filters.fundingRange[1]
        );
      }

      // Sort campaigns
      if (filters.sortBy === 'endingSoon') {
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
      } else if (filters.sortBy === 'mostFunded') {
        filtered.sort((a, b) => b.percentComplete - a.percentComplete);
      }

      setFilteredCampaigns(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };

  // Get current campaigns
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">

        {/* Modern Hero Section */}
        <div className="relative bg-[#0a0a0a] pb-32 pt-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-ad71053db429?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>

          <div className="container relative mx-auto px-4 text-center z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md border border-white/10 mb-6 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] animate-fade-in-up">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent font-bold">New Era of Crowdfunding</span>
            </div>

            <h1 className="mb-6 text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-xl font-display leading-[1.1]">
              Invest in the <br />
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Future of Innovation</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
              Discover and fund the next generation of creative projects.
              From blockchain startups to artistic masterpieces, be part of the story.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-20">
          <CampaignFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-gray-500 font-medium animate-pulse">Curating projects...</p>
            </div>
          ) : (
            <>
              {filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mx-auto max-w-3xl text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <Sparkles className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-500 max-w-md mb-8">We couldn't find any projects matching your filters. Try adjusting your search or clearing filters.</p>
                  <Button
                    onClick={() => handleFilterChange({})}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {currentCampaigns.map((campaign: any) => (
                      <div key={campaign.id} className="h-full">
                        <CampaignCard {...campaign} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredCampaigns.length > campaignsPerPage && (
                    <div className="flex justify-center pb-20">
                      <div className="flex items-center bg-white p-2 rounded-full shadow-lg border border-gray-100 gap-2">
                        {Array.from({ length: Math.ceil(filteredCampaigns.length / campaignsPerPage) }).map((_, index) => (
                          <Button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            variant={currentPage === index + 1 ? 'default' : 'ghost'}
                            className={`h-10 w-10 rounded-full p-0 font-bold transition-all ${currentPage === index + 1 ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Campaigns;
