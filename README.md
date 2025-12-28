# BidStrike - Modern Auction Platform

BidStrike is a feature-rich, real-time online auction platform built for seamless buying and selling. It combines a premium "Avant-Garde" aesthetic with robust functionality, ensuring a smooth experience for both casual users and power sellers.

## 🚀 Key Features

*   **Real-Time Bidding:** Experience instant bid updates without refreshing the page.
*   **Dynamic Auctions:**
    *   **Create & Edit:** Easily list items with detailed descriptions, multiple images, and precise scheduling.
    *   **Image Management:** Drag-and-drop uploads, thumbnail selection, and easy reordering.
    *   **Rich Categories:** Browse a comprehensive hierarchy of real-world categories (Electronics, Fashion, Art, etc.).
*   **Smart Dashboard:**
    *   **Overview:** Track your winning bids, active listings, and watchlist at a glance.
    *   **My Auctions:** Manage your listings with status filters (Ongoing, Upcoming, Ended) and delete controls.
*   **User Engagement:**
    *   **Watchlist:** Save items you're interested in.
    *   **Feedback System:** Suggest new categories or contact support directly through the app.
*   **Secure & Reliable:**
    *   **Auth Sync:** Seamless login state synchronization across tabs.
    *   **Auto-Logout:** Session validation ensures security if your token expires.

## 🛠️ Tech Stack

*   **Frontend:** Next.js 14, React, Tailwind CSS
*   **UI Library:** Shadcn UI + Radix Primitives
*   **Backend:** Node.js (API Routes), MongoDB (Mongoose)
*   **Authentication:** JWT with secure cookie handling

## 🏁 Getting Started

1.  **Install Dependencies:**
    ```bash
    bun install
    ```

2.  **Seed Database:**
    Populate the real-world categories.
    ```bash
    bun scripts/seed-categories.ts
    ```

3.  **Run Development Server:**
    ```bash
    bun dev
    ```

Visit `http://localhost:3000` to start bidding!
