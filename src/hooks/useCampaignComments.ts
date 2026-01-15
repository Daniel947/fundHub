import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

interface Comment {
    id: number;
    campaignId: string;
    userName: string;
    authorAddress: string;
    content: string;
    time: string;
    isCreator: boolean;
    parentId?: number;
}

export const useCampaignComments = (campaignId: string, network: string) => {
    const { address } = useAccount();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:3001/api/campaigns/${campaignId}/comments`, {
                params: { network }
            });
            // Map snake_case to camelCase
            const mappedComments = response.data.map((c: any) => ({
                id: Number(c.id),
                campaignId: c.campaign_id,
                userName: c.user_name,
                authorAddress: c.author_address,
                content: c.content,
                time: c.time,
                isCreator: c.is_creator,
                parentId: c.parent_id ? Number(c.parent_id) : undefined
            }));
            setComments(mappedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId && network) {
            fetchComments();
        }
    }, [campaignId, network]);

    const addComment = async (content: string, parentId?: number) => {
        if (!address) throw new Error('Wallet not connected');

        const userName = `User ${address.slice(0, 6)}`;

        try {
            await axios.post(`http://localhost:3001/api/campaigns/${campaignId}/comments`, {
                userName,
                authorAddress: address,
                content,
                parentId,
                network
            });

            // Refresh comments after adding
            await fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    };

    return {
        comments,
        isLoading,
        addComment,
        refreshComments: fetchComments
    };
};
