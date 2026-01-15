import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignFormData } from '../schema';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, UploadCloud, ScanFace, FileCheck, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import SumsubVerifier from '../SumsubVerifier';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

type VerificationState = 'idle' | 'uploading' | 'processing' | 'verified';

const StepIdentity = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const { register, formState: { errors }, watch, setValue } = useFormContext<CampaignFormData>();
    const orgType = watch('orgType');
    const isVerified = watch('isVerified');
    const contactEmail = watch('contactEmail');
    const { toast } = useToast();

    const [showVerifier, setShowVerifier] = useState(false);

    // Check on-chain verification status using KRNL VerificationRegistry
    const {
        isVerified: onChainVerified,
        isLoading: isCheckingOnChain,
        verifiedAt,
        provider,
        refetch: refetchVerification
    } = useVerificationStatus(address);

    // Sync on-chain status with form state
    useEffect(() => {
        if (onChainVerified && !isVerified) {
            console.log("[StepIdentity] Found on-chain verification for:", address);
            setValue('isVerified', true);
        } else if (!onChainVerified && isVerified) {
            // If form says verified but on-chain doesn't, reset
            console.log("[StepIdentity] No on-chain verification found, resetting form state");
            setValue('isVerified', false);
        }
    }, [onChainVerified, isVerified, address, setValue]);

    const handleSuccess = () => {
        toast({
            title: "KYC Submitted! ✅",
            description: "Your verification is being processed. This may take a few moments to appear on-chain.",
        });
        setShowVerifier(false);

        // Poll for on-chain verification (webhook should trigger it)
        const pollInterval = setInterval(() => {
            refetchVerification();
        }, 5000); // Check every 5 seconds

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(pollInterval), 120000);
    };

    const handleError = (error: any) => {
        console.error('[StepIdentity] Verification Error:', error);
        setShowVerifier(false);
        toast({
            title: "Verification Failed",
            description: "There was an error with the verification process. Please try again.",
            variant: "destructive"
        });
    };

    const status: VerificationState = onChainVerified ? 'verified' : 'idle';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Identity & Trust</h2>
                <p className="text-gray-500">Verified creators raise 3x more funds.</p>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>I am representing...</Label>
                            <Select onValueChange={(val: any) => setValue('orgType', val)} defaultValue={orgType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">Myself (Individual)</SelectItem>
                                    <SelectItem value="ngo">Registered NGO/Non-Profit</SelectItem>
                                    <SelectItem value="company">Company / Organization</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input
                                type="email"
                                placeholder="official@organization.org"
                                {...register('contactEmail')}
                                className={errors.contactEmail ? "border-red-500" : ""}
                            />
                            {errors.contactEmail && <p className="text-red-500 text-xs">{errors.contactEmail.message}</p>}
                        </div>
                    </div>

                    <div className={cn(
                        "border rounded-xl p-6 transition-all duration-500",
                        status === 'verified' ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-100"
                    )}>
                        {status === 'idle' && !showVerifier && (
                            <div className="flex items-start gap-4">
                                <ShieldCheck className="w-8 h-8 text-fundhub-primary shrink-0" />
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">On-Chain KYC Verification Required</h3>
                                        <p className="text-sm text-gray-600">
                                            To prevent fraud and ensure donor safety, we require all creators to complete KYC verification.
                                            Your verification status is stored on the blockchain for transparency and security.
                                        </p>
                                    </div>

                                    <div
                                        className="border-2 border-dashed border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center bg-white/50 cursor-pointer hover:bg-white hover:border-fundhub-primary transition-colors"
                                        onClick={() => setShowVerifier(true)}
                                    >
                                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                                            <UploadCloud className="w-6 h-6 text-fundhub-primary" />
                                        </div>
                                        <p className="font-medium text-gray-900">Start KYC Verification</p>
                                        <p className="text-xs text-gray-500 mt-1">Powered by Sumsub + KRNL Protocol</p>
                                    </div>

                                    <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
                                        <p className="text-xs text-gray-600 mb-2 font-medium">What happens after verification:</p>
                                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                            <li>Your identity is verified by Sumsub (industry-standard KYC provider)</li>
                                            <li>Verification status is stored on Sonic blockchain via KRNL Protocol</li>
                                            <li>You can create campaigns without re-verifying</li>
                                            <li>Donors can see your verified status on-chain</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showVerifier && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-gray-900">Secure Verification</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowVerifier(false)}>Cancel</Button>
                                </div>
                                <SumsubVerifier
                                    externalUserId={address || `user_${Date.now()}`}
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                />
                            </div>
                        )}

                        {status === 'verified' && (
                            <div className="flex flex-col gap-6 animate-scale-in">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white rounded-full p-1 shadow-sm">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">Identity Verified ✓</h3>
                                        <p className="text-sm text-gray-600">
                                            Your identity has been verified and stored on the Sonic blockchain.
                                        </p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <span className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                                <FileCheck className="w-3 h-3" /> KYC Approved
                                            </span>
                                            <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> On-Chain Verified
                                            </span>
                                            {provider && (
                                                <span className="text-xs bg-white border border-purple-200 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                                                    <ScanFace className="w-3 h-3" /> {provider}
                                                </span>
                                            )}
                                            {verifiedAt && (
                                                <span className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(verifiedAt * 1000), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-900">Blockchain-Verified Creator</p>
                                            <p className="text-xs text-green-700 mt-1">
                                                Your verification is stored on-chain at the VerificationRegistry contract.
                                                This ensures transparency and prevents fraud.
                                            </p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-xs text-green-700 hover:text-green-800 p-0 h-auto mt-2"
                                                onClick={() => window.open('https://blaze.soniclabs.com/address/0x4D0e845A5099e77E57195A5a9EFb09053D264DAE', '_blank')}
                                            >
                                                View Contract <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {errors.isVerified && (
                        <div className="flex justify-center">
                            <p className="text-red-500 text-sm font-medium animate-pulse flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-100">
                                <ShieldCheck className="w-4 h-4" /> {errors.isVerified.message}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StepIdentity;
