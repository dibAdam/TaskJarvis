import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const { email, username, password } = await request.json();

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { message: error.detail || 'Registration failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token } = data;

        const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!userResponse.ok) {
            return NextResponse.json(
                { message: 'Failed to fetch user info' },
                { status: 500 }
            );
        }

        const user = await userResponse.json();
        await createSession(user, access_token, refresh_token);

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { message: 'Registration failed' },
            { status: 500 }
        );
    }
}