import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CampaignFiltersProps {
  onFilterChange: (filters: any) => void;
}

const CampaignFilters: React.FC<CampaignFiltersProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [network, setNetwork] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [fundingRange, setFundingRange] = useState([0, 100]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounce handled by parent, but we trigger immediately here for responsive feel
    onFilterChange({
      searchQuery: e.target.value,
      category,
      network,
      sortBy,
      fundingRange
    });
  };

  const updateFilters = (newCategory: string, newNetwork: string, newSort: string, newRange: number[]) => {
    let count = 0;
    if (newCategory && newCategory !== 'all') count++;
    if (newNetwork && newNetwork !== 'all') count++;
    if (newRange[0] > 0 || newRange[1] < 100) count++;
    setActiveFiltersCount(count);

    onFilterChange({
      searchQuery,
      category: newCategory,
      network: newNetwork,
      sortBy: newSort,
      fundingRange: newRange,
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilters(value, network, sortBy, fundingRange);
  };

  const handleNetworkChange = (value: string) => {
    setNetwork(value);
    updateFilters(category, value, sortBy, fundingRange);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters(category, network, value, fundingRange);
  };

  const handleFundingChange = (value: number[]) => {
    setFundingRange(value);
    updateFilters(category, network, sortBy, value);
  };

  const clearFilters = () => {
    setCategory('all');
    setNetwork('all');
    setFundingRange([0, 100]);
    setSearchQuery('');
    setActiveFiltersCount(0);
    onFilterChange({ searchQuery: '', category: 'all', network: 'all', sortBy: 'newest', fundingRange: [0, 100] });
  };

  return (
    <div className="relative z-20 -mt-8 mb-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-white/90">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search Bar */}
            <div className="relative flex-grow group">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder="Search projects by name, creator, or keywords..."
                value={searchQuery}
                onChange={handleSearch}
                className="h-12 border-transparent bg-gray-100/50 pl-11 text-base placeholder:text-gray-400 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-12 w-[180px] rounded-xl border-transparent bg-gray-100/50 font-medium hover:bg-gray-100 focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Health & Medical">Health & Medical</SelectItem>
                  <SelectItem value="Disaster Relief & Emergency">Disaster Relief & Emergency</SelectItem>
                  <SelectItem value="Education & Skills">Education & Skills</SelectItem>
                  <SelectItem value="Community & Social Causes">Community & Social Causes</SelectItem>
                  <SelectItem value="Environment & Climate">Environment & Climate</SelectItem>
                  <SelectItem value="Nonprofits & NGOs">Nonprofits & NGOs</SelectItem>
                  <SelectItem value="Events & Personal Causes">Events & Personal Causes</SelectItem>
                  <SelectItem value="Arts, Culture & Heritage">Arts, Culture & Heritage</SelectItem>
                  <SelectItem value="Innovation & Technology">Innovation & Technology</SelectItem>
                  <SelectItem value="Agriculture & Food Security">Agriculture & Food Security</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={isExpanded ? "default" : "outline"}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`h-12 gap-2 rounded-xl border-transparent px-6 font-medium transition-all ${isExpanded ? 'shadow-lg shadow-primary/25' : 'bg-gray-100/50 hover:bg-gray-100'}`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 bg-white text-primary hover:bg-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-12 w-[160px] rounded-xl border-transparent bg-gray-100/50 font-medium hover:bg-gray-100 focus:ring-4 focus:ring-primary/10">
                  <span className="text-gray-500 mr-2">Sort:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="endingSoon">Ending Soon</SelectItem>
                  <SelectItem value="mostFunded">Most Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-6 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="rounded-xl bg-gray-50/80 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" /> Advanced Filtering
                  </h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                      <X className="w-3 h-3 mr-1" /> Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Funding Progress Slider */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-4 block">
                      Funding Progress ({fundingRange[0]}% - {fundingRange[1]}%)
                    </label>
                    <Slider
                      defaultValue={[0, 100]}
                      value={fundingRange}
                      max={100}
                      step={1}
                      onValueChange={handleFundingChange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Network Selection */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Blockchain Network</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Networks' },
                        { id: 'ethereum', label: 'Ethereum (Sepolia)' },
                        { id: 'sonic', label: 'Sonic Blaze' },
                        { id: 'btc', label: 'Bitcoin' }
                      ].map((net) => (
                        <Badge
                          key={net.id}
                          variant={network === net.id ? 'default' : 'outline'}
                          className={`px-3 py-1.5 cursor-pointer transition-colors ${network === net.id
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white hover:border-primary hover:text-primary'
                            }`}
                          onClick={() => handleNetworkChange(net.id)}
                        >
                          {net.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignFilters;
