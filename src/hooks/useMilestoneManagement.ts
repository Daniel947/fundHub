import { useState } from 'react';
import { useWriteContract, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { getAddress } from 'viem';
import {
    CAMPAIGN_MANAGER_ADDRESS,
    CAMPAIGN_MANAGER_SEPOLIA_ADDRESS,
    CAMPAIGN_MANAGER_ABI,
    sonicBlaze
} from '@/lib/abi';
import { getTokenBySymbol } from '@/lib/tokens';
import { sepolia } from 'wagmi/chains';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook to manage campaign milestones and surplus fund withdrawals.
 * Handles network switching, contract interactions, and user feedback via toasts.
 * 
 * @param campaignId The unique internal ID of the campaign.
 * @param currency The currency symbol (e.g., "S", "ETH").
 * @param network The blockchain network ('sonic', 'ethereum', or 'btc').
 */
export const useMilestoneManagement = (campaignId: string, currency: string, network: 'sonic' | 'ethereum' | 'btc') => {
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { toast } = useToast();
    const tokenInfo = getTokenBySymbol(currency, network);

    const [isReleasing, setIsReleasing] = useState(false);
    const [lastTxHash, setLastTxHash] = useState<string | null>(null);

    const { writeContractAsync: writeContract } = useWriteContract();

    /**
     * Triggers the release of funds for a specific milestone.
     * @param index The 0-based index of the milestone in the contract array.
     * @returns The transaction hash if successful.
     */
    const releaseMilestone = async (index: number) => {
        if (!userAddress) {
            toast({ title: "Wallet Not Connected", variant: "destructive" });
            return;
        }

        if (network === 'btc') {
            toast({
                title: "BTC Milestone Release",
                description: "BTC milestones are managed by the Antigravity Oracle. Please contact support to initiate release.",
                variant: "destructive"
            });
            return;
        }

        const targetChain = network === 'ethereum' ? sepolia : sonicBlaze;
        const campaignManagerAddr = network === 'ethereum' ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;

        if (chainId !== targetChain.id) {
            toast({
                title: "Network Switch Required",
                description: `Switching to ${targetChain.name}...`,
            });
            switchChain({ chainId: targetChain.id });
            return;
        }

        setIsReleasing(true);
        try {
            const tokenAddr = tokenInfo?.address || getAddress('0x0000000000000000000000000000000000000000');

            toast({
                title: "Releasing Funds",
                description: `Confirming release for milestone #${index + 1} in your wallet.`,
            });

            const hash = await writeContract({
                address: campaignManagerAddr as `0x${string}`,
                abi: CAMPAIGN_MANAGER_ABI,
                functionName: 'releaseMilestoneFunds',
                args: [campaignId as `0x${string}`, tokenAddr, BigInt(index)],
                account: userAddress,
                chain: targetChain,
            });

            setLastTxHash(hash);
            toast({
                title: "Milestone Released! 🎉",
                description: "The transaction has been broadcast. Funds will be available shortly.",
            });

            return hash;
        } catch (err: any) {
            console.error("Release Error:", err);
            toast({
                title: "Release Failed",
                description: err.message || "An error occurred during the release.",
                variant: "destructive"
            });
            throw err;
        } finally {
            setIsReleasing(false);
        }
    };

    /**
     * Withdraws all remaining funds from the escrow after all milestones are released.
     */
    const withdrawSurplus = async () => {
        if (!userAddress) {
            toast({ title: "Wallet Not Connected", variant: "destructive" });
            return;
        }

        const targetChain = network === 'ethereum' ? sepolia : sonicBlaze;
        const campaignManagerAddr = network === 'ethereum' ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;

        if (chainId !== targetChain.id) {
            toast({ title: "Network Switch Required" });
            switchChain({ chainId: targetChain.id });
            return;
        }

        setIsReleasing(true);
        try {
            const tokenAddr = tokenInfo?.address || getAddress('0x0000000000000000000000000000000000000000');

            const hash = await writeContract({
                address: campaignManagerAddr as `0x${string}`,
                abi: CAMPAIGN_MANAGER_ABI,
                functionName: 'withdrawSurplus',
                args: [campaignId as `0x${string}`, tokenAddr],
                account: userAddress,
                chain: targetChain,
            });

            setLastTxHash(hash);
            toast({
                title: "Surplus Withdrawn! 💰",
                description: "All over-funded amounts have been released to your wallet.",
            });

            return hash;
        } catch (err: any) {
            console.error("Surplus withdrawal failed:", err);
            toast({
                title: "Withdrawal Failed",
                description: err.message || "Could not withdraw surplus.",
                variant: "destructive"
            });
            throw err;
        } finally {
            setIsReleasing(false);
        }
    };

    return {
        releaseMilestone,
        withdrawSurplus,
        isReleasing,
        lastTxHash
    };
};
