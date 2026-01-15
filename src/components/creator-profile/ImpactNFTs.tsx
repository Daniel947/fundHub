import React from 'react';
import { Award, Trophy } from 'lucide-react';

interface ImpactNFT {
    id: string;
    title: string;
    description: string;
    image: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    earnedDate: string;
}

interface ImpactNFTsProps {
    nfts: ImpactNFT[];
}

const rarityConfig = {
    Common: { color: 'border-gray-300 bg-gray-50', badge: 'bg-gray-500' },
    Rare: { color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-500' },
    Epic: { color: 'border-purple-300 bg-purple-50', badge: 'bg-purple-500' },
    Legendary: { color: 'border-amber-300 bg-amber-50', badge: 'bg-amber-500' }
};

const ImpactNFTs = ({ nfts }: ImpactNFTsProps) => {
    if (nfts.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-fundhub-primary" />
                <h2 className="text-2xl font-black text-fundhub-dark">Impact Achievements</h2>
                <span className="text-xs font-bold text-gray-400">On-Chain Reputation</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nfts.map((nft) => {
                    const config = rarityConfig[nft.rarity];
                    return (
                        <div
                            key={nft.id}
                            className={`p-4 rounded-xl border-2 ${config.color} hover:scale-105 transition-transform cursor-pointer`}
                        >
                            <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                                <img src={nft.image} alt={nft.title} className="w-full h-full object-cover" />
                            </div>
                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-black text-white mb-2 ${config.badge}`}>
                                {nft.rarity}
                            </div>
                            <div className="font-black text-fundhub-dark text-sm mb-1">{nft.title}</div>
                            <div className="text-xs text-gray-500">{nft.earnedDate}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImpactNFTs;
