import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useCreatorFollow } from '@/hooks/useCreatorFollow';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FollowButtonProps {
    creatorAddress: string;
    className?: string;
}

export default function FollowButton({ creatorAddress, className = '' }: FollowButtonProps) {
    const { address: userAddress, isConnected } = useAccount();
    const { isFollowing, followerCount, isLoading, toggleFollow, canFollow } = useCreatorFollow(creatorAddress);
    const { toast } = useToast();
    const [isHovered, setIsHovered] = useState(false);

    // Check if viewing own profile
    const isOwnProfile = userAddress?.toLowerCase() === creatorAddress?.toLowerCase();

    const handleClick = async () => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to follow creators.",
                variant: "destructive"
            });
            return;
        }

        if (!canFollow) return;

        const wasFollowing = isFollowing;
        await toggleFollow();

        toast({
            title: isFollowing ? "Unfollowed" : "Following!",
            description: isFollowing
                ? "You've unfollowed this creator."
                : "You'll be notified about new campaigns from this creator.",
        });
    };

    const formatFollowerCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const getButtonText = () => {
        if (isLoading) return '';
        if (isFollowing && isHovered) return 'Unfollow';
        if (isFollowing) return 'Following';
        return 'Follow';
    };

    const getButtonStyle = () => {
        if (isFollowing && isHovered) {
            return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
        }
        if (isFollowing) {
            return 'bg-fundhub-dark text-white border-fundhub-dark hover:bg-fundhub-dark/90';
        }
        return 'bg-white text-fundhub-dark border-fundhub-dark hover:bg-fundhub-dark hover:text-white';
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {!isOwnProfile && (
                <Button
                    onClick={handleClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isLoading || !canFollow}
                    className={`
                        px-6 py-2 rounded-xl font-bold text-sm
                        border-2 transition-all duration-200
                        ${getButtonStyle()}
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            {isFollowing ? (
                                <UserCheck className="w-4 h-4 mr-2" />
                            ) : (
                                <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            {getButtonText()}
                        </>
                    )}
                </Button>
            )}

            <span className="text-sm text-gray-600 font-medium">
                {formatFollowerCount(followerCount)} {followerCount === 1 ? 'follower' : 'followers'}
            </span>
        </div>
    );
}
