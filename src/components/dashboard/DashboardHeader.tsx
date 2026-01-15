import React from 'react';
import { CheckCircle2, Info, Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    address: string;
    totalRaisedUSD: string;
    totalRaisedToken: string;
    totalBackers: number;
    trustScore: number;
    profile?: any;
}

const TrustScore = ({ score }: { score: number }) => {
    const percentage = score;
    const strokeWidth = 8;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-2xl p-4 border-2 border-gray-200/80 relative group">
            <div className="absolute -top-2 -right-2 bg-fundhub-dark text-white text-[8px] font-black px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                AI AUDITED
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="absolute text-sm font-bold text-fundhub-dark">{score}</span>
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Safety Score</span>
                    <Info className="w-3 h-3 text-gray-400" />
                </div>
                <div className="text-xl font-black text-fundhub-dark leading-none">{score}/100</div>
                <div className="flex items-center gap-1 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500")} />
                    <span className={cn("text-[10px] font-bold uppercase", score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600")}>
                        {score >= 80 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Needs Review'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const DashboardHeader = ({ address, totalRaisedUSD, totalRaisedToken, totalBackers, trustScore, profile }: DashboardHeaderProps) => {
    return (
        <header className="flex flex-col lg:flex-row gap-6 mb-10">
            {/* Profile Section */}
            <div className="flex-1 bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80 flex items-center gap-6">
                <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white/60 shadow-xl ring-2 ring-fundhub-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`} />
                        <AvatarFallback className="bg-gradient-to-br from-fundhub-primary to-fundhub-secondary text-white font-bold text-2xl uppercase">
                            {address.slice(2, 4)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                        <img
                            src="/images/verified-badge.png"
                            alt="Verified"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-fundhub-dark tracking-tight">
                            {profile?.name || 'Creator Profile'}
                        </h2>
                    </div>
                    <p className="text-gray-500 font-medium line-clamp-1 max-w-md">
                        {profile?.bio || 'Web3 Creator & Developer'}
                    </p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/40 backdrop-blur-md rounded-full border border-white/40 text-xs font-bold text-fundhub-primary">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3 self-start">
                    <button className="p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/40 hover:bg-white/60 transition-colors">
                        <Bell className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/40 hover:bg-white/60 transition-colors">
                        <Settings className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="lg:w-1/3 bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-gray-200/80 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Impact</span>
                    <span className="text-[10px] font-black text-fundhub-primary bg-fundhub-primary/10 px-2 py-0.5 rounded-full">{totalBackers} Backers</span>
                </div>
                <div className="text-4xl font-black text-fundhub-primary tracking-tight mb-2">
                    ${totalRaisedUSD}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                    <div className="w-2 h-4 bg-gray-300 rounded-sm" />
                    <span>{totalRaisedToken}</span>
                </div>
            </div>

            {/* Trust Score */}
            <TrustScore score={trustScore} />
        </header>
    );
};

export default DashboardHeader;
