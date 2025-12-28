import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    key: string;
    value: string;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
}, { timestamps: true });

SettingsSchema.index({ key: 1 });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;

export const SETTING_KEYS = {
    STRIPE_SECRET_KEY: 'stripe_secret_key',
    STRIPE_PUBLISHABLE_KEY: 'stripe_publishable_key',
    STRIPE_WEBHOOK_SECRET: 'stripe_webhook_secret',
    RESEND_API_KEY: 'resend_api_key',
    EMAIL_FROM: 'email_from',
} as const;
