import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Settings, { SETTING_KEYS } from '@/lib/db/Settings';
import { getTokenFromRequest } from '@/lib/middleware/auth';
import User from '@/lib/db/User';
import { testStripeConnection, resetStripeInstance } from '@/lib/services/paymentService';
import { testEmailConnection, resetResendInstance } from '@/lib/services/emailService';

async function isAdmin(request: NextRequest) {
    const payload = getTokenFromRequest(request);
    if (!payload) return false;

    await connectDB();
    const user = await User.findById(payload.userId);
    return user?.role === 'admin';
}

export async function GET(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const settings = await Settings.find({
        key: { $in: Object.values(SETTING_KEYS) },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
        settingsMap[s.key] = s.key.includes('secret') || s.key.includes('api_key')
            ? s.value ? '••••••••' + s.value.slice(-4) : ''
            : s.value;
    });

    return NextResponse.json({ settings: settingsMap });
}

export async function PUT(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { key, value } = body;

    if (!key || !Object.values(SETTING_KEYS).includes(key)) {
        return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
    }

    await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
    );

    if (key.includes('stripe')) {
        resetStripeInstance();
    } else if (key.includes('resend') || key === SETTING_KEYS.EMAIL_FROM) {
        resetResendInstance();
    }

    return NextResponse.json({ message: 'Setting updated' });
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, testEmail } = body;

    if (action === 'test-stripe') {
        const result = await testStripeConnection();
        return NextResponse.json(result);
    }

    if (action === 'test-email') {
        if (!testEmail) {
            return NextResponse.json({ success: false, message: 'Test email address required' });
        }
        const result = await testEmailConnection(testEmail);
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
