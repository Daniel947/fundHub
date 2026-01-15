import { useState } from 'react';
import { useWriteContract, useAccount, useReadContract, useChainId, useSwitchChain, usePublicClient } from 'wagmi';
import { parseUnits, getAddress } from 'viem';
import {
    CAMPAIGN_MANAGER_ADDRESS,
    CAMPAIGN_MANAGER_SEPOLIA_ADDRESS,
    CAMPAIGN_MANAGER_ABI,
    ERC20_ABI,
    FUND_ESCROW_ADDRESS,
    FUND_ESCROW_SEPOLIA_ADDRESS
} from '@/lib/abi';
import { getTokenBySymbol } from '@/lib/tokens';
import { mainnet, polygon, optimism, arbitrum, base, sonic, sonicTestnet, sepolia } from 'wagmi/chains';
import { useToast } from '@/components/ui/use-toast';
import { APP_NETWORK, sonicBlaze } from '@/lib/abi';

export const useDonate = (campaignId: string, currency: string, networkPreference?: string) => {
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { toast } = useToast();
    const publicClient = usePublicClient();
    const tokenInfo = getTokenBySymbol(currency, networkPreference as 'sonic' | 'ethereum' | 'btc');

    const [status, setStatus] = useState<'idle' | 'approving' | 'waiting' | 'donating' | 'success' | 'error' | 'btc_instructions'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [btcAddress, setBtcAddress] = useState<string | null>(null);
    const [btcNetwork, setBtcNetwork] = useState<'mainnet' | 'testnet'>('mainnet');

    const { writeContractAsync: writeContract } = useWriteContract();

    // Determine target chains based on environment and token network
    const isEthNetwork = tokenInfo?.network === 'ethereum';
    const activeEthChain = APP_NETWORK === 'mainnet' ? mainnet : sepolia;
    const activeSonicChain = APP_NETWORK === 'mainnet' ? sonic : sonicBlaze;

    const escrowAddress = isEthNetwork ? FUND_ESCROW_SEPOLIA_ADDRESS : FUND_ESCROW_ADDRESS;
    const targetChain = isEthNetwork ? activeEthChain : activeSonicChain;
    const campaignManagerAddr = isEthNetwork ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;

    // 1. Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenInfo?.address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: userAddress && tokenInfo ? [userAddress, escrowAddress] : undefined,
        query: {
            enabled: !!userAddress && !!tokenInfo && tokenInfo.address !== getAddress('0x0000000000000000000000000000000000000000'),
        }
    });

    const donate = async (amount: string) => {
        if (!userAddress) {
            toast({ title: "Wallet Not Connected", variant: "destructive" });
            return;
        }

        if (!tokenInfo) {
            setError("Unsupported token");
            return;
        }

        if (tokenInfo.network === 'btc') {
            setStatus('btc_instructions');
            try {
                const response = await fetch(`http://localhost:3001/api/btc/address/${campaignId}`);
                const data = await response.json();
                setBtcAddress(data.address);
                if (data.network) setBtcNetwork(data.network);
            } catch (err) {
                console.error("Error fetching BTC address:", err);
                setBtcAddress("bc1q..." + campaignId.slice(2, 8)); // Fallback
            }
            return;
        }

        const targetChainId = targetChain.id;
        if (chainId !== targetChainId) {
            toast({
                title: "Network Switch Required",
                description: `Switching to ${targetChain.name} for this donation.`,
            });
            switchChain({ chainId: targetChainId });
            return;
        }

        const isNative = tokenInfo.address === getAddress('0x0000000000000000000000000000000000000000');
        setError(null);

        const campaignManagerAddr = tokenInfo.network === 'ethereum' ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;

        try {
            const amountWei = parseUnits(amount, tokenInfo.decimals);

            // 2. Approve if needed (and NOT native)
            if (!isNative) {
                let currentAllowance = BigInt(0);

                if (publicClient) {
                    try {
                        const latestAllowance = await publicClient.readContract({
                            address: tokenInfo.address,
                            abi: ERC20_ABI,
                            functionName: 'allowance',
                            args: [userAddress, escrowAddress]
                        });
                        currentAllowance = BigInt(latestAllowance?.toString() || '0');
                    } catch (err) {
                        console.warn("Failed to fetch latest allowance:", err);
                        currentAllowance = allowance ? BigInt(allowance.toString()) : BigInt(0);
                    }
                } else {
                    currentAllowance = allowance ? BigInt(allowance.toString()) : BigInt(0);
                }

                if (currentAllowance < amountWei) {
                    setStatus('approving');
                    toast({
                        title: "Step 1 of 2: Approval",
                        description: `Please authorize FundHub to handle your ${currency}.`,
                    });

                    // Using a very large number for approval to avoid repeated prompts and sync issues
                    const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

                    const approveHash = await writeContract({
                        address: tokenInfo.address,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [escrowAddress, MAX_UINT256],
                        account: userAddress,
                        chain: targetChain,
                    });

                    setStatus('waiting');
                    toast({
                        title: "Confirming Approval",
                        description: "Waiting for blockchain confirmation...",
                    });

                    // Wait for the chain to confirm the approval
                    if (publicClient) {
                        await publicClient.waitForTransactionReceipt({ hash: approveHash });
                    }

                    // Optimized: Dynamic polling instead of fixed 5s wait
                    const pollForAllowance = async (target: bigint, maxAttempts = 10): Promise<boolean> => {
                        for (let i = 0; i < maxAttempts; i++) {
                            if (!publicClient) return true;
                            try {
                                const latest = await publicClient.readContract({
                                    address: tokenInfo.address,
                                    abi: ERC20_ABI,
                                    functionName: 'allowance',
                                    args: [userAddress, escrowAddress]
                                });
                                const val = BigInt(latest?.toString() || '0');
                                if (val >= target) return true;
                            } catch (e) {
                                console.warn("Polling error:", e);
                            }
                            await new Promise(r => setTimeout(r, 1500)); // Wait 1.5s between polls
                        }
                        return false;
                    };

                    const synced = await pollForAllowance(amountWei);
                    await refetchAllowance();
                }
            }

            // 3. Donate
            setStatus('donating');
            toast({
                title: isNative ? "Processing Donation" : "Step 2 of 2: Donation",
                description: `Confirming ${amount} ${currency} donation in your wallet.`,
            });

            // Diagnostic: Simulation check
            if (publicClient) {
                try {
                    await publicClient.simulateContract({
                        address: campaignManagerAddr,
                        abi: CAMPAIGN_MANAGER_ABI,
                        functionName: 'donate',
                        args: [campaignId as `0x${string}`, tokenInfo.address, amountWei],
                        account: userAddress,
                        value: isNative ? amountWei : undefined,
                        chain: targetChain,
                    });
                } catch (simErr: any) {
                    console.error("Simulation failed:", simErr);
                    let niceMessage = simErr.shortMessage || simErr.message;

                    // Handle specific hex error for ERC20InsufficientAllowance (0x5274afe7)
                    if (simErr.message?.includes("0x5274afe7")) {
                        niceMessage = "Insufficient allowance. The approval might still be processing or was not enough.";
                    } else if (niceMessage.toLowerCase().includes("transfer amount exceeds balance")) {
                        niceMessage = "Insufficient balance. Please add more funds to your wallet and try again.";
                    } else if (niceMessage.includes("Token not allowed")) {
                        niceMessage = "This token is not whitelisted in the escrow yet.";
                    } else if (niceMessage.includes("Unregistered campaign")) {
                        niceMessage = "This campaign is not registered in the on-chain escrow.";
                    } else if (niceMessage.includes("transfer amount exceeds allowance") || niceMessage.includes("InsufficientAllowance")) {
                        niceMessage = "Approval failed or was insufficient. Please try again.";
                    }

                    toast({
                        title: "Transaction Simulation Failed",
                        description: niceMessage,
                        variant: "destructive"
                    });
                    throw new Error(niceMessage);
                }
            }

            const donateHash = await writeContract({
                address: campaignManagerAddr,
                abi: CAMPAIGN_MANAGER_ABI,
                functionName: 'donate',
                args: [campaignId as `0x${string}`, tokenInfo.address, amountWei],
                account: userAddress,
                chain: targetChain,
                value: isNative ? amountWei : undefined,
            });

            if (publicClient) {
                setStatus('waiting');
                toast({
                    title: "Confirming Donation",
                    description: "Waiting for blockchain confirmation...",
                });
                await publicClient.waitForTransactionReceipt({ hash: donateHash });
            }

            setStatus('success');
            toast({
                title: "Donation Successful! 🎉",
                description: `Thank you for your support of ${amount} ${currency}.`,
            });

            return donateHash;

        } catch (err: any) {
            console.error("Donation Error:", err);
            const isUserRejection = err.message?.includes("User rejected") || err.message?.includes("denied");

            setError(err.message || "Transaction failed");
            setStatus('error');

            toast({
                title: isUserRejection ? "Transaction Cancelled" : "Transaction Failed",
                description: isUserRejection ? "You declined the request in your wallet." : (err.message || "An error occurred during the donation."),
                variant: isUserRejection ? "default" : "destructive"
            });
            throw err;
        } finally {
            if (status !== 'success') setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return {
        donate,
        status,
        error,
        isLoading: status === 'approving' || status === 'donating' || status === 'waiting',
        isBtc: status === 'btc_instructions',
        btcAddress
    };
};
