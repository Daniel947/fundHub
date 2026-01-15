import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CampaignFormData } from '../schema';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StepReview = () => {
    const { watch } = useFormContext<CampaignFormData>();
    const data = watch();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Review & Launch</h2>
                <p className="text-gray-500">Double check everything before deploying to the blockchain.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Campaign Details</h3>
                            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                                <img
                                    src={data.image || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">{data.image ? "Campaign Cover Image" : "Campaign Header Preview"}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-xs uppercase tracking-wider">Title</Label>
                                <p className="font-semibold text-gray-900">{data.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Category</Label>
                                    <Badge variant="secondary" className="block w-fit mt-1">{data.category}</Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Subcategory</Label>
                                    <Badge variant="outline" className="block w-fit mt-1">{data.subcategory}</Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-xs uppercase tracking-wider">Location</Label>
                                <p className="text-sm font-medium">{data.location}</p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-xs uppercase tracking-wider">Story / Description</Label>
                                <p className="text-sm text-gray-600 line-clamp-4 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{data.description}"</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Funding & Identity</h3>
                            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-dashed">
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Goal</Label>
                                    <p className="font-bold text-xl text-fundhub-primary">{data.targetAmount} {data.currency}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Duration</Label>
                                    <p className="font-medium">{data.duration} Days</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Representing</Label>
                                    <p className="capitalize font-medium">{data.orgType}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Contact Email</Label>
                                    <p className="text-sm font-medium">{data.contactEmail}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Verification Status</Label>
                                    <div className="mt-1">
                                        {data.isVerified ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Fully Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                                <AlertCircle className="w-3 h-3 mr-1" /> Pending Verification
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2 flex justify-between items-center">
                                Milestones
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{data.milestones?.length} Stages</span>
                            </h3>
                            <div className="space-y-4">
                                {data.milestones?.map((m, i) => (
                                    <div key={i} className="relative pl-6 pb-2 border-l-2 border-fundhub-primary/20 last:border-0 last:pb-0">
                                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-fundhub-primary" />
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900 leading-tight">{m.title}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>
                                            </div>
                                            <Badge variant="secondary" className="font-mono">{m.percentage}%</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Fund Allocation</h3>
                            <div className="space-y-3">
                                {data.allocations?.map((a, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-600">{a.category}</span>
                                            <span className="text-gray-900">{a.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-fundhub-primary h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${a.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="bg-fundhub-primary/5 border border-fundhub-primary/20 p-5 rounded-2xl flex gap-4 text-sm">
                <div className="bg-fundhub-primary/10 p-2 rounded-lg h-fit">
                    <AlertCircle className="w-5 h-5 text-fundhub-primary" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-gray-900">Blockchain Deployment Final Notice</p>
                    <p className="text-gray-600 leading-relaxed">
                        By clicking "Create Campaign", you will initiate a blockchain transaction to deploy your Campaign Smart Contract.
                        This ensures maximum transparency. This action is immutable and will incur a small gas fee.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
