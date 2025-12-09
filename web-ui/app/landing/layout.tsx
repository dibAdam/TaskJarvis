import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TaskJarvis - AI-Powered Productivity Revolution',
    description: 'Transform chaos into clarity with TaskJarvis. Intelligent task management that thinks ahead, adapts to you, and gets things done automatically.',
    keywords: 'task management, AI productivity, smart reminders, task automation, productivity app',
    openGraph: {
        title: 'TaskJarvis - Your AI Productivity Assistant',
        description: 'The smartest way to manage tasks and boost productivity',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TaskJarvis - AI-Powered Productivity',
        description: 'Intelligent task management that adapts to you',
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
