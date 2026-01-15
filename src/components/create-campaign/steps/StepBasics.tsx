import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignFormData, CATEGORIES, CategoryKey } from '../schema';
import { Upload, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';

const StepBasics = () => {
    const { register, formState: { errors }, setValue, watch } = useFormContext<CampaignFormData>();
    const category = watch('category');
    const subcategory = watch('subcategory');
    const imageUrl = watch('image');
    const [isUploading, setIsUploading] = useState(false);

    // Register manually managed fields on mount
    useEffect(() => {
        register('image');
        register('category');
        register('subcategory');
    }, [register]);

    // Reset subcategory when category changes
    useEffect(() => {
        if (category && !Object.keys(CATEGORIES).includes(category)) {
            // Handle case if category is invalid (cleanup or reset)
        }
    }, [category]);

    const subcategories = category ? CATEGORIES[category as CategoryKey] || [] : [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Let's start with the basics</h2>
                <p className="text-gray-500">Tell us the story of your impact.</p>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    {/* Campaign Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Campaign Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Clean Water for Rural Villages"
                            {...register('title')}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                onValueChange={(val) => {
                                    setValue('category', val);
                                    setValue('subcategory', ''); // Reset subcategory
                                }}
                                value={category || ""}
                            >
                                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CATEGORIES).map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                        </div>

                        {/* Subcategory - dependent */}
                        <div className="space-y-2">
                            <Label>Subcategory</Label>
                            <Select
                                onValueChange={(val) => setValue('subcategory', val)}
                                value={subcategory || ""}
                                disabled={!category}
                            >
                                <SelectTrigger className={errors.subcategory ? "border-red-500" : ""}>
                                    <SelectValue placeholder={category ? "Select subcategory" : "Select category first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategories.map((sub) => (
                                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.subcategory && <p className="text-red-500 text-xs">{errors.subcategory.message}</p>}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="location"
                                placeholder="e.g. Ghana, Accra"
                                {...register('location')}
                                className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                            />
                        </div>
                        {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Story & Impact</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the problem, your solution, and the impact donors will make..."
                            rows={6}
                            {...register('description')}
                            className={errors.description ? "border-red-500" : ""}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{errors.description ? <span className="text-red-500">{errors.description.message}</span> : "Be clear and specific."}</span>
                            <span>Min 10 chars</span>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 relative min-h-[240px] flex flex-col items-center justify-center",
                                imageUrl ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:bg-gray-50 bg-white",
                                isUploading && "opacity-60 pointer-events-none",
                                "cursor-pointer group"
                            )}
                            onClick={() => !isUploading && document.getElementById('image-upload')?.click()}
                        >
                            <input
                                type="file"
                                id="image-upload"
                                className="hidden"
                                accept="image/*"
                                disabled={isUploading}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setIsUploading(true);
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    try {
                                        // Use axios to avoid DataCloneError in some extensions 
                                        // and provide a better upload experience
                                        const response = await axios.post('http://localhost:3001/api/upload', formData, {
                                            headers: {
                                                'Content-Type': 'multipart/form-data'
                                            }
                                        });

                                        if (response.data.url) {
                                            setValue('image', response.data.url);
                                        }
                                    } catch (err) {
                                        console.error('Upload failed:', err);
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }}
                            />

                            {isUploading ? (
                                <div className="space-y-3 flex flex-col items-center">
                                    <Loader2 className="h-10 w-10 text-fundhub-primary animate-spin" />
                                    <p className="text-sm font-medium text-gray-600">Uploading to IPFS...</p>
                                </div>
                            ) : imageUrl ? (
                                <div className="w-full h-full relative group">
                                    <img
                                        src={imageUrl}
                                        alt="Cover"
                                        className="w-full max-h-[300px] object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <p className="text-white text-sm font-medium">Click to Change Image</p>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-fundhub-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="h-8 w-8 text-fundhub-primary" />
                                    </div>
                                    <p className="text-base font-semibold text-gray-900 leading-tight">Click to upload campaign cover</p>
                                    <p className="text-xs text-gray-500 mt-2">IPFS Secured • PNG, JPG, GIF</p>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StepBasics;
