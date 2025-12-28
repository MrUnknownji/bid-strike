import Stripe from 'stripe';
import connectDB from '@/lib/db/database';
import Settings, { SETTING_KEYS } from '@/lib/db/Settings';

let stripeInstance: Stripe | null = null;

export async function getStripe(): Promise<Stripe | null> {
    await connectDB();
    const setting = await Settings.findOne({ key: SETTING_KEYS.STRIPE_SECRET_KEY });

    if (!setting?.value) {
        return null;
    }

    if (!stripeInstance) {
        stripeInstance = new Stripe(setting.value);
    }

    return stripeInstance;
}

export async function createCheckoutSession(params: {
    auctionId: string;
    auctionTitle: string;
    amount: number;
    buyerEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const stripe = await getStripe();
    if (!stripe) {
        throw new Error('Stripe not configured');
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: params.auctionTitle,
                        description: `Payment for won auction: ${params.auctionTitle}`,
                    },
                    unit_amount: Math.round(params.amount * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.buyerEmail,
        metadata: {
            auctionId: params.auctionId,
        },
    });

    return session;
}

export async function testStripeConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const stripe = await getStripe();
        if (!stripe) {
            return { success: false, message: 'Stripe API key not configured' };
        }

        const balance = await stripe.balance.retrieve();
        return {
            success: true,
            message: `Connected! Available balance: ${balance.available.map(b => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', ') || '0'}`,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export function resetStripeInstance() {
    stripeInstance = null;
}
