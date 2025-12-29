# BidStrike Deployment Guide

This guide covers deploying BidStrike using MongoDB Atlas, Cloudinary, Render, Stripe, Resend, and Vercel.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   MongoDB       │
│   (Next.js)     │     │   Atlas         │
└────────┬────────┘     └─────────────────┘
         │
         │ WebSocket
         ▼
┌─────────────────┐
│   Render        │
│   (Socket.io)   │
└─────────────────┘
```

## Prerequisites

- GitHub repository with BidStrike code
- Accounts on: MongoDB Atlas, Cloudinary, Render, Stripe, Resend, Vercel

---

## Step 1: MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a **free M0 cluster**
3. **Database Access** → Add new user with password
4. **Network Access** → Add IP `0.0.0.0/0` (allows all IPs for serverless)
5. **Connect** → Get connection string

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bidstrike
```

---

## Step 2: Cloudinary

1. Login to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Note your **Cloud Name**, **API Key**, **API Secret**
3. Create upload preset `bid-strike-images`
4. Set environment variables:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=bid-strike-images
```

---

## Step 3: Render (Socket.io Server)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `bid-strike-socket`
   - **Runtime**: Node
   - **Build Command**: `bun install`
   - **Start Command**: `bun run server/socket.ts`
5. Add environment variables:
   - `CLIENT_URL` = `https://your-app.vercel.app`
   - `SOCKET_PORT` = `3001`
6. Deploy and note the URL (e.g., `https://bid-strike-socket.onrender.com`)

---

## Step 4: Vercel (Next.js App)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New** → **Project**
3. Import your GitHub repository
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Strong 32+ char secret |
| `NEXT_PUBLIC_SOCKET_URL` | Your Render URL |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |
| `CLOUDINARY_UPLOAD_PRESET` | `bid-strike-images` |

5. Deploy

---

## Step 5: Stripe (Payments)

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. In your deployed app, login as admin
3. Go to **Admin → Settings → Stripe Payment**
4. Enter:
   - Secret Key (`sk_live_...` or `sk_test_...`)
   - Publishable Key (`pk_live_...` or `pk_test_...`)
5. Click **Test Connection**

### Webhook Setup

1. Stripe Dashboard → **Webhooks** → **Add endpoint**
2. URL: `https://your-app.vercel.app/api/payments/webhook`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret → Add to Admin Settings

---

## Step 6: Resend (Email)

1. Get API key from [Resend Dashboard](https://resend.com/api-keys)
2. Verify your domain in Resend
3. In your deployed app:
4. Go to **Admin → Settings → Email**
5. Enter:
   - API Key (`re_...`)
   - From Email (`noreply@yourdomain.com`)
6. Click **Send Test Email**

---

## Post-Deployment

### Seed Database

```bash
# Set MONGODB_URI then run:
MONGODB_URI="your-connection-string" bun scripts/seed-categories.ts
MONGODB_URI="your-connection-string" bun scripts/seed-admin.ts
```

### Update Render CORS

After Vercel deploys, update Render's `CLIENT_URL` to your actual Vercel URL.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check IP whitelist includes `0.0.0.0/0` |
| WebSocket not connecting | Verify `NEXT_PUBLIC_SOCKET_URL` matches Render URL |
| Images not loading | Check Cloudinary credentials and upload preset |
| Emails not sending | Verify domain in Resend, check "From" email |

---

## Swapping Services

This setup is modular. To use different services:

1. Copy `.env.example` to `.env.local`
2. Replace credentials with your service's values
3. The code uses environment variables by default
4. Alternatively, configure via Admin Panel (stored in MongoDB)
