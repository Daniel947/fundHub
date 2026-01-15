import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CampaignFormData } from '../schema';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { BTCLogo, ETHLogo, USDCLogo, USDTLogo, SONICLogo } from '@/components/ui/crypto-icons';
import { usePriceFeed } from '@/hooks/usePriceFeed';

const StepFunding = () => {
    const { register, formState: { errors }, watch, setValue } = useFormContext<CampaignFormData>();
    const duration = watch('duration');
    const amount = watch('targetAmount');
    const currency = watch('currency');
    const { convertToUSD } = usePriceFeed();

    // Calculate end date based on duration
    const today = new Date();
    const endDate = addDays(today, duration || 30);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const diff = differenceInDays(date, today);
            setValue('duration', Math.min(Math.max(diff, 1), 365));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Funding & Scope</h2>
                <p className="text-gray-500">Set realistic goals to build trust.</p>
            </div>

            <Card>
                <CardContent className="space-y-8 pt-6">
                    {/* Target Amount & Currency */}
                    <div className="space-y-4">
                        <Label htmlFor="targetAmount" className="text-lg">Funding Goal</Label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Input
                                    id="targetAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('targetAmount', { valueAsNumber: true })}
                                    className={`text-3xl font-bold py-6 pl-4 ${errors.targetAmount ? "border-red-500" : ""}`}
                                />
                                {amount > 0 && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                        ≈ ${convertToUSD(amount, currency)} USD
                                    </div>
                                )}
                            </div>
                            <div className="w-32">
                                <Select onValueChange={(val: any) => setValue('currency', val)} defaultValue={currency}>
                                    <SelectTrigger className="h-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ETH">
                                            <div className="flex items-center gap-2">
                                                <ETHLogo className="w-5 h-5" />
                                                <span>ETH (Ethereum)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="BTC">
                                            <div className="flex items-center gap-2">
                                                <BTCLogo className="w-5 h-5" />
                                                <span>BTC (Bitcoin)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="USDC">
                                            <div className="flex items-center gap-2">
                                                <USDCLogo className="w-5 h-5" />
                                                <span>USDC (Ethereum)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="USDT">
                                            <div className="flex items-center gap-2">
                                                <USDTLogo className="w-5 h-5" />
                                                <span>USDT (Ethereum)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="S">
                                            <div className="flex items-center gap-2">
                                                <SONICLogo className="w-5 h-5" />
                                                <span>S (Sonic)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="BTC">
                                            <div className="flex items-center gap-2">
                                                <BTCLogo className="w-5 h-5" />
                                                <span>BTC (Bitcoin - Bridged)</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}

                        {currency === 'BTC' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-2 items-start text-sm text-blue-700">
                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>BTC campaigns are registered on Sonic. Donors send BTC to a unique address, and the amount is synced to your Sonic registry.</p>
                            </div>
                        )}

                        {amount > 100 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex gap-2 items-start text-sm text-yellow-700">
                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>High funding goals (&gt;100 {currency}) require additional verification steps.</p>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Duration & Date Picker */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <Label className="text-lg">Campaign Duration</Label>

                            <div className="flex gap-4 items-center">
                                <span className="text-2xl font-bold text-fundhub-primary">{duration} Days</span>
                                <span className="text-gray-300">|</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={handleDateSelect}
                                            disabled={(date) =>
                                                date < new Date() || date > addDays(new Date(), 365)
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <Slider
                            value={[duration]}
                            max={365}
                            min={1}
                            step={1}
                            onValueChange={(vals) => setValue('duration', vals[0])}
                            className="py-4"
                        />

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>1 Day</span>
                            <span>365 Days</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StepFunding;
