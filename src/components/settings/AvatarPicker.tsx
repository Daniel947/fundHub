import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Check } from 'lucide-react';

interface AvatarPickerProps {
    currentAvatar?: string;
    onSelect: (avatar: string) => void;
    creatorName: string;
}

const presetAvatars = [
    // Identicon - Geometric patterns (clean, consistent Web3 aesthetic)
    'https://api.dicebear.com/7.x/identicon/svg?seed=1a2b3c',
    'https://api.dicebear.com/7.x/identicon/svg?seed=4d5e6f',
    'https://api.dicebear.com/7.x/identicon/svg?seed=7g8h9i',
    'https://api.dicebear.com/7.x/identicon/svg?seed=0j1k2l',
    'https://api.dicebear.com/7.x/identicon/svg?seed=3m4n5o',
    'https://api.dicebear.com/7.x/identicon/svg?seed=6p7q8r',
    'https://api.dicebear.com/7.x/identicon/svg?seed=9s0t1u',
    'https://api.dicebear.com/7.x/identicon/svg?seed=2v3w4x',
    'https://api.dicebear.com/7.x/identicon/svg?seed=5y6z7a',
    'https://api.dicebear.com/7.x/identicon/svg?seed=8b9c0d',
    'https://api.dicebear.com/7.x/identicon/svg?seed=1e2f3g',
    'https://api.dicebear.com/7.x/identicon/svg?seed=4h5i6j',
    'https://api.dicebear.com/7.x/identicon/svg?seed=7k8l9m',
    'https://api.dicebear.com/7.x/identicon/svg?seed=0n1o2p',
    'https://api.dicebear.com/7.x/identicon/svg?seed=3q4r5s',
    'https://api.dicebear.com/7.x/identicon/svg?seed=6t7u8v',
    'https://api.dicebear.com/7.x/identicon/svg?seed=9w0x1y',
    'https://api.dicebear.com/7.x/identicon/svg?seed=2z3a4b',
    'https://api.dicebear.com/7.x/identicon/svg?seed=5c6d7e',
    'https://api.dicebear.com/7.x/identicon/svg?seed=8f9g0h',
    'https://api.dicebear.com/7.x/identicon/svg?seed=alpha1',
    'https://api.dicebear.com/7.x/identicon/svg?seed=beta2',
    'https://api.dicebear.com/7.x/identicon/svg?seed=gamma3',
    'https://api.dicebear.com/7.x/identicon/svg?seed=delta4',
    'https://api.dicebear.com/7.x/identicon/svg?seed=epsilon5',
    'https://api.dicebear.com/7.x/identicon/svg?seed=zeta6',
    'https://api.dicebear.com/7.x/identicon/svg?seed=eta7',
    'https://api.dicebear.com/7.x/identicon/svg?seed=theta8',
    'https://api.dicebear.com/7.x/identicon/svg?seed=iota9',
    'https://api.dicebear.com/7.x/identicon/svg?seed=kappa0',
    'https://api.dicebear.com/7.x/identicon/svg?seed=lambda11',
    'https://api.dicebear.com/7.x/identicon/svg?seed=mu12',
    'https://api.dicebear.com/7.x/identicon/svg?seed=nu13',
    'https://api.dicebear.com/7.x/identicon/svg?seed=xi14',
    'https://api.dicebear.com/7.x/identicon/svg?seed=omicron15',
    'https://api.dicebear.com/7.x/identicon/svg?seed=pi16',
    'https://api.dicebear.com/7.x/identicon/svg?seed=rho17',
    'https://api.dicebear.com/7.x/identicon/svg?seed=sigma18',
    'https://api.dicebear.com/7.x/identicon/svg?seed=tau19',
    'https://api.dicebear.com/7.x/identicon/svg?seed=upsilon20',
    'https://api.dicebear.com/7.x/identicon/svg?seed=phi21',
    'https://api.dicebear.com/7.x/identicon/svg?seed=chi22',
    'https://api.dicebear.com/7.x/identicon/svg?seed=psi23',
    'https://api.dicebear.com/7.x/identicon/svg?seed=omega24',
    'https://api.dicebear.com/7.x/identicon/svg?seed=quantum25',
    'https://api.dicebear.com/7.x/identicon/svg?seed=nexus26',
    'https://api.dicebear.com/7.x/identicon/svg?seed=prism27',
    'https://api.dicebear.com/7.x/identicon/svg?seed=vertex28',
];

// Avatar item component with loading state
const AvatarItem = ({ avatar, isSelected, onSelect }: { avatar: string; isSelected: boolean; onSelect: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <button
            onClick={onSelect}
            className={`relative rounded-full border-4 transition-all ${isSelected
                ? 'border-fundhub-primary scale-110'
                : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            <Avatar className="w-14 h-14">
                {isLoading && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                )}
                <AvatarImage
                    src={avatar}
                    className="object-cover"
                    onLoad={() => setIsLoading(false)}
                />
            </Avatar>
            {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-fundhub-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}
        </button>
    );
};

const AvatarPicker = ({ currentAvatar, onSelect, creatorName }: AvatarPickerProps) => {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (avatar: string) => {
        setSelectedAvatar(avatar);
    };

    const handleConfirm = () => {
        onSelect(selectedAvatar);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src={currentAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-fundhub-primary to-fundhub-secondary text-white font-black text-3xl">
                            {creatorName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-fundhub-dark">Choose Your Avatar</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                    {/* Preset Avatars */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Preset Avatars</h3>
                        <div className="grid grid-cols-8 gap-3 max-h-80 overflow-y-auto pr-2">
                            {presetAvatars.map((avatar, i) => (
                                <AvatarItem
                                    key={i}
                                    avatar={avatar}
                                    isSelected={selectedAvatar === avatar}
                                    onSelect={() => handleSelect(avatar)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {selectedAvatar && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <Avatar className="w-16 h-16 border-2 border-gray-200">
                                <AvatarImage src={selectedAvatar} />
                            </Avatar>
                            <div>
                                <p className="text-sm font-bold text-gray-700">Preview</p>
                                <p className="text-xs text-gray-500">This is how your avatar will appear</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedAvatar}
                        className="flex-1 btn-gradient rounded-xl font-bold"
                    >
                        Confirm Selection
                    </Button>
                    <Button
                        onClick={() => setIsOpen(false)}
                        variant="outline"
                        className="px-8 rounded-xl font-bold border-2"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AvatarPicker;
