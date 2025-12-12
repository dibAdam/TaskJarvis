import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const { emailOrUsername, password } = await request.json();

        // Call FastAPI backend
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email_or_username: emailOrUsername,
                password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { message: error.detail || 'Login failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token } = data;

        // Get user info from FastAPI
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

        // Create secure session
        await createSession(user, access_token, refresh_token);

        return NextResponse.json(user);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Login failed' },
            { status: 500 }
        );
    }
}