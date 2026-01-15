import React from 'react';
import { Shield, Lock, AlertCircle, ExternalLink } from 'lucide-react';

interface TrustPanelProps {
    verificationDetails: {
        identity: { verified: boolean; date?: string };
        ngo: { verified: boolean; registrationNumber?: string };
        onChain: { verified: boolean; contractAddress?: string };
    };
    escrowUsage: {
        totalCampaigns: number;
        escrowProtected: number;
    };
    disputes: number;
    smartContractUrl?: string;
}

const TrustPanel = ({
    verificationDetails,
    escrowUsage,
    disputes,
    smartContractUrl
}: TrustPanelProps) => {
    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-fundhub-primary" />
                <h2 className="text-2xl font-black text-fundhub-dark">Trust & Transparency</h2>
            </div>

            <div className="space-y-6">
                {/* Verification Status */}
                <div>
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Verification Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verificationDetails.identity.verified ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                    <Shield className={`w-5 h-5 ${verificationDetails.identity.verified ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                </div>
                                <div>
                                    <div className="font-bold text-fundhub-dark">Identity Verification</div>
                                    <div className="text-xs text-gray-500">
                                        {verificationDetails.identity.verified
                                            ? `Verified ${verificationDetails.identity.date || ''}`
                                            : 'Not verified'}
                                    </div>
                                </div>
                            </div>
                            {verificationDetails.identity.verified && (
                                <span className="text-xs font-black text-green-600">VERIFIED</span>
                            )}
                        </div>

                        {verificationDetails.ngo.verified && (
                            <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-fundhub-dark">NGO Registration</div>
                                        <div className="text-xs text-gray-500">
                                            Reg. #{verificationDetails.ngo.registrationNumber || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-blue-600">VERIFIED</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verificationDetails.onChain.verified ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}>
                                    <Lock className={`w-5 h-5 ${verificationDetails.onChain.verified ? 'text-purple-600' : 'text-gray-400'
                                        }`} />
                                </div>
                                <div>
                                    <div className="font-bold text-fundhub-dark">On-Chain Verification</div>
                                    <div className="text-xs text-gray-500">
                                        {verificationDetails.onChain.verified ? 'Blockchain verified' : 'Not verified'}
                                    </div>
                                </div>
                            </div>
                            {verificationDetails.onChain.verified && (
                                <span className="text-xs font-black text-purple-600">VERIFIED</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Escrow Usage */}
                <div>
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Escrow Protection</h3>
                    <div className="p-4 bg-white/40 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Campaigns with Escrow</span>
                            <span className="text-lg font-black text-fundhub-dark">
                                {escrowUsage.escrowProtected}/{escrowUsage.totalCampaigns}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500"
                                style={{ width: `${(escrowUsage.escrowProtected / escrowUsage.totalCampaigns) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            All funds are held in secure smart contract escrow until milestones are completed
                        </p>
                    </div>
                </div>

                {/* Disputes */}
                <div>
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Dispute History</h3>
                    <div className="p-4 bg-white/40 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${disputes === 0 ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                <AlertCircle className={`w-5 h-5 ${disputes === 0 ? 'text-green-600' : 'text-yellow-600'
                                    }`} />
                            </div>
                            <div>
                                <div className="font-bold text-fundhub-dark">
                                    {disputes === 0 ? 'No Disputes' : `${disputes} Dispute${disputes > 1 ? 's' : ''}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {disputes === 0 ? 'Clean track record' : 'See details for resolution'}
                                </div>
                            </div>
                        </div>
                        {disputes === 0 && (
                            <span className="text-xs font-black text-green-600">CLEAN</span>
                        )}
                    </div>
                </div>

                {/* Smart Contract Transparency */}
                {smartContractUrl && (
                    <div>
                        <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Smart Contract</h3>
                        <a
                            href={smartContractUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <ExternalLink className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-fundhub-dark">View on Blockchain</div>
                                    <div className="text-xs text-gray-500">Transparent, verifiable transactions</div>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrustPanel;
