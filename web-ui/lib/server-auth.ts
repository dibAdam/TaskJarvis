import { cookies, headers } from 'next/headers';
import { decrypt, SessionPayload } from './session';

/**
 * Server-side helper to get current session
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getServerSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return null;
    }

    return await decrypt(sessionCookie);
}

/**
 * Server-side helper to check if user is authenticated
 * Use this in Server Components for conditional rendering
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getServerSession();
    return !!session;
}

/**
 * Server-side helper to get current user info
 * Throws error if not authenticated (use for protected pages)
 */
export async function requireAuth(): Promise<SessionPayload> {
    const session = await getServerSession();

    if (!session) {
        throw new Error('Unauthorized - No active session');
    }

    return session;
}

/**
 * Get user info from middleware headers (faster than decrypting session)
 * Only works in Server Components that are called after middleware
 */
export async function getUserFromHeaders(): Promise<{
    userId: number | null;
    email: string | null;
    isAuthenticated: boolean;
}> {
    const headersList = await headers();
    const isAuth = headersList.get('x-user-authenticated') === 'true';
    const userId = headersList.get('x-user-id');
    const email = headersList.get('x-user-email');

    return {
        userId: userId ? parseInt(userId) : null,
        email: email || null,
        isAuthenticated: isAuth,
    };
}
