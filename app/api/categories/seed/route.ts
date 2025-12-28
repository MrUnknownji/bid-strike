import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Category from '@/lib/db/Category';

const CATEGORIES = [
    {
        name: 'Electronics',
        slug: 'electronics',
        order: 1,
        subcategories: [
            { name: 'Smartphones', slug: 'smartphones' },
            { name: 'Laptops', slug: 'laptops' },
            { name: 'Cameras', slug: 'cameras' },
            { name: 'Audio', slug: 'audio' },
            { name: 'Gaming', slug: 'gaming' },
            { name: 'Tablets', slug: 'tablets' },
        ],
    },
    {
        name: 'Automobiles',
        slug: 'automobiles',
        order: 2,
        subcategories: [
            { name: 'Cars', slug: 'cars' },
            { name: 'Motorcycles', slug: 'motorcycles' },
            { name: 'Trucks', slug: 'trucks' },
            { name: 'Parts', slug: 'auto-parts' },
            { name: 'Accessories', slug: 'auto-accessories' },
        ],
    },
    {
        name: 'Art & Collectibles',
        slug: 'art-collectibles',
        order: 3,
        subcategories: [
            { name: 'Paintings', slug: 'paintings' },
            { name: 'Sculptures', slug: 'sculptures' },
            { name: 'Antiques', slug: 'antiques' },
            { name: 'Coins', slug: 'coins' },
            { name: 'Stamps', slug: 'stamps' },
            { name: 'Trading Cards', slug: 'trading-cards' },
        ],
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        order: 4,
        subcategories: [
            { name: 'Clothing', slug: 'clothing' },
            { name: 'Shoes', slug: 'shoes' },
            { name: 'Watches', slug: 'watches' },
            { name: 'Jewelry', slug: 'jewelry' },
            { name: 'Bags', slug: 'bags' },
        ],
    },
    {
        name: 'Home & Garden',
        slug: 'home-garden',
        order: 5,
        subcategories: [
            { name: 'Furniture', slug: 'furniture' },
            { name: 'Appliances', slug: 'appliances' },
            { name: 'Decor', slug: 'decor' },
            { name: 'Tools', slug: 'tools' },
            { name: 'Outdoor', slug: 'outdoor' },
        ],
    },
    {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        order: 6,
        subcategories: [
            { name: 'Fitness', slug: 'fitness' },
            { name: 'Cycling', slug: 'cycling' },
            { name: 'Camping', slug: 'camping' },
            { name: 'Sports Equipment', slug: 'sports-equipment' },
        ],
    },
    {
        name: 'Other',
        slug: 'other',
        order: 99,
        subcategories: [
            { name: 'Miscellaneous', slug: 'miscellaneous' },
        ],
    },
];

export async function POST() {
    try {
        await connectDB();

        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json({
                message: 'Categories already seeded',
                count: existingCount
            });
        }

        for (const cat of CATEGORIES) {
            const parent = await Category.create({
                name: cat.name,
                slug: cat.slug,
                order: cat.order,
                isActive: true,
            });

            for (const sub of cat.subcategories) {
                await Category.create({
                    name: sub.name,
                    slug: sub.slug,
                    parent: parent._id,
                    isActive: true,
                });
            }
        }

        const total = await Category.countDocuments();
        return NextResponse.json({
            message: 'Categories seeded successfully',
            count: total
        });
    } catch (error) {
        console.error('Seed categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
