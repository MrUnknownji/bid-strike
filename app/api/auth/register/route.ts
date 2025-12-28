import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { username, email, password, firstName, lastName } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email and password are required' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
        });

        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = signAccessToken(tokenPayload);
        const refreshToken = signRefreshToken(tokenPayload);

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
