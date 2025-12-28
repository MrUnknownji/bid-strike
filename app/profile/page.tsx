'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AvatarPicker from '@/components/common/AvatarPicker';
import { User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface UserData {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatar, setAvatar] = useState<string | File>('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    router.push('/login');
                    return;
                }

                const data = await res.json();
                setUser(data.user);
                setAvatar(data.user.avatar || '');
                setFormData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    phone: data.user.phone || '',
                });
            } catch {
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSaving(true);

        const token = localStorage.getItem('accessToken');

        try {
            const avatarValue = typeof avatar === 'string' ? avatar : 'custom-upload';

            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    avatar: avatarValue,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to update' });
                return;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="space-y-6">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {message.text && (
                <div
                    className={`flex items-center gap-2 p-4 mb-6 text-sm rounded-lg animate-in fade-in slide-in-from-top-2 ${message.type === 'error'
                        ? 'text-destructive bg-destructive/10'
                        : 'text-primary bg-primary/10'
                        }`}
                >
                    {message.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Upload a custom photo or choose from defaults</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AvatarPicker
                            currentAvatar={typeof avatar === 'string' ? avatar : undefined}
                            username={`${formData.firstName} ${formData.lastName}`.trim() || user.username}
                            onAvatarChange={setAvatar}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Username</p>
                                <p className="font-medium">{user.username}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email
                                </p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="min-w-[120px]"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
