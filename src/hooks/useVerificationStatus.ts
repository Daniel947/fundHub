import { useReadContract, useChainId } from 'wagmi';
import { VERIFICATION_REGISTRY_ABI, VERIFICATION_REGISTRY_ADDRESS, VERIFICATION_REGISTRY_SEPOLIA_ADDRESS, sonicBlaze, APP_NETWORK } from '@/lib/abi';
import { sepolia, sonic } from 'wagmi/chains';

/**
 * Hook to check if a wallet address has completed on-chain KYC verification
 * Automatically detects the current network and checks the appropriate registry
 * @param address - The wallet address to check
 * @returns Object containing verification status and loading state
 */
export function useVerificationStatus(address?: string) {
    const chainId = useChainId();

    // Determine which registry to check based on current network
    const activeSonicChain = APP_NETWORK === 'mainnet' ? sonic : sonicBlaze;
    const activeSepoliaChain = APP_NETWORK === 'mainnet' ? sepolia : sepolia;

    const isSonicNetwork = chainId === activeSonicChain.id;
    const registryAddress = isSonicNetwork ? VERIFICATION_REGISTRY_ADDRESS : VERIFICATION_REGISTRY_SEPOLIA_ADDRESS;

    const { data: isVerified, isLoading, error, refetch } = useReadContract({
        address: registryAddress,
        abi: VERIFICATION_REGISTRY_ABI,
        functionName: 'isVerified',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
            // Refetch every 5 seconds to catch new verifications quickly
            refetchInterval: 5000,
            // Don't use stale data - always fetch fresh
            staleTime: 0,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true
        }
    });

    const { data: verifiedAt } = useReadContract({
        address: registryAddress,
        abi: VERIFICATION_REGISTRY_ABI,
        functionName: 'verifiedAt',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && !!isVerified }
    });

    const { data: provider } = useReadContract({
        address: registryAddress,
        abi: VERIFICATION_REGISTRY_ABI,
        functionName: 'verificationProvider',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && !!isVerified }
    });

    return {
        isVerified: !!isVerified,
        isLoading,
        error,
        verifiedAt: verifiedAt ? Number(verifiedAt) : null,
        provider: provider || null,
        refetch,
        network: isSonicNetwork ? 'sonic' : 'sepolia'
    };
}
