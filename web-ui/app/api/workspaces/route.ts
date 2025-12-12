import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_URL}/workspaces/`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await fetch(`${API_URL}/workspaces/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to create workspace' },
            { status: 500 }
        );
    }
}