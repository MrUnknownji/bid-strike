import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bidstrike';

interface GlobalMongoose {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectionOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
};

async function registerModels() {
    await import('@/lib/db/User');
    await import('@/lib/db/Auction');
    await import('@/lib/db/Category');
    await import('@/lib/db/Bid');
    await import('@/lib/db/Settings');
    await import('@/lib/db/Feedback');
    await import('@/lib/db/Notification');
    await import('@/lib/db/Review');
    await import('@/lib/db/Transaction');
}

export async function connectDB() {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI, connectionOptions).catch((err) => {
            cached!.promise = null;
            throw err;
        });
    }

    try {
        cached!.conn = await cached!.promise;
        await registerModels();
        return cached!.conn;
    } catch (error) {
        cached!.promise = null;
        throw error;
    }
}

export default connectDB;
