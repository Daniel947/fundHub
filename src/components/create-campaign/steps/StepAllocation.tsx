import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, PieChart } from 'lucide-react';
import { CampaignFormData } from '../schema';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const StepAllocation = () => {
    const { register, control, formState: { errors }, watch, setValue } = useFormContext<CampaignFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "allocations"
    });

    const allocations = watch('allocations');
    const totalPercentage = allocations?.reduce((acc, curr) => acc + (curr.percentage || 0), 0) || 0;
    const isComplete = Math.abs(totalPercentage - 100) < 0.1;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Transparency Breakdown</h2>
                <p className="text-gray-500">Show donors exactly how their money will be used.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Allocation Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Label>Category</Label>
                                            <Input
                                                placeholder="e.g. Equipment"
                                                {...register(`allocations.${index}.category`)}
                                                className={errors.allocations?.[index]?.category ? "border-red-500" : ""}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label>% Budget</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={allocations?.[index]?.percentage || ''}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (isNaN(val)) return;

                                                        const currentTotal = allocations?.reduce((acc, curr, i) =>
                                                            i === index ? acc : acc + (curr.percentage || 0), 0
                                                        ) || 0;

                                                        const remaining = 100 - currentTotal;
                                                        const safeValue = Math.min(Math.max(0, val), remaining);

                                                        setValue(`allocations.${index}.percentage`, safeValue, { shouldValidate: true });
                                                    }}
                                                    className={errors.allocations?.[index]?.percentage ? "border-red-500" : ""}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => remove(index)} className="mb-0.5 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ category: '', percentage: 0 })}
                                disabled={isComplete}
                                className={`w-full border-dashed ${isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isComplete ? "Max Budget Allocated (100%)" : <><Plus className="w-4 h-4 mr-2" /> Add Category</>}
                            </Button>

                            {errors.allocations && typeof errors.allocations.message === 'string' && (
                                <p className="text-red-500 text-sm">{errors.allocations.message}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Visual Preview */}
                <div className="md:col-span-1">
                    <Card className="bg-gray-50 border-gray-200 h-full">
                        <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center mb-4">
                                <PieChart className="w-10 h-10 text-gray-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-xl font-bold ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                                        {totalPercentage}%
                                    </span>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Budget Allocation</h3>
                            <p className="text-xs text-gray-500">
                                {isComplete ? "Budget is fully allocated." : "Please allocate exactly 100% of the budget."}
                            </p>

                            <div className="w-full mt-6 space-y-2">
                                {allocations?.map((alloc, idx) => (alloc.percentage > 0 && (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{alloc.category || 'Uncategorized'}</span>
                                        <span className="font-mono">{alloc.percentage}%</span>
                                    </div>
                                )))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StepAllocation;
