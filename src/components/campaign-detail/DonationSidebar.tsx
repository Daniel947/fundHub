import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Heart, Info, ChevronRight, Zap, ShieldCheck, Loader2, Star, Copy, Check } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { usePriceFeed } from '@/hooks/usePriceFeed';
import { useDonate } from '@/hooks/useDonate';
import { BTCLogo } from '@/components/ui/crypto-icons';
import { useUserRewards } from '@/hooks/useUserRewards';
import { useBtcMonitor } from '@/hooks/useBtcMonitor';
import { APP_NETWORK } from '@/lib/abi';
import RewardsModal from './RewardsModal';

interface DonationSidebarProps {
    campaignId: string;
    currency: string;
    daysLeft: number;
    raised: number;
    goal: number;
    network?: 'sonic' | 'ethereum';
    btcAddress?: string | null;
    onDonate?: (amount: string) => void;
    onSuccess?: () => void;
}

const DonationSidebar: React.FC<DonationSidebarProps> = ({
    campaignId,
    currency,
    daysLeft,
    raised,
    goal,
    network,
    btcAddress: btcAddressProp,
    onDonate,
    onSuccess
}) => {
    const [donationAmount, setDonationAmount] = useState('');
    const { isConnected } = useAccount();
    const { convertToUSD } = usePriceFeed();
    const { donate, isLoading, status, isBtc: isBtcHook, btcAddress: btcAddressHook } = useDonate(campaignId, currency, network);
    const btcAddress = btcAddressProp || btcAddressHook;
    const isBtc = currency === 'BTC' || isBtcHook;

    // Monitoring BTC real-time mempool
    const { pendingAmount, hasPending } = useBtcMonitor(isBtc ? btcAddress : null);

    const { rewards } = useUserRewards();
    const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
    const [showBtcAddress, setShowBtcAddress] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = () => {
        if (!btcAddress) return;
        navigator.clipboard.writeText(btcAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDonateClick = async () => {
        if (isBtc) {
            setShowBtcAddress(true);
            return;
        }
        if (!donationAmount) return;
        await donate(donationAmount);
        if (onDonate) onDonate(donationAmount);
        if (onSuccess) onSuccess();
    };

    const handleQuickAmount = (amount: number) => {
        setDonationAmount(amount.toString());
    };

    // Include pending BTC amount in local progress
    // Wait: 'raised' already includes totalReceivedBtc (chain + mempool) from Detail hook
    const activeRaised = raised;
    const percentComplete = Math.round((activeRaised / goal) * 100);

    const btcNetwork = APP_NETWORK; // 'mainnet' or 'testnet'

    return (
        <div className="space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 border-2 border-gray-200/80 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-fundhub-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Funding Progress Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Raised</div>
                                <div className="text-3xl font-black text-fundhub-dark tracking-tighter">
                                    {activeRaised} <span className="text-fundhub-primary font-black uppercase text-xl ml-1">{currency}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">The Goal</div>
                                <div className="text-lg font-black text-gray-500 tracking-tight">
                                    {goal} {currency}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-full bg-fundhub-dark/5 rounded-full overflow-hidden p-1 border border-fundhub-dark/5">
                                <div
                                    className={`h-full bg-gradient-to-r from-fundhub-primary via-fundhub-secondary to-fundhub-primary bg-[length:200%_100%] animate-gradient-shift rounded-full transition-all duration-1000 ease-out shadow-sm ${percentComplete > 100 ? 'brightness-110 shadow-fundhub-primary/40' : ''}`}
                                    style={{ width: `${Math.min(100, percentComplete)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className={`${percentComplete > 100 ? 'text-green-600 bg-green-500/10' : 'text-fundhub-primary bg-fundhub-primary/10'} px-2 py-0.5 rounded-full`}>
                                    {percentComplete}% {percentComplete > 100 ? 'Over-funded' : 'Funded'}
                                </span>
                                <span className="text-gray-400">{daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Completed'}</span>
                            </div>
                        </div>

                        <div className="text-[10px] font-bold text-gray-400 text-center bg-fundhub-dark/5 py-1.5 rounded-lg border border-fundhub-dark/5">
                            ≈ ${convertToUSD(activeRaised, currency)} USD raised to date
                        </div>

                        {hasPending && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3 items-center animate-pulse">
                                <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                                <div>
                                    <div className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Incoming Donation Detected!</div>
                                    <div className="text-[10px] text-orange-600 font-bold">+{pendingAmount} BTC is arriving soon...</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Donation Area */}
                    <div className="space-y-4">
                        {isBtc ? (
                            <div className="space-y-4">
                                {!showBtcAddress ? (
                                    <Button
                                        onClick={handleDonateClick}
                                        className="w-full btn-gradient py-6 rounded-2xl font-black text-base shadow-xl shadow-fundhub-primary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <BTCLogo className="w-6 h-6" />
                                        Donate via Bitcoin
                                    </Button>
                                ) : (
                                    <div className="space-y-4 p-5 bg-fundhub-dark/5 rounded-[2rem] border-2 border-fundhub-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-fundhub-primary/10 rounded-xl flex items-center justify-center">
                                                <BTCLogo className="w-5 h-5 text-fundhub-primary" />
                                            </div>
                                            <span className="text-xs font-black text-fundhub-dark uppercase tracking-widest">Bitcoin Destination</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium mb-3">
                                            Send any amount of BTC to this unique address. Your donation will be synced to the Sonic registry.
                                        </p>

                                        {/* QR Code */}
                                        <div className="flex justify-center py-2">
                                            <div className="p-3 bg-white rounded-2xl border-2 border-fundhub-primary/10 shadow-sm">
                                                {btcAddress ? (
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:${btcAddress}`}
                                                        alt="BTC QR Code"
                                                        className="w-32 h-32"
                                                    />
                                                ) : (
                                                    <div className="w-32 h-32 bg-gray-50 animate-pulse rounded-lg" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl border border-white/40 shadow-inner group/addr font-mono text-[10px] break-all text-fundhub-dark">
                                            <span className="flex-1 select-all">{btcAddress || 'Generating...'}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 shrink-0 hover:bg-fundhub-primary/10 text-fundhub-primary"
                                                onClick={handleCopyAddress}
                                                disabled={!btcAddress}
                                            >
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-[10px] font-black uppercase text-fundhub-primary hover:bg-fundhub-primary/5"
                                            onClick={() => {
                                                const explorerUrl = btcNetwork === 'testnet'
                                                    ? `https://blockstream.info/testnet/address/${btcAddress}`
                                                    : `https://blockstream.info/address/${btcAddress}`;
                                                window.open(explorerUrl, '_blank');
                                            }}
                                        >
                                            View on Explorer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <span className="text-fundhub-dark/30 font-black text-sm uppercase tracking-widest">{currency}</span>
                                        <div className="w-[1px] h-4 bg-gray-200" />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        className="pl-20 py-6 rounded-2xl border-2 border-gray-200/80 focus:border-fundhub-primary/50 focus:ring-4 focus:ring-fundhub-primary/10 transition-all font-black text-lg bg-white/60 backdrop-blur-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0.05, 0.1, 0.5, 1].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => handleQuickAmount(amt)}
                                            className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${parseFloat(donationAmount) === amt
                                                ? 'bg-fundhub-dark text-white border-fundhub-dark shadow-lg shadow-fundhub-dark/20'
                                                : 'bg-white/40 border-white/60 text-gray-400 hover:bg-white/60'
                                                }`}
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>

                                {isConnected ? (
                                    <Button
                                        onClick={handleDonateClick}
                                        disabled={isLoading || !donationAmount}
                                        className="w-full btn-gradient py-8 rounded-2xl font-black text-lg shadow-xl shadow-fundhub-primary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] group/btn"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <Heart className="w-6 h-6 fill-white group-hover/btn:scale-110 transition-transform" />
                                                Back this project
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <ConnectButton.Custom>
                                        {({ openConnectModal }) => (
                                            <Button
                                                onClick={openConnectModal}
                                                className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] btn-gradient text-white shadow-2xl shadow-fundhub-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                <Wallet className="mr-3 h-5 w-5" />
                                                Connect to Contribute
                                            </Button>
                                        )}
                                    </ConnectButton.Custom>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] pt-2">
                            <ShieldCheck className="h-3 w-3" />
                            Secure Escrow Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Message */}
            {!isBtc && parseFloat(donationAmount) > 0 && (
                <div className="bg-fundhub-primary/5 p-4 rounded-[1.5rem] border border-fundhub-primary/10 flex gap-3 items-center animate-fade-in shadow-inner">
                    <Zap className="h-5 w-5 text-fundhub-primary shrink-0" />
                    <p className="text-[10px] font-bold text-fundhub-dark leading-relaxed uppercase tracking-wide">
                        Your <span className="text-fundhub-primary">{donationAmount} {currency}</span> could provide clean water for {Math.floor(parseFloat(donationAmount) * 100)} families.
                    </p>
                </div>
            )}

            {/* Rewards Teaser */}
            <Card
                className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none overflow-hidden relative cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all group group-hover:shadow-xl"
                onClick={() => setIsRewardsModalOpen(true)}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-fundhub-primary/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 animate-pulse"></div>
                <CardContent className="p-5 flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {rewards.badges.length > 0 ? rewards.badges[0].icon : '🏆'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold">Donor Rewards</h4>
                            {rewards.points > 0 && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-bold border border-amber-500/20 flex items-center gap-0.5">
                                    <Star className="w-2 h-2 fill-amber-500" /> {rewards.points}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-300">
                            {rewards.badges.length > 0
                                ? `You've earned ${rewards.badges.length} badges!`
                                : 'Earn NFT badges & impact points'}
                        </p>
                    </div>
                    <ChevronRight className="ml-auto text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </CardContent>
            </Card>

            <RewardsModal
                isOpen={isRewardsModalOpen}
                onClose={() => setIsRewardsModalOpen(false)}
            />
        </div>
    );
};

export default DonationSidebar;
