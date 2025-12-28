import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from './auth';
import { API_MESSAGES, USER_ROLES } from '@/lib/utils/constants';

export function withAdminRole(
    request: NextRequest,
    handler: () => Promise<NextResponse>
): Promise<NextResponse> {
    const payload = getTokenFromRequest(request);

    if (!payload) {
        return Promise.resolve(
            NextResponse.json({ error: API_MESSAGES.UNAUTHORIZED }, { status: 401 })
        );
    }

    if (payload.role !== USER_ROLES.ADMIN) {
        return Promise.resolve(
            NextResponse.json({ error: API_MESSAGES.FORBIDDEN }, { status: 403 })
        );
    }

    return handler();
}
