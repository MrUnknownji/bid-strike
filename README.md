# BidStrike - Modern Auction Platform

BidStrike is a feature-rich, real-time online auction platform with premium aesthetics and robust functionality.

## 🚀 Key Features

- **Real-Time Bidding** - Live bid updates via WebSocket
- **Auto-Bidding** - Set max bid and let the system bid for you
- **Dynamic Auctions** - Create, edit, schedule auctions with image uploads
- **Admin Dashboard** - User/auction management, service configuration
- **Notifications** - In-app notification system
- **Reviews & Ratings** - User reputation system
- **Advanced Search** - Filter by price, condition, category

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes, MongoDB (Mongoose)
- **Real-Time:** Socket.io WebSocket server
- **Payments:** Stripe
- **Email:** Resend
- **Auth:** JWT with secure cookie handling

---

## 🏁 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (package manager)
- [MongoDB](https://www.mongodb.com) (local or Atlas)

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/bidstrike
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Seed Database

Populate categories and create admin user:

```bash
# Seed categories
bun scripts/seed-categories.ts

# Create admin user (admin@bidstrike.com / admin123)
bun scripts/seed-admin.ts
```

### 4. Run Development Servers

**Option A: Run both servers together**
```bash
bun dev:all
```

**Option B: Run separately (two terminals)**
```bash
# Terminal 1: Next.js app
bun dev

# Terminal 2: WebSocket server
bun dev:socket
```

### 5. Access the App

- **App:** http://localhost:3000
- **WebSocket:** http://localhost:3001
- **Admin:** Login as `admin@bidstrike.com` / `admin123`

---

## ⚙️ Service Configuration

Both payment and email services are configured through the **Admin Dashboard** (no code changes needed).

### Stripe Payment Setup

1. Login as admin
2. Go to **Admin → Settings → Stripe Payment**
3. Enter your Stripe keys:
   - Secret Key (`sk_live_...` or `sk_test_...`)
   - Publishable Key (`pk_live_...` or `pk_test_...`)
   - Webhook Secret (`whsec_...`)
4. Click **Test Connection** to verify

### Resend Email Setup

1. Go to **Admin → Settings → Resend Email**
2. Enter:
   - API Key (`re_...`)
   - From Email (must be verified domain: `noreply@yourdomain.com`)
3. Enter a test email address and click **Send Test Email**

---

## 📁 Project Structure

```
bid-strike/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   ├── auctions/           # Auction pages
│   └── ...
├── components/             # React components
├── hooks/                  # Custom hooks (useSocket, etc.)
├── lib/
│   ├── db/                 # Mongoose models
│   └── services/           # Business logic (payment, email)
├── server/
│   └── socket.ts           # WebSocket server
└── scripts/                # Seed scripts
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start Next.js dev server |
| `bun dev:socket` | Start WebSocket server |
| `bun dev:all` | Start both servers |
| `bun build` | Build for production |
| `bun start` | Run production build |
| `bun scripts/seed-categories.ts` | Seed auction categories |
| `bun scripts/seed-admin.ts` | Create admin user |

---

## 🔒 Default Admin Credentials

| Email | Password |
|-------|----------|
| `admin@bidstrike.com` | `admin123` |

> ⚠️ Change these credentials in production!
