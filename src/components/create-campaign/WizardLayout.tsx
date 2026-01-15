import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, defaultValues, CampaignFormData } from './schema';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Save, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain, useReadContract, useSimulateContract } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI, CAMPAIGN_MANAGER_SEPOLIA_ADDRESS, APP_NETWORK, sonicBlaze } from '@/lib/abi';
import { mainnet, sonic, sepolia } from 'wagmi/chains';
import { getTokenBySymbol } from '@/lib/tokens';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

// Steps
import StepBasics from './steps/StepBasics';
import StepFunding from './steps/StepFunding';
import StepMilestones from './steps/StepMilestones';
import StepAllocation from './steps/StepAllocation';
import StepIdentity from './steps/StepIdentity';
import StepReview from './steps/StepReview';

const STEPS = [
    { id: 'basics', title: 'Basics', component: StepBasics },
    { id: 'funding', title: 'Funding', component: StepFunding },
    { id: 'milestones', title: 'Milestones', component: StepMilestones },
    { id: 'allocation', title: 'Allocation', component: StepAllocation },
    { id: 'identity', title: 'Identity', component: StepIdentity },
    { id: 'review', title: 'Review', component: StepReview },
];

const WizardLayout = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const { toast } = useToast();
    const isSubmittingRef = useRef(false);
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    // Check on-chain verification status
    const { isVerified, isLoading: isVerificationLoading } = useVerificationStatus(userAddress);

    // Track if we've loaded verification status at least once to prevent flickering
    const [hasLoadedVerification, setHasLoadedVerification] = useState(false);

    const {
        writeContract,
        data: hash,
        isPending: isWritePending,
        error: writeError
    } = useWriteContract();

    const methods = useForm<CampaignFormData>({
        resolver: zodResolver(campaignSchema),
        defaultValues,
        mode: 'onChange',
    });

    const { trigger, handleSubmit, formState: { isValid }, watch } = methods;
    const formData = watch();

    // Dynamic Addresses based on selected currency
    const selectedToken = getTokenBySymbol(watch('currency'));
    const isEthNetwork = selectedToken?.network === 'ethereum';
    const activeEthChain = APP_NETWORK === 'mainnet' ? mainnet : sepolia;
    const activeSonicChain = APP_NETWORK === 'mainnet' ? sonic : sonicBlaze;

    const targetChain = isEthNetwork ? activeEthChain : activeSonicChain;
    const campaignManagerAddr = isEthNetwork ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;

    const isWrongNetwork = chainId !== targetChain.id;


    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        data: receipt
    } = useWaitForTransactionReceipt({
        hash,
    });

    // Prepare arguments for simulation
    const endDate = Math.floor(Date.now() / 1000) + (formData.duration * 24 * 60 * 60);
    const formattedMilestones = formData.milestones?.map(m => ({
        title: m.title,
        fundingPercentage: BigInt(m.percentage),
        description: m.description,
        released: false
    })) || [];

    const { error: simulationError } = useSimulateContract({
        address: campaignManagerAddr,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'createCampaign',
        chainId: targetChain.id,
        args: currentStep === STEPS.length - 1 ? [
            formData.title,
            formData.description,
            formData.category,
            formData.image || "",
            parseUnits((formData.targetAmount || 0).toString(), selectedToken?.decimals || 18),
            formData.currency,
            BigInt(endDate),
            formattedMilestones
        ] : undefined,
        query: {
            enabled: currentStep === STEPS.length - 1 && !!userAddress,
        }
    });

    useEffect(() => {
        if (simulationError) {
            console.error("Simulation Error Details:", simulationError);
        }
    }, [simulationError]);

    // Update hasLoadedVerification when verification status loads
    useEffect(() => {
        if (!isVerificationLoading && userAddress) {
            setHasLoadedVerification(true);
        }
    }, [isVerificationLoading, userAddress]);

    // Monitor transaction states
    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Campaign Launched! 🚀",
                description: (
                    <div className="flex flex-col gap-1">
                        <span>Your campaign is now live on the blockchain.</span>
                        {hash && (
                            <a
                                href={`${targetChain?.blockExplorers?.default?.url}/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline text-fundhub-primary"
                            >
                                View Transaction
                            </a>
                        )}
                    </div>
                ),
                variant: "default",
            });
            // Redirect to campaigns list so they can see it
            setTimeout(() => {
                navigate('/campaigns');
            }, 2000);
        }
    }, [isConfirmed, toast, navigate, hash, targetChain]);

    useEffect(() => {
        if (writeError) {
            console.error("Write Error Details:", writeError);
            const isUserRejection = writeError.message?.includes("User rejected") || writeError.message?.includes("User denied");
            toast({
                title: isUserRejection ? "Transaction Cancelled" : "Deployment Failed",
                description: isUserRejection ? "You cancelled the transaction." : (writeError.message || "There was an error sending the transaction."),
                variant: isUserRejection ? "default" : "destructive",
            });
            isSubmittingRef.current = false;
        }
    }, [writeError, toast]);

    useEffect(() => {
        if (hash) {
            toast({
                title: "Transaction Sent! 🚀",
                description: (
                    <div className="flex flex-col gap-1">
                        <span>Waiting for blockchain confirmation...</span>
                        <a
                            href={`${targetChain?.blockExplorers?.default?.url}/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline text-fundhub-primary hover:text-fundhub-secondary"
                        >
                            View on Explorer
                        </a>
                    </div>
                ),
                variant: "default",
            });
        }
    }, [hash, toast, targetChain]);


    const handleNext = async () => {
        // Validate current step fields before moving on
        let fieldsToValidate: any[] = [];

        if (currentStep === 0) fieldsToValidate = ['title', 'category', 'description', 'location', 'image'];
        if (currentStep === 1) fieldsToValidate = ['targetAmount', 'duration', 'currency'];
        if (currentStep === 2) fieldsToValidate = ['milestones'];
        if (currentStep === 3) fieldsToValidate = ['allocations'];
        if (currentStep === 4) fieldsToValidate = ['orgType', 'contactEmail', 'isVerified'];

        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo(0, 0);
        } else {
            toast({
                title: "Please check your inputs",
                description: "Some fields are missing or invalid.",
                variant: "destructive"
            });
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSaveDraft = () => {
        toast({
            title: "Draft Saved",
            description: "Your progress has been saved locally.",
        });
    };

    const onSubmit = async (data: CampaignFormData) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        if (!userAddress) {
            isSubmittingRef.current = false;
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create a campaign.",
                variant: "destructive"
            });
            return;
        }


        if (chainId !== targetChain.id) {
            isSubmittingRef.current = false;
            toast({
                title: "Wrong Network",
                description: `Switching to ${targetChain.name}...`,
            });
            switchChain({ chainId: targetChain.id });
            return;
        }

        try {
            console.log("Form Data on Submit:", data);
            // 1. Convert duration (days) to end date (Unix timestamp)
            const endDate = Math.floor(Date.now() / 1000) + (data.duration * 24 * 60 * 60);

            // 2. Map milestones to contract struct
            const formattedMilestones = data.milestones.map(m => ({
                title: m.title,
                fundingPercentage: BigInt(m.percentage),
                description: m.description,
                released: false
            }));

            const goalUnits = parseUnits(data.targetAmount.toString(), selectedToken?.decimals || 18);

            console.log("Initiating createCampaign with args:", {
                title: data.title,
                description: data.description,
                category: data.category,
                image: data.image || "",
                goal: goalUnits.toString(),
                currency: data.currency,
                endDate: BigInt(endDate),
                milestones: formattedMilestones
            });

            writeContract({
                address: campaignManagerAddr,
                abi: CAMPAIGN_MANAGER_ABI,
                functionName: 'createCampaign',
                args: [
                    data.title,
                    data.description,
                    data.category,
                    data.image || "",
                    goalUnits,
                    data.currency,
                    BigInt(endDate),
                    formattedMilestones
                ],
                account: userAddress,
                chain: targetChain,
            });

        } catch (error: any) {
            console.error("Submission Error:", error);
            isSubmittingRef.current = false;

            const isUserRejection = error.message?.includes("User rejected") || error.message?.includes("User denied");
            toast({
                title: isUserRejection ? "Transaction Cancelled" : "Error",
                description: isUserRejection ? "You cancelled the transaction." : (error.message || "Failed to initiate transaction."),
                variant: isUserRejection ? "default" : "destructive"
            });
        }
    };

    const CurrentStepComponent = STEPS[currentStep].component;
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <FormProvider {...methods}>
            {/* Verification Check - Block if not verified */}
            {userAddress && hasLoadedVerification && !isVerified && (
                <div className="max-w-3xl mx-auto mb-8">
                    <Alert variant="destructive" className="border-2 border-red-300 bg-red-50/80 backdrop-blur-sm">
                        <ShieldAlert className="h-5 w-5" />
                        <AlertTitle className="font-black text-lg">KYC Verification Required</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-3 font-medium">
                                You must complete KYC verification before creating a campaign. This is an on-chain requirement to ensure platform security and compliance.
                            </p>

                            <Button
                                onClick={() => setCurrentStep(4)} // Step 5 is index 4 (Identity)
                                className="btn-gradient font-bold"
                            >
                                Go to Verification Step
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
                {/* Premium Wizard Header */}
                <div className="mb-10 sticky top-[80px] z-40 bg-white/80 backdrop-blur-xl py-6 px-8 rounded-3xl border-2 border-gray-200/80 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                                Step {currentStep + 1} of {STEPS.length}
                            </div>
                            <div className="text-xl font-black text-fundhub-dark">
                                {STEPS[currentStep].title}
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveDraft}
                            className="text-gray-500 hover:text-fundhub-primary hover:bg-fundhub-primary/10 transition-all"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Draft
                        </Button>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-gray-100" />
                </div>

                {/* Premium Step Content Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border-2 border-gray-200/80 mb-12 min-h-[500px]">
                    <CurrentStepComponent />

                    {currentStep === STEPS.length - 1 && simulationError && (
                        <div className="mt-8 p-6 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl">
                            <h4 className="text-red-800 font-black mb-2 flex items-center text-lg">
                                <ShieldCheck className="w-5 h-5 mr-2" />
                                Validation Error Detected
                            </h4>
                            <p className="text-sm text-red-700 font-medium leading-relaxed">
                                {simulationError.message.includes("sum to 100") ? "Error: Milestone percentages must sum exactly to 100%." :
                                    simulationError.message.includes("End date") ? "Error: The campaign duration/end date is invalid." :
                                        simulationError.message.includes("Goal exceeds") ? "Error: The target amount exceeds the 1M limit." :
                                            "The transaction is likely to revert. Check console for details or verify all inputs."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Premium Navigation Footer */}
                <div className="flex justify-between items-center pt-8 px-8 pb-8 bg-white/60 backdrop-blur-md rounded-3xl border-2 border-gray-200/80">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="w-36 h-12 rounded-xl border-2 border-gray-300 hover:border-fundhub-dark hover:bg-fundhub-dark hover:text-white transition-all font-bold disabled:opacity-40"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        isWrongNetwork && userAddress ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => switchChain({ chainId: targetChain.id })}
                                className="w-56 h-12 rounded-xl font-bold shadow-md transition-all"
                            >
                                Switch to {targetChain.name}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="w-56 h-12 btn-gradient rounded-xl font-black text-base shadow-lg shadow-fundhub-primary/30 hover:shadow-xl hover:shadow-fundhub-primary/40 transition-all"
                                disabled={isWritePending || isConfirming}
                            >
                                {isWritePending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Confirm in Wallet...
                                    </>
                                ) : isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Broadcasting...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Finish & Launch
                                    </>
                                )}
                            </Button>
                        )
                    ) : (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="w-36 h-12 bg-fundhub-dark text-white hover:bg-fundhub-primary rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default WizardLayout;
