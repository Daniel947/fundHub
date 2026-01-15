import React from 'react';
import { Shield, CheckCircle, MapPin, Award, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import FollowButton from './FollowButton';

interface CreatorProfileHeaderProps {
    name: string;
    avatar?: string;
    type: 'Individual' | 'NGO' | 'Organization';
    location: string;
    creatorAddress: string;
    verification: {
        identity: boolean;
        ngo: boolean;
        onChain: boolean;
    };
    tier: 'New' | 'Trusted' | 'Proven' | 'Elite';
    trustScore: number;
    onViewCampaigns: () => void;
    onFollow?: () => void;
}

const tierConfig = {
    New: { color: 'bg-gray-500', label: 'New Creator' },
    Trusted: { color: 'bg-blue-500', label: 'Trusted Creator' },
    Proven: { color: 'bg-purple-500', label: 'Proven Creator' },
    Elite: { color: 'bg-amber-500', label: 'Elite Creator' }
};

const CreatorProfileHeader = ({
    name,
    avatar,
    type,
    location,
    creatorAddress,
    verification,
    tier,
    trustScore,
    onViewCampaigns,
    onFollow
}: CreatorProfileHeaderProps) => {
    const tierInfo = tierConfig[tier];
    const percentage = trustScore;
    const strokeWidth = 8;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border-2 border-gray-200/80 mb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Avatar & Basic Info */}
                <div className="flex gap-6 items-start flex-1">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-fundhub-primary to-fundhub-secondary text-white font-black text-3xl">
                            {name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-fundhub-dark">{name}</h1>
                            {verification.identity && (
                                <img
                                    src="/images/verified-badge.png"
                                    alt="Verified"
                                    className="w-5 h-5"
                                    title="Identity Verified"
                                />
                            )}
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-black text-white",
                                tierInfo.color
                            )}>
                                {tierInfo.label}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <span className="px-3 py-1 bg-gray-100 rounded-full font-bold">{type}</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {location}
                            </span>
                        </div>

                        {/* Verification Badges */}
                        <div className="flex flex-wrap gap-2">
                            {verification.identity && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border-2 border-green-200 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-black text-green-700">Identity Verified</span>
                                </div>
                            )}
                            {verification.ngo && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <Award className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-black text-blue-700">NGO Verified</span>
                                </div>
                            )}
                            {verification.onChain && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border-2 border-purple-200 rounded-xl">
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-black text-purple-700">On-Chain Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Follow Button */}
                        <div className="mt-4">
                            <FollowButton creatorAddress={creatorAddress} />
                        </div>
                    </div>
                </div>

                {/* Trust Score & CTAs */}
                <div className="flex flex-col items-center gap-4">
                    {/* Trust Score Circle */}
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="56"
                                cy="56"
                                r={radius}
                                stroke="rgba(200,200,200,0.3)"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            <circle
                                cx="56"
                                cy="56"
                                r={radius}
                                stroke="url(#trustGradient)"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#4ade80" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-fundhub-dark">{trustScore}</span>
                            <span className="text-xs font-bold text-gray-400">Trust Score</span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-2 w-full">
                        <button
                            onClick={onViewCampaigns}
                            className="w-full btn-gradient px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-fundhub-primary/30 hover:shadow-xl transition-all"
                        >
                            View Active Campaigns
                        </button>
                        {onFollow && (
                            <button
                                onClick={onFollow}
                                className="w-full px-6 py-3 bg-white/60 backdrop-blur-md rounded-xl border-2 border-gray-200/80 hover:border-gray-300 font-bold text-sm text-fundhub-dark transition-all"
                            >
                                Follow Creator
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatorProfileHeader;
