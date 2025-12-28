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

export async function connectDB() {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI);
    }

    cached!.conn = await cached!.promise;
    return cached!.conn;
}

export default connectDB;
