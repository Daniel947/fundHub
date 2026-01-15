import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface FollowStatus {
    isFollowing: boolean;
    isLoading: boolean;
}

interface FollowerCount {
    count: number;
    isLoading: boolean;
}

interface FollowingCreator {
    address: string;
    name: string;
    avatar: string;
    type: string;
    campaignCount: number;
}

/**
 * Hook to check if the current user is following a creator
 */
export function useFollowStatus(creatorAddress: string | undefined): FollowStatus {
    const { address: userAddress } = useAccount();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!creatorAddress || !userAddress) {
            setIsLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}/creator/${creatorAddress}/follow/status`,
                    { params: { follower: userAddress } }
                );
                setIsFollowing(response.data.isFollowing);
            } catch (error) {
                console.error('Error fetching follow status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [creatorAddress, userAddress]);

    return { isFollowing, isLoading };
}

/**
 * Hook to get follower count for a creator
 */
export function useFollowerCount(creatorAddress: string | undefined): FollowerCount {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!creatorAddress) {
            setIsLoading(false);
            return;
        }

        const fetchCount = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}/creator/${creatorAddress}/followers/count`
                );
                setCount(response.data.count);
            } catch (error) {
                console.error('Error fetching follower count:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCount();
    }, [creatorAddress]);

    return { count, isLoading };
}

/**
 * Hook to get list of creators the user is following
 */
export function useFollowingList(userAddress: string | undefined) {
    const [following, setFollowing] = useState<FollowingCreator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userAddress) {
            setIsLoading(false);
            return;
        }

        const fetchFollowing = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}/user/${userAddress}/following`
                );
                setFollowing(response.data.following);
            } catch (error) {
                console.error('Error fetching following list:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowing();
    }, [userAddress]);

    return { following, isLoading };
}

/**
 * Hook to follow/unfollow a creator
 */
export function useCreatorFollow(creatorAddress: string | undefined) {
    const { address: userAddress } = useAccount();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial status
    useEffect(() => {
        if (!creatorAddress || !userAddress) return;

        const fetchData = async () => {
            try {
                const [statusRes, countRes] = await Promise.all([
                    axios.get(`${API_BASE}/creator/${creatorAddress}/follow/status`, {
                        params: { follower: userAddress }
                    }),
                    axios.get(`${API_BASE}/creator/${creatorAddress}/followers/count`)
                ]);

                setIsFollowing(statusRes.data.isFollowing);
                setFollowerCount(countRes.data.count);
            } catch (error) {
                console.error('Error fetching follow data:', error);
            }
        };

        fetchData();
    }, [creatorAddress, userAddress]);

    const toggleFollow = async () => {
        if (!creatorAddress || !userAddress || isLoading) return;

        setIsLoading(true);
        try {
            if (isFollowing) {
                // Unfollow
                const response = await axios.delete(
                    `${API_BASE}/creator/${creatorAddress}/follow`,
                    { data: { followerAddress: userAddress } }
                );
                setIsFollowing(false);
                setFollowerCount(response.data.followerCount);
            } else {
                // Follow
                const response = await axios.post(
                    `${API_BASE}/creator/${creatorAddress}/follow`,
                    { followerAddress: userAddress }
                );
                setIsFollowing(true);
                setFollowerCount(response.data.followerCount);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isFollowing,
        followerCount,
        isLoading,
        toggleFollow,
        canFollow: !!userAddress && !!creatorAddress
    };
}
