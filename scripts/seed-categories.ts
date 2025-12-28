import mongoose from 'mongoose';
import Category from '../lib/db/Category';
import connectDB from '../lib/db/database';

const CATEGORIES = [
    {
        name: 'Electronics',
        slug: 'electronics',
        subs: [
            { name: 'Smartphones', slug: 'smartphones' },
            { name: 'Laptops', slug: 'laptops' },
            { name: 'Cameras', slug: 'cameras' },
            { name: 'Audio', slug: 'audio' },
            { name: 'Gaming Consoles', slug: 'gaming-consoles' },
        ],
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        subs: [
            { name: 'Men\'s Clothing', slug: 'mens-clothing' },
            { name: 'Women\'s Clothing', slug: 'womens-clothing' },
            { name: 'Watches', slug: 'watches' },
            { name: 'Jewelry', slug: 'jewelry' },
            { name: 'Shoes', slug: 'shoes' },
        ],
    },
    {
        name: 'Home & Garden',
        slug: 'home-garden',
        subs: [
            { name: 'Furniture', slug: 'furniture' },
            { name: 'Kitchenware', slug: 'kitchenware' },
            { name: 'Tools', slug: 'tools' },
            { name: 'Decor', slug: 'decor' },
        ],
    },
    {
        name: 'Collectibles',
        slug: 'collectibles',
        subs: [
            { name: 'Coins', slug: 'coins' },
            { name: 'Stamps', slug: 'stamps' },
            { name: 'Trading Cards', slug: 'trading-cards' },
            { name: 'Vintage', slug: 'vintage' },
        ],
    },
    {
        name: 'Vehicles',
        slug: 'vehicles',
        subs: [
            { name: 'Cars', slug: 'cars' },
            { name: 'Motorcycles', slug: 'motorcycles' },
            { name: 'Parts & Accessories', slug: 'parts-accessories' },
        ],
    },
    {
        name: 'Art',
        slug: 'art',
        subs: [
            { name: 'Paintings', slug: 'paintings' },
            { name: 'Sculptures', slug: 'sculptures' },
            { name: 'Prints', slug: 'prints' },
        ],
    },
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        for (const cat of CATEGORIES) {
            const parent = await Category.create({
                name: cat.name,
                slug: cat.slug,
                isActive: true,
            });

            console.log(`Created parent: ${cat.name}`);

            if (cat.subs.length > 0) {
                const subDocs = cat.subs.map(sub => ({
                    name: sub.name,
                    slug: sub.slug,
                    parent: parent._id,
                    isActive: true,
                }));
                await Category.insertMany(subDocs);
                console.log(`  > Added ${cat.subs.length} subcategories`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
}

seed();
