import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { CampaignFormData } from '../schema';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const StepMilestones = () => {
    const { register, control, formState: { errors }, watch, setValue } = useFormContext<CampaignFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "milestones"
    });

    const milestones = watch('milestones');
    const totalPercentage = milestones?.reduce((acc, curr) => acc + (curr.percentage || 0), 0) || 0;
    const isComplete = Math.abs(totalPercentage - 100) < 0.1;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Define Your Milestones</h2>
                <p className="text-gray-500">Funds are released only when these milestones are verified.</p>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    {/* Progress Bar */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm text-gray-700">Total Funds Allocated</span>
                            <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-orange-500'}`}>
                                {totalPercentage}% / 100%
                            </span>
                        </div>
                        <Progress value={totalPercentage} className={`h-2 ${totalPercentage > 100 ? 'bg-red-100' : ''}`} />
                        {!isComplete && (
                            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Allocation must equal exactly 100%.
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-fundhub-primary/30 transition-colors">
                                <div className="absolute top-4 right-4">
                                    {fields.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-8 space-y-4">
                                        <div>
                                            <Label>Milestone Title</Label>
                                            <Input
                                                placeholder="e.g. Foundation Complete"
                                                {...register(`milestones.${index}.title`)}
                                                className={errors.milestones?.[index]?.title ? "border-red-500" : ""}
                                            />
                                            {errors.milestones?.[index]?.title && <p className="text-red-500 text-xs">{errors.milestones[index]?.title?.message}</p>}
                                        </div>
                                        <div>
                                            <Label>Description & Proof Required</Label>
                                            <Input
                                                placeholder="What will represent success? e.g. Site photos and inspection report"
                                                {...register(`milestones.${index}.description`)}
                                                className={errors.milestones?.[index]?.description ? "border-red-500" : ""}
                                            />
                                            {errors.milestones?.[index]?.description && <p className="text-red-500 text-xs">{errors.milestones[index]?.description?.message}</p>}
                                        </div>
                                    </div>

                                    <div className="md:col-span-4">
                                        <Label>Funds to Release (%)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={milestones?.[index]?.percentage || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (isNaN(val)) return;

                                                    // Calculate total of others
                                                    const currentTotal = milestones?.reduce((acc, curr, i) =>
                                                        i === index ? acc : acc + (curr.percentage || 0), 0
                                                    ) || 0;

                                                    // Clamp to remaining
                                                    const remaining = 100 - currentTotal;
                                                    const safeValue = Math.min(Math.max(0, val), remaining);

                                                    setValue(`milestones.${index}.percentage`, safeValue, { shouldValidate: true });
                                                }}
                                                className={`pr-8 ${errors.milestones?.[index]?.percentage ? "border-red-500" : ""}`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ id: Date.now().toString(), title: '', description: '', percentage: 0, proofType: 'photo' })}
                        disabled={isComplete}
                        className={cn(
                            "w-full border-dashed border-2 py-6 text-gray-500 hover:text-fundhub-primary hover:border-fundhub-primary",
                            isComplete && "opacity-50 cursor-not-allowed hover:text-gray-500 hover:border-gray-200"
                        )}
                    >
                        {isComplete ? (
                            <span>Max allocation reached (100%)</span>
                        ) : (
                            <><Plus className="w-4 h-4 mr-2" /> Add Milestone</>
                        )}
                    </Button>

                    {errors.milestones && typeof errors.milestones.message === 'string' && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.milestones.message}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StepMilestones;
