import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge as UIBadge } from '@/components/ui/badge';
import { useUserRewards, Badge } from '@/hooks/useUserRewards';
import { Star, Award, TrendingUp, Clock, Shield, Gem, Bird } from 'lucide-react';

interface RewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ALL_BADGES = [
    { id: 'early-bird', label: 'Early Bird', icon: '🐦', description: 'Be among the first 5 donors of a campaign.' },
    { id: 'supporter', label: 'Supporter', icon: '🛡️', description: 'Earn at least 10 impact points.' },
    { id: 'high-roller', label: 'High Roller', icon: '💎', description: 'Make a single donation of 50 units or more.' },
];

const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
    const { rewards, isLoading } = useUserRewards();

    const isBadgeAwarded = (id: string) => rewards.badges.some(b => b.id === id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fundhub-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                <Award className="text-fundhub-primary h-6 w-6" />
                            </div>
                            <DialogTitle className="text-2xl font-bold">Your Impact Rewards</DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-400 text-sm">
                            Earn badges and impact points for your contributions on the blockchain.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-8 grid grid-cols-1 gap-4 relative z-10">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Star className="text-amber-500 fill-amber-500 h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Impact Points</p>
                                    <p className="text-3xl font-black text-white">{rewards.points}</p>
                                </div>
                            </div>
                            <UIBadge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">
                                Verified
                            </UIBadge>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-fundhub-primary" />
                        Achievement Badges
                    </h4>

                    <div className="space-y-3">
                        {ALL_BADGES.map((badge) => {
                            const awarded = isBadgeAwarded(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${awarded
                                            ? 'bg-white border-green-100 shadow-sm'
                                            : 'bg-gray-100/50 border-gray-200 grayscale opacity-60'
                                        }`}
                                >
                                    <div className={`text-2xl h-12 w-12 flex items-center justify-center rounded-lg ${awarded ? 'bg-green-50' : 'bg-gray-200'}`}>
                                        {badge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-bold text-sm ${awarded ? 'text-gray-900' : 'text-gray-500'}`}>{badge.label}</p>
                                            {awarded && <UIBadge className="bg-green-500 hover:bg-green-600 text-[10px] h-4">Unlocked</UIBadge>}
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{badge.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            Data syncs automatically every 30 seconds
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RewardsModal;
