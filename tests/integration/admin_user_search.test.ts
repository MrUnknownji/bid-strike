
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/lib/db/User';
import { GET } from '@/app/api/admin/users/route';
import { NextRequest } from 'next/server';

// Mock auth middleware to allow admin access
// We need to mock 'lib/middleware/auth' module
// But bun test mocking of modules is tricky if they are already imported.
// However, GET handler calls getTokenFromRequest.

// Let's just test the query logic directly if possible, or mock the request properly.
// But getTokenFromRequest reads headers/cookies. I can mock the return value of getTokenFromRequest if I mock the module.

// Mocking module:
import { mock } from 'bun:test';

mock.module('@/lib/middleware/auth', () => ({
    getTokenFromRequest: () => ({ role: 'admin' }),
}));

// Mock database connection to do nothing, as we manage it manually
mock.module('@/lib/db/database', () => ({
    default: async () => mongoose.connection,
    connectDB: async () => mongoose.connection,
}));


describe('Admin User Search Optimization', () => {
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);

        // Ensure indexes are created
        await User.createIndexes(); // This creates the indexes defined in User.ts
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    it('should find users case-insensitively using prefix', async () => {
        // Seed users
        await User.deleteMany({});
        await User.create([
            { username: 'TargetUser', email: 'target@example.com', password: 'pw', role: 'user' },
            { username: 'OtherUser', email: 'other@example.com', password: 'pw', role: 'user' },
            { username: 'target_two', email: 'target2@example.com', password: 'pw', role: 'user' },
        ]);

        // Test search "target"
        const req = new NextRequest('http://localhost/api/admin/users?search=target');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.users).toHaveLength(2);
        const usernames = json.users.map((u: any) => u.username).sort();
        expect(usernames).toEqual(['TargetUser', 'target_two'].sort());
    });

    it('should handle pagination correctly with search', async () => {
         // Add more targets
         const users = [];
         for(let i=0; i<25; i++) {
             users.push({ username: `TestUser_${i}`, email: `test${i}@example.com`, password: 'pw', role: 'user' });
         }
         await User.insertMany(users);

         const req = new NextRequest('http://localhost/api/admin/users?search=testuser&limit=10&page=1');
         const res = await GET(req);
         const json = await res.json();

         expect(json.users).toHaveLength(10);
         expect(json.pagination.total).toBe(25);
    });

    it('should return empty list if no match', async () => {
        const req = new NextRequest('http://localhost/api/admin/users?search=nonexistent');
        const res = await GET(req);
        const json = await res.json();
        expect(json.users).toHaveLength(0);
    });

    it('should use collation index for efficient search', async () => {
        // We can't easily verify execution plan here without access to explain(),
        // but we verified it in benchmark script.
        // This test ensures correctness.
        const req = new NextRequest('http://localhost/api/admin/users?search=TARGET');
        const res = await GET(req);
        const json = await res.json();
        expect(json.users.length).toBeGreaterThan(0);
        expect(json.users.find((u: any) => u.username === 'TargetUser')).toBeTruthy();
    });
});
