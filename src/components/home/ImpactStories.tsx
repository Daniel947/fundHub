import React from 'react';
import { Heart, Award, HandCoins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Link } from 'react-router-dom';
import { usePriceFeed } from '@/hooks/usePriceFeed';

const ImpactStories = () => {
  const { campaigns } = useCampaigns();
  const { convertToUSD } = usePriceFeed();

  // Get top 3 funded campaigns to feature as impact stories
  const featuredStories = campaigns
    ?.filter(c => c.percentComplete > 0)
    .sort((a, b) => b.percentComplete - a.percentComplete)
    .slice(0, 3) || [];

  // Fallback if no campaigns are loaded yet
  if (featuredStories.length === 0) return null;

  return (
    <section className="py-20 bg-fundhub-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="bg-fundhub-primary/10 text-fundhub-primary text-sm font-medium px-4 py-1.5 rounded-full">Real Impact</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Stories That Touch Hearts</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how blockchain-powered donations are creating meaningful change around the world,
            bringing hope and transformation to communities in need.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredStories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl overflow-hidden shadow-md impact-pulse flex flex-col h-full">
              <div className="relative h-48 shrink-0">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/60"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded">
                    {story.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 line-clamp-1">{story.title}</h3>

                <div className="bg-fundhub-light p-4 rounded-lg mb-5 flex-grow">
                  <p className="italic text-gray-700 relative text-sm line-clamp-3">
                    <span className="absolute -top-2 -left-2 text-fundhub-primary text-4xl opacity-30">"</span>
                    {story.description || "Every donation brings us closer to our goal. Your support is changing lives and building a better future."}
                  </p>
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-200/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                      {story.creator.substring(0, 2)}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium text-sm truncate max-w-[150px]">{story.creator}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{story.network === 'sonic' ? 'Sonic Network' : story.network === 'btc' ? 'Bitcoin Network' : 'Ethereum Network'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mb-4 mt-auto">
                  <div className="flex items-center">
                    <HandCoins className="h-4 w-4 text-fundhub-primary mr-1" />
                    <span className="text-sm font-medium">{story.raised} {story.currency}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-fundhub-primary mr-1" />
                    <span className="text-sm font-medium">Approx. ${convertToUSD(story.raised, story.currency)}</span>
                  </div>
                </div>

                <Link to={`/campaigns/${story.slug}`}>
                  <Button variant="outline" className="w-full border-fundhub-primary text-fundhub-primary hover:bg-fundhub-primary hover:text-white transition-colors">
                    <Award className="mr-2 h-4 w-4" /> View Campaign
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/campaigns">
            <Button className="btn-gradient">
              Browse All Impact Stories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ImpactStories;
