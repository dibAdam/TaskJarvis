import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    const { id, userId } = await params;
    const session = await getSession();
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(
            `${API_URL}/workspaces/${id}/members/${userId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (response.ok) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { message: 'Failed to remove member' },
            { status: response.status }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to remove member' },
            { status: 500 }
        );
    }
}