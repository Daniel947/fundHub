import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert, Plus, Globe, MoreHorizontal, ExternalLink, EyeOff, Megaphone } from 'lucide-react';
import { useWriteContract } from 'wagmi';
import { FUND_ESCROW_ABI, FUND_ESCROW_ADDRESS, FUND_ESCROW_SEPOLIA_ADDRESS } from '@/lib/abi';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const TokenManager = () => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [network, setNetwork] = useState<'sonic' | 'ethereum'>('sonic');

    const escrowAddress = network === 'sonic' ? FUND_ESCROW_ADDRESS : FUND_ESCROW_SEPOLIA_ADDRESS;

    const { writeContractAsync } = useWriteContract();

    const handleWhitelist = async () => {
        if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
            toast.error("Invalid token address");
            return;
        }

        try {
            toast.promise(
                writeContractAsync({
                    address: escrowAddress as `0x${string}`,
                    abi: FUND_ESCROW_ABI as any,
                    functionName: 'whitelistToken',
                    args: [tokenAddress as `0x${string}`, true],
                } as any),
                {
                    loading: `Whitelisting token on ${network}...`,
                    success: "Token whitelisted successfully!",
                    error: (err) => `Failed to whitelist: ${err.message}`
                }
            );
        } catch (err: any) {
            console.error("Whitelist error:", err);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600" />
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <CardTitle>Token Whitelist Manager</CardTitle>
                            <CardDescription>Grant specific ERC20 tokens permission to be used on the platform.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Select Network</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={network === 'sonic' ? 'default' : 'outline'}
                                    className="flex-1 rounded-xl"
                                    onClick={() => setNetwork('sonic')}
                                >
                                    Sonic Blaze
                                </Button>
                                <Button
                                    variant={network === 'ethereum' ? 'default' : 'outline'}
                                    className="flex-1 rounded-xl"
                                    onClick={() => setNetwork('ethereum')}
                                >
                                    Eth Sepolia
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Token Contract Address</label>
                            <div className="relative">
                                <Input
                                    placeholder="0x..."
                                    value={tokenAddress}
                                    onChange={(e) => setTokenAddress(e.target.value)}
                                    className="rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20 pr-12"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Plus size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full rounded-xl h-12 gap-2 text-base font-semibold shadow-lg shadow-primary/20"
                        onClick={handleWhitelist}
                    >
                        <ShieldCheck size={20} />
                        Whitelist Token on {network === 'sonic' ? 'Sonic' : 'Ethereum'}
                    </Button>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="text-amber-500 mt-0.5" size={18} />
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-slate-900">Important Note</p>
                                <p className="text-slate-500 leading-relaxed">
                                    Whitelisting a token allows any campaign to accept donations in that asset.
                                    Ensure the token is a verified, liquid asset (e.g., USDT, USDC) before whitelisting.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Globe size={18} className="text-slate-400" />
                            Recently Whitelisted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {['USDC', 'USDT', 'DAI'].map((symbol) => (
                                <li key={symbol} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {symbol[0]}
                                        </div>
                                        <span className="font-medium text-slate-900">{symbol}</span>
                                    </div>
                                    <Badge variant="outline" className="text-slate-400 group-hover:text-primary transition-colors">Active</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TokenManager;
