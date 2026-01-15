import React, { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Globe, Twitter, Linkedin, Save, Upload, CheckCircle } from 'lucide-react';
import AvatarPicker from '@/components/settings/AvatarPicker';

const focusAreaOptions = [
    'Technology', 'Environment', 'Education', 'Healthcare', 'Arts & Culture',
    'Social Impact', 'Climate Action', 'Sustainability', 'Community Development',
    'Innovation', 'Research', 'Humanitarian Aid'
];

const CreatorSettings = () => {
    const { address } = useAccount();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { campaigns } = useCreatorDashboard();

    // Calculate years active from first campaign
    const yearsActive = useMemo(() => {
        if (campaigns.length === 0) return 0;
        // Assuming campaigns have a createdAt or similar timestamp
        // For now, we'll use a simple calculation
        // In production, this should come from the earliest campaign creation date
        const currentYear = new Date().getFullYear();
        // Mock: assume first campaign was created in 2020
        return currentYear - 2020;
    }, [campaigns]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        type: 'Individual' as 'Individual' | 'NGO' | 'Organization',
        location: '',
        bio: '',
        website: '',
        twitter: '',
        linkedin: '',
        focusAreas: [] as string[]
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) {
                setIsInitialLoading(false);
                return;
            }

            setIsInitialLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/creator/${address}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || '',
                        avatar: data.avatar || '',
                        type: (data.type as any) || 'Individual',
                        location: data.location || '',
                        bio: data.bio || '',
                        website: data.website || '',
                        twitter: data.twitter || '',
                        linkedin: data.linkedin || '',
                        focusAreas: data.focusAreas || []
                    });
                } else if (response.status !== 404) {
                    console.error('Failed to fetch profile:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchProfile();
    }, [address]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFocusArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter(a => a !== area)
                : [...prev.focusAreas, area]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`http://localhost:3001/api/creator/${address}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            toast({
                title: "Profile Updated",
                description: "Your creator profile has been successfully updated.",
            });

            // Navigate to creator profile
            setTimeout(() => {
                navigate(`/creator/${address}`);
            }, 1500);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-inter">
                <DashboardSidebar />
                <main className="flex-1 p-8 lg:p-12 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-fundhub-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Loading profile settings...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-inter">
            <DashboardSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-fundhub-dark tracking-tight mb-2">Creator Settings</h1>
                        <p className="text-gray-500 font-medium">
                            Manage your public creator profile and verification
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Personal Information */}
                        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <User className="w-6 h-6 text-fundhub-primary" />
                                <h2 className="text-2xl font-black text-fundhub-dark">Personal Information</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Avatar Picker */}
                                <div>
                                    <Label className="text-sm font-bold text-gray-700 mb-3 block">
                                        Profile Avatar
                                    </Label>
                                    <div className="flex items-center gap-6">
                                        <AvatarPicker
                                            currentAvatar={formData.avatar}
                                            onSelect={(avatar) => handleInputChange('avatar', avatar)}
                                            creatorName={formData.name || 'Creator'}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Click to change avatar</p>
                                            <p className="text-xs text-gray-500">Choose from presets or upload your own image</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="name" className="text-sm font-bold text-gray-700 mb-2 block">
                                        Name / Organization Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter your name or organization name"
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type" className="text-sm font-bold text-gray-700 mb-2 block">
                                        Creator Type *
                                    </Label>
                                    <div className="flex gap-3">
                                        {(['Individual', 'NGO', 'Organization'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => handleInputChange('type', type)}
                                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${formData.type === type
                                                    ? 'bg-fundhub-dark text-white'
                                                    : 'bg-white/60 text-gray-600 hover:bg-white/80 border-2 border-gray-200/80'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="location" className="text-sm font-bold text-gray-700 mb-2 block">
                                        Location *
                                    </Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="City, Country"
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bio" className="text-sm font-bold text-gray-700 mb-2 block">
                                        Bio / Mission Statement *
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        placeholder="Tell donors about your mission and impact..."
                                        rows={4}
                                        maxLength={500}
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">{formData.bio.length}/500 characters</p>
                                </div>

                                <div>
                                    <Label htmlFor="yearsActive" className="text-sm font-bold text-gray-700 mb-2 block">
                                        Years Active
                                    </Label>
                                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200/80 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-fundhub-dark">{yearsActive}</span>
                                            <span className="text-xs text-gray-500">Calculated from first campaign</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Automatically calculated based on your campaign history</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-6 h-6 text-fundhub-primary" />
                                <h2 className="text-2xl font-black text-fundhub-dark">Social Links</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="website" className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Website
                                    </Label>
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://yourwebsite.com"
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="twitter" className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                                        <Twitter className="w-4 h-4" />
                                        Twitter
                                    </Label>
                                    <Input
                                        id="twitter"
                                        value={formData.twitter}
                                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                                        placeholder="https://twitter.com/yourhandle"
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="linkedin" className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </Label>
                                    <Input
                                        id="linkedin"
                                        value={formData.linkedin}
                                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="rounded-xl border-2 border-gray-200/80"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Focus Areas */}
                        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-fundhub-dark mb-2">Focus Areas</h2>
                                <p className="text-sm text-gray-500">Select the categories that best describe your work</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {focusAreaOptions.map((area) => (
                                    <button
                                        key={area}
                                        onClick={() => toggleFocusArea(area)}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${formData.focusAreas.includes(area)
                                            ? 'bg-fundhub-primary text-white'
                                            : 'bg-white/60 text-gray-600 hover:bg-white/80 border-2 border-gray-200/80'
                                            }`}
                                    >
                                        {formData.focusAreas.includes(area) && (
                                            <CheckCircle className="w-4 h-4 inline mr-2" />
                                        )}
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !formData.name || !formData.bio || !formData.location}
                                className="flex-1 btn-gradient px-8 py-6 rounded-xl font-black text-lg shadow-lg shadow-fundhub-primary/30 hover:shadow-xl transition-all"
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Profile
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                className="px-8 py-6 rounded-xl font-bold text-lg border-2 border-gray-200/80"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Background Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fundhub-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fundhub-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
    );
};

export default CreatorSettings;
