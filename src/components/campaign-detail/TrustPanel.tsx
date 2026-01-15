import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TrustPanelProps {
    contractAddress: string;
    network: string;
    creatorVerified: boolean;
    aiTrustScore?: number;
    isEscrowLocked: boolean;
}

const TrustPanel: React.FC<TrustPanelProps> = ({
    contractAddress,
    network,
    creatorVerified,
    aiTrustScore = 95,
    isEscrowLocked
}) => {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(contractAddress);
        toast({
            title: "Address Copied",
            description: "Smart contract address copied to clipboard",
        });
    };

    return (
        <div className="premium-glass rounded-[2.5rem] p-8 border-2 border-gray-200/80 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fundhub-primary/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-fundhub-primary/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-fundhub-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-fundhub-dark">Safety Audit</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verifiable Trust Metrics</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-3xl font-black text-fundhub-primary tracking-tighter">{aiTrustScore}/100</div>
                        <div className="text-[10px] font-black text-fundhub-primary bg-fundhub-primary/10 px-2 py-0.5 rounded-full uppercase">AI Audited</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Identity Verification */}
                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border-2 border-gray-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</span>
                            {creatorVerified ? (
                                <img
                                    src="/images/verified-badge.png"
                                    alt="Verified"
                                    className="w-4 h-4 object-contain"
                                />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                        <div className="text-sm font-black text-fundhub-dark">
                            {creatorVerified ? 'Verified Creator' : 'Self-Reported'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            {creatorVerified ? 'On-chain identity confirmed via registry.' : 'Identity verification is recommended for this project.'}
                        </div>
                    </div>

                    {/* Escrow Status */}
                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border-2 border-gray-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow</span>
                            {isEscrowLocked ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="text-sm font-black text-fundhub-dark">
                            {isEscrowLocked ? 'Active Escrow' : 'Released'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            {isEscrowLocked ? 'Funds are under smart contract protection.' : 'Funding period has concluded or funds released.'}
                        </div>
                    </div>

                    {/* Network Security */}
                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border-2 border-gray-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Network</span>
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="text-sm font-black text-fundhub-dark uppercase">
                            {network === 'ethereum' ? 'Sepolia' : 'Sonic Blaze'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Cross-chain verifiable milestone architecture enabled.
                        </div>
                    </div>
                </div>

                {/* Contract Address Section */}
                <div className="bg-fundhub-dark/5 p-4 rounded-2xl border border-fundhub-dark/10 flex flex-col md:flex-row items-center gap-4">
                    <div className="shrink-0">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Contract Registry</div>
                        <div className="text-xs font-mono text-fundhub-dark truncate max-w-[200px] md:max-w-none">
                            {contractAddress}
                        </div>
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/60 hover:bg-white rounded-xl shadow-sm border border-white/40 transition-all" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/60 hover:bg-white rounded-xl shadow-sm border border-white/40 transition-all" asChild>
                            <a
                                href={network === 'ethereum'
                                    ? `https://sepolia.etherscan.io/address/${contractAddress}`
                                    : `https://testnet.sonicscan.org/address/${contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-4 w-4 text-gray-600" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustPanel;
