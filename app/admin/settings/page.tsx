'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SETTING_KEYS = {
    STRIPE_SECRET_KEY: 'stripe_secret_key',
    STRIPE_PUBLISHABLE_KEY: 'stripe_publishable_key',
    STRIPE_WEBHOOK_SECRET: 'stripe_webhook_secret',
    RESEND_API_KEY: 'resend_api_key',
    EMAIL_FROM: 'email_from',
};

export default function AdminSettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [testResult, setTestResult] = useState<{ type: string; success: boolean; message: string } | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }
        if (user?.role === 'admin') {
            fetchSettings();
        }
    }, [user, authLoading, router, fetchSettings]);

    async function saveSetting(key: string, value: string) {
        setIsSaving(key);
        try {
            const token = localStorage.getItem('accessToken');
            await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ key, value }),
            });
            fetchSettings();
        } catch (error) {
            console.error('Failed to save setting:', error);
        } finally {
            setIsSaving(null);
        }
    }

    async function testConnection(type: 'stripe' | 'email') {
        setIsTesting(type);
        setTestResult(null);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: type === 'stripe' ? 'test-stripe' : 'test-email',
                    testEmail: type === 'email' ? testEmail : undefined,
                }),
            });
            const result = await response.json();
            setTestResult({ type, ...result });
        } catch {
            setTestResult({ type, success: false, message: 'Test failed' });
        } finally {
            setIsTesting(null);
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Service Settings</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>Stripe Payment</CardTitle>
                            <CardDescription>Configure Stripe for payment processing</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingInput
                        label="Secret Key"
                        settingKey={SETTING_KEYS.STRIPE_SECRET_KEY}
                        value={settings[SETTING_KEYS.STRIPE_SECRET_KEY] || ''}
                        placeholder="sk_live_..."
                        isSecret
                        isSaving={isSaving === SETTING_KEYS.STRIPE_SECRET_KEY}
                        onSave={saveSetting}
                    />
                    <SettingInput
                        label="Publishable Key"
                        settingKey={SETTING_KEYS.STRIPE_PUBLISHABLE_KEY}
                        value={settings[SETTING_KEYS.STRIPE_PUBLISHABLE_KEY] || ''}
                        placeholder="pk_live_..."
                        isSaving={isSaving === SETTING_KEYS.STRIPE_PUBLISHABLE_KEY}
                        onSave={saveSetting}
                    />
                    <SettingInput
                        label="Webhook Secret"
                        settingKey={SETTING_KEYS.STRIPE_WEBHOOK_SECRET}
                        value={settings[SETTING_KEYS.STRIPE_WEBHOOK_SECRET] || ''}
                        placeholder="whsec_..."
                        isSecret
                        isSaving={isSaving === SETTING_KEYS.STRIPE_WEBHOOK_SECRET}
                        onSave={saveSetting}
                    />

                    <div className="pt-4 flex items-center gap-4">
                        <Button onClick={() => testConnection('stripe')} disabled={isTesting === 'stripe'}>
                            {isTesting === 'stripe' ? 'Testing...' : 'Test Connection'}
                        </Button>
                        {testResult?.type === 'stripe' && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-destructive'}`}>
                                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>Resend Email</CardTitle>
                            <CardDescription>Configure Resend for transactional emails</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingInput
                        label="API Key"
                        settingKey={SETTING_KEYS.RESEND_API_KEY}
                        value={settings[SETTING_KEYS.RESEND_API_KEY] || ''}
                        placeholder="re_..."
                        isSecret
                        isSaving={isSaving === SETTING_KEYS.RESEND_API_KEY}
                        onSave={saveSetting}
                    />
                    <SettingInput
                        label="From Email"
                        settingKey={SETTING_KEYS.EMAIL_FROM}
                        value={settings[SETTING_KEYS.EMAIL_FROM] || ''}
                        placeholder="noreply@yourdomain.com"
                        isSaving={isSaving === SETTING_KEYS.EMAIL_FROM}
                        onSave={saveSetting}
                    />

                    <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Test email address"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="max-w-xs"
                            />
                            <Button onClick={() => testConnection('email')} disabled={isTesting === 'email' || !testEmail}>
                                {isTesting === 'email' ? 'Sending...' : 'Send Test Email'}
                            </Button>
                        </div>
                        {testResult?.type === 'email' && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-destructive'}`}>
                                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SettingInput({
    label,
    settingKey,
    value,
    placeholder,
    isSecret,
    isSaving,
    onSave,
}: {
    label: string;
    settingKey: string;
    value: string;
    placeholder: string;
    isSecret?: boolean;
    isSaving: boolean;
    onSave: (key: string, value: string) => void;
}) {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <Input
                            type={isSecret ? 'password' : 'text'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            onClick={() => {
                                onSave(settingKey, inputValue);
                                setIsEditing(false);
                                setInputValue('');
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setInputValue(''); }}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Input
                            value={value || 'Not configured'}
                            disabled
                            className="flex-1"
                        />
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                            {value ? 'Update' : 'Set'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
