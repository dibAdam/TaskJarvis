import { NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST() {
    const session = await getSession();

    if (!session?.refreshToken) {
        return NextResponse.json(
            { message: 'No refresh token' },
            { status: 401 }
        );
    }

    try {
        const response = await fetch(`${API_URL}/auth/refresh?refresh_token=${session.refreshToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Token refresh failed' },
                { status: 401 }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token } = data;

        // Update session with new tokens
        await createSession(
            {
                id: session.userId,
                email: session.email,
                username: session.username,
            },
            access_token,
            refresh_token
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { message: 'Token refresh failed' },
            { status: 500 }
        );
    }
}