import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/utils/auth';
import { API_MESSAGES } from '@/lib/utils/constants';

export interface AuthRequest extends NextRequest {
    user?: TokenPayload;
}

export async function withAuth(
    request: NextRequest,
    handler: (req: AuthRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: API_MESSAGES.UNAUTHORIZED },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
        return NextResponse.json(
            { error: API_MESSAGES.UNAUTHORIZED },
            { status: 401 }
        );
    }

    const authRequest = request as AuthRequest;
    authRequest.user = payload;

    return handler(authRequest);
}

export function getTokenFromRequest(request: NextRequest): TokenPayload | null {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}
