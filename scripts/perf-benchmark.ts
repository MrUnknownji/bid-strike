import { connectDB } from '../lib/db/database';
import Auction from '../lib/db/Auction';
import User from '../lib/db/User';
import { signAccessToken } from '../lib/utils/auth';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Replica of the logic in app/api/auctions/my/route.ts (Optimized)
async function runBenchmarkLogic(userId: string, limit: number = 200) {
    // const now = new Date();
    // // Inefficient updates removed
    // await Auction.updateMany(
    //     { seller: userId, status: 'scheduled', startTime: { $lte: now }, endTime: { $gt: now } },
    //     { status: 'active' }
    // );
    // await Auction.updateMany(
    //     { seller: userId, status: 'active', endTime: { $lte: now } },
    //     { status: 'ended' }
    // );

    const query: Record<string, unknown> = { seller: userId };

    const auctions = await Auction.find(query)
        .populate('category', 'name slug')
        .sort('-createdAt')
        .limit(limit);

    return auctions;
}

async function main() {
    console.log('Starting MongoMemoryServer...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    console.log('Connecting to DB at ' + uri);
    // await connectDB(); // connectDB uses env var or default. We bypass it to use our URI.
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    console.log('Creating test user...');
    const user = await User.create({
        username: 'perf_test_user_' + Date.now(),
        email: `perf_${Date.now()}@example.com`,
        password: 'password123',
    });

    // const token = signAccessToken({ userId: user._id.toString(), email: user.email, role: 'user' });

    console.log('Seeding auctions...');
    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    const future = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now

    const auctions = [];

    // 50 auctions that need update: scheduled -> active (startTime <= now)
    for (let i = 0; i < 50; i++) {
        auctions.push({
            title: `Perf Test Auction Scheduled ${i}`,
            description: 'Test description',
            seller: user._id,
            startingPrice: 10,
            startTime: past, // Should be active
            endTime: future,
            status: 'scheduled', // Needs update
            images: [],
            tags: [],
        });
    }

    // 50 auctions that need update: active -> ended (endTime <= now)
    for (let i = 0; i < 50; i++) {
        auctions.push({
            title: `Perf Test Auction Active ${i}`,
            description: 'Test description',
            seller: user._id,
            startingPrice: 10,
            startTime: new Date(past.getTime() - 1000 * 60 * 60),
            endTime: past, // Should be ended
            status: 'active', // Needs update
            images: [],
            tags: [],
        });
    }

    // 50 auctions that don't need update
    for (let i = 0; i < 50; i++) {
         auctions.push({
            title: `Perf Test Auction Normal ${i}`,
            description: 'Test description',
            seller: user._id,
            startingPrice: 10,
            startTime: past,
            endTime: future,
            status: 'active', // Correct status
            images: [],
            tags: [],
        });
    }

    await Auction.insertMany(auctions);
    console.log(`Seeded ${auctions.length} auctions.`);

    console.log('Running benchmark...');

    const start = performance.now();
    await runBenchmarkLogic(user._id.toString());
    const end = performance.now();

    const duration = end - start;
    console.log(`Logic execution took ${duration.toFixed(2)}ms`);

    console.log('Cleaning up...');
    await Auction.deleteMany({ seller: user._id });
    await User.findByIdAndDelete(user._id);

    await mongoose.disconnect();
    await mongod.stop();

    console.log('Done.');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
