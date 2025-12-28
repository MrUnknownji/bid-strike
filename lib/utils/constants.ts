export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

export const AUCTION_STATUS = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    ACTIVE: 'active',
    ENDED: 'ended',
    CANCELLED: 'cancelled',
    SOLD: 'sold',
} as const;

export const AUCTION_CONDITION = {
    NEW: 'new',
    LIKE_NEW: 'like-new',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

export const DELIVERY_STATUS = {
    PENDING: 'pending',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
} as const;

export const NOTIFICATION_TYPES = {
    BID_PLACED: 'bid_placed',
    OUTBID: 'outbid',
    AUCTION_WON: 'auction_won',
    AUCTION_LOST: 'auction_lost',
    AUCTION_ENDING: 'auction_ending',
    PAYMENT_RECEIVED: 'payment_received',
    NEW_MESSAGE: 'new_message',
} as const;

export const API_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    SERVER_ERROR: 'Internal server error',
};
