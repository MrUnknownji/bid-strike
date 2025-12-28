import { Resend } from 'resend';
import connectDB from '@/lib/db/database';
import Settings, { SETTING_KEYS } from '@/lib/db/Settings';

let resendInstance: Resend | null = null;

async function getResend(): Promise<{ resend: Resend; fromEmail: string } | null> {
    await connectDB();
    const [apiKeySetting, fromEmailSetting] = await Promise.all([
        Settings.findOne({ key: SETTING_KEYS.RESEND_API_KEY }),
        Settings.findOne({ key: SETTING_KEYS.EMAIL_FROM }),
    ]);

    if (!apiKeySetting?.value) {
        return null;
    }

    if (!resendInstance) {
        resendInstance = new Resend(apiKeySetting.value);
    }

    return {
        resend: resendInstance,
        fromEmail: fromEmailSetting?.value || 'noreply@bidstrike.com',
    };
}

export async function sendEmail(params: {
    to: string;
    subject: string;
    html: string;
}) {
    const config = await getResend();
    if (!config) {
        throw new Error('Email service not configured');
    }

    const result = await config.resend.emails.send({
        from: config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
    });

    return result;
}

export async function sendWelcomeEmail(email: string, username: string) {
    return sendEmail({
        to: email,
        subject: 'Welcome to BidStrike!',
        html: `
            <h1>Welcome to BidStrike, ${username}!</h1>
            <p>Thank you for joining our auction platform.</p>
            <p>Start exploring auctions and place your first bid today!</p>
        `,
    });
}

export async function sendOutbidEmail(email: string, auctionTitle: string, newAmount: number) {
    return sendEmail({
        to: email,
        subject: `You've been outbid on "${auctionTitle}"`,
        html: `
            <h2>You've been outbid!</h2>
            <p>Someone placed a higher bid of <strong>$${newAmount.toFixed(2)}</strong> on "${auctionTitle}".</p>
            <p>Place a higher bid to stay in the lead!</p>
        `,
    });
}

export async function sendAuctionWonEmail(email: string, auctionTitle: string, amount: number, checkoutUrl: string) {
    return sendEmail({
        to: email,
        subject: `Congratulations! You won "${auctionTitle}"`,
        html: `
            <h2>🎉 Congratulations!</h2>
            <p>You won the auction for "<strong>${auctionTitle}</strong>" with a bid of <strong>$${amount.toFixed(2)}</strong>.</p>
            <p><a href="${checkoutUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">Complete Payment</a></p>
        `,
    });
}

export async function sendPaymentConfirmationEmail(email: string, auctionTitle: string, amount: number) {
    return sendEmail({
        to: email,
        subject: `Payment confirmed for "${auctionTitle}"`,
        html: `
            <h2>Payment Confirmed</h2>
            <p>Your payment of <strong>$${amount.toFixed(2)}</strong> for "${auctionTitle}" has been received.</p>
            <p>The seller will be notified and will ship your item soon.</p>
        `,
    });
}

export async function testEmailConnection(testEmail: string): Promise<{ success: boolean; message: string }> {
    try {
        const config = await getResend();
        if (!config) {
            return { success: false, message: 'Resend API key not configured' };
        }

        const result = await config.resend.emails.send({
            from: config.fromEmail,
            to: testEmail,
            subject: 'BidStrike - Email Test',
            html: `<h1>Test Successful!</h1><p>Your email integration is working correctly.</p>`,
        });

        if (result.error) {
            return { success: false, message: result.error.message };
        }

        return { success: true, message: `Test email sent to ${testEmail}` };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export function resetResendInstance() {
    resendInstance = null;
}
