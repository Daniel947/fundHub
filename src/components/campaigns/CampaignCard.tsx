
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { usePriceFeed } from '@/hooks/usePriceFeed';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface CampaignCardProps {
  id: number;
  slug: string;
  title: string;
  creator: string;
  image: string;
  raised: number;
  goal: number;
  currency: string;
  daysLeft: number;
  category: string;
  percentComplete: number;
  featured?: boolean;
  network?: 'sonic' | 'ethereum' | 'btc' | string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  id,
  slug,
  title,
  creator,
  image,
  raised,
  goal,
  currency,
  daysLeft,
  category,
  percentComplete,
  featured = false,
  network = 'ethereum',
}) => {
  const { convertToUSD } = usePriceFeed();

  // Color selection based on category for subtle tinting
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tech': return 'from-blue-500/20 to-cyan-500/20';
      case 'Art': return 'from-purple-500/20 to-pink-500/20';
      case 'Music': return 'from-indigo-500/20 to-purple-500/20';
      default: return 'from-gray-500/20 to-slate-500/20';
    }
  };

  const getNetworkBadge = (net: string) => {
    switch (net) {
      case 'sonic':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">Sonic</Badge>;
      case 'btc':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">Bitcoin</Badge>;
      case 'ethereum':
      default:
        return <Badge className="bg-slate-700 hover:bg-slate-800 text-white border-0">Ethereum</Badge>;
    }
  };

  return (
    <Link to={`/campaigns/${slug}`} className="group block h-full">
      <Card
        className={`
          relative h-full overflow-hidden border-0 bg-white shadow-md transition-all duration-500 ease-out
          hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5
          ${featured ? 'ring-2 ring-primary/20' : ''}
        `}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Overlay Gradient on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryColor(category)} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[90%]">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-xs font-bold text-gray-800 shadow-sm border-0">
              {category}
            </Badge>
            {getNetworkBadge(network)}
            {featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg animate-pulse-subtle">
                Featured
              </Badge>
            )}
          </div>

          {/* Days Left Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90">
            <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">{daysLeft} days left</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6">
          {/* Creator Info */}
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-600 border border-gray-100">
              {creator.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-medium text-gray-400 group-hover:text-primary transition-colors">
              {creator}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Progress Section */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {percentComplete}%
                </span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Funded</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">
                  {raised} <span className="text-xs font-normal text-gray-500">{currency}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  ≈ ${convertToUSD(raised, currency)}
                </div>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(percentComplete, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            {/* Goal info */}
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1 group-hover:text-gray-600 transition-colors">
                <TrendingUp className="w-3 h-3" /> {goal} {currency} Goal
              </span>
              <span className="flex items-center gap-1 visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-primary font-medium">
                View Project →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CampaignCard;
