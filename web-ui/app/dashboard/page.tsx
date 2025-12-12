import { getServerSession, getUserFromHeaders } from '@/lib/server-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    // Get session from server - this runs on the server, not the client!
    const session = await getServerSession();

    // If no session, redirect to login (though middleware should catch this)
    if (!session) {
        redirect('/login');
    }

    // You can also get user from headers (faster, set by middleware)
    const userFromHeaders = await getUserFromHeaders();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                {/* User info from session */}
                <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4">Session Information</h2>
                    <div className="space-y-2">
                        <p><span className="text-slate-400">User ID:</span> {session.userId}</p>
                        <p><span className="text-slate-400">Username:</span> {session.username}</p>
                        <p><span className="text-slate-400">Email:</span> {session.email}</p>
                        <p><span className="text-slate-400">Session Expires:</span> {new Date(session.expiresAt).toLocaleString()}</p>
                    </div>
                </div>

                {/* User info from headers (faster) */}
                <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4">From Middleware Headers</h2>
                    <div className="space-y-2">
                        <p><span className="text-slate-400">User ID:</span> {userFromHeaders.userId}</p>
                        <p><span className="text-slate-400">Email:</span> {userFromHeaders.email}</p>
                        <p><span className="text-slate-400">Authenticated:</span> {userFromHeaders.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                    <Link
                        href="/tasks"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        View Tasks
                    </Link>
                    <Link
                        href="/workspaces"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                        View Workspaces
                    </Link>
                    <Link
                        href="/profile"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        Profile
                    </Link>
                </div>

                {/* Info box */}
                <div className="mt-8 bg-blue-950/50 border border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-blue-400">🔒 Server-Side Authentication</h3>
                    <p className="text-slate-300 text-sm">
                        This page is a <strong>Server Component</strong>. The session is checked on the server before rendering.
                        No client-side JavaScript is needed for authentication! The middleware protects this route automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
