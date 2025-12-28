'use client';

import { useState } from 'react';
import { User, Camera, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DEFAULT_AVATARS = [
    { id: 'default-1', gradient: 'from-violet-500 to-purple-600' },
    { id: 'default-2', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'default-3', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'default-4', gradient: 'from-orange-500 to-amber-500' },
    { id: 'default-5', gradient: 'from-rose-500 to-pink-500' },
    { id: 'default-6', gradient: 'from-indigo-500 to-blue-600' },
];

interface AvatarPickerProps {
    currentAvatar?: string | null;
    username?: string;
    onAvatarChange: (avatar: string | File) => void;
    className?: string;
}

export default function AvatarPicker({
    currentAvatar,
    username = 'User',
    onAvatarChange,
    className,
}: AvatarPickerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(
        currentAvatar?.startsWith('default-') ? currentAvatar : null
    );
    const [customPreview, setCustomPreview] = useState<string | null>(
        currentAvatar && !currentAvatar.startsWith('default-') ? currentAvatar : null
    );
    const [isHovering, setIsHovering] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setCustomPreview(url);
            setSelectedId(null);
            onAvatarChange(file);
        }
    };

    const handleDefaultSelect = (id: string) => {
        setSelectedId(id);
        setCustomPreview(null);
        onAvatarChange(id);
    };

    const getInitials = () => {
        return username
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex flex-col items-center gap-4">
                <div
                    className="relative group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div
                        className={cn(
                            'w-28 h-28 rounded-full overflow-hidden transition-all duration-300',
                            'ring-4 ring-primary/20 group-hover:ring-primary/40',
                            'shadow-xl shadow-primary/10'
                        )}
                    >
                        {customPreview ? (
                            <img
                                src={customPreview}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : selectedId ? (
                            <div
                                className={cn(
                                    'w-full h-full flex items-center justify-center bg-gradient-to-br',
                                    DEFAULT_AVATARS.find((a) => a.id === selectedId)?.gradient
                                )}
                            >
                                <span className="text-3xl font-bold text-white">
                                    {getInitials()}
                                </span>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                <User className="w-12 h-12 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <label
                        className={cn(
                            'absolute bottom-0 right-0 w-10 h-10 rounded-full cursor-pointer',
                            'bg-primary text-primary-foreground flex items-center justify-center',
                            'shadow-lg transition-all duration-300',
                            'hover:scale-110 hover:bg-primary/90',
                            isHovering && 'scale-110'
                        )}
                    >
                        <Camera className="w-5 h-5" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>

                <p className="text-sm text-muted-foreground">
                    Upload a photo or choose from defaults
                </p>
            </div>

            <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Default Avatars</p>
                <div className="grid grid-cols-6 gap-3">
                    {DEFAULT_AVATARS.map((avatar) => {
                        const isSelected = selectedId === avatar.id;
                        return (
                            <button
                                key={avatar.id}
                                onClick={() => handleDefaultSelect(avatar.id)}
                                className={cn(
                                    'relative aspect-square rounded-full overflow-hidden transition-all duration-300',
                                    'ring-2 hover:scale-110',
                                    isSelected
                                        ? 'ring-primary ring-offset-2 ring-offset-background scale-110'
                                        : 'ring-transparent hover:ring-primary/50'
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-full h-full flex items-center justify-center bg-gradient-to-br',
                                        avatar.gradient
                                    )}
                                >
                                    <span className="text-sm font-bold text-white">
                                        {getInitials()}
                                    </span>
                                </div>

                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {(customPreview || selectedId) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setCustomPreview(null);
                        setSelectedId(null);
                        onAvatarChange('');
                    }}
                    className="w-full text-muted-foreground hover:text-foreground"
                >
                    Remove avatar
                </Button>
            )}
        </div>
    );
}
