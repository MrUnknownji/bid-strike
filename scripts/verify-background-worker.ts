import { updateAuctionStatuses } from '../lib/services/auction-updater';
import Auction from '../lib/db/Auction';
import User from '../lib/db/User';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

async function main() {
    console.log('Starting MongoMemoryServer...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    console.log('Connecting to DB at ' + uri);
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    console.log('Creating test user...');
    const user = await User.create({
        username: 'verify_test_user',
        email: 'verify@example.com',
        password: 'password123',
    });

    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60);
    const future = new Date(now.getTime() + 1000 * 60 * 60);

    console.log('Seeding auctions...');
    const scheduledAuction = await Auction.create({
        title: 'Scheduled Auction',
        description: 'Should become active',
        seller: user._id,
        startingPrice: 10,
        startTime: past,
        endTime: future,
        status: 'scheduled',
        images: [],
    });

    const activeAuction = await Auction.create({
        title: 'Active Auction',
        description: 'Should become ended',
        seller: user._id,
        startingPrice: 10,
        startTime: new Date(past.getTime() - 1000 * 60 * 60),
        endTime: past,
        status: 'active',
        images: [],
    });

    console.log('Running update logic...');
    const result = await updateAuctionStatuses();
    console.log('Update result:', result);

    console.log('Verifying statuses...');
    const updatedScheduled = await Auction.findById(scheduledAuction._id);
    const updatedActive = await Auction.findById(activeAuction._id);

    let success = true;

    if (updatedScheduled?.status !== 'active') {
        console.error(`FAILED: Scheduled auction status is ${updatedScheduled?.status}, expected 'active'`);
        success = false;
    } else {
        console.log('PASSED: Scheduled auction updated to active');
    }

    if (updatedActive?.status !== 'ended') {
        console.error(`FAILED: Active auction status is ${updatedActive?.status}, expected 'ended'`);
        success = false;
    } else {
        console.log('PASSED: Active auction updated to ended');
    }

    console.log('Cleaning up...');
    await mongoose.disconnect();
    await mongod.stop();

    if (!success) {
        process.exit(1);
    }
    console.log('Verification successful.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
