import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./design-tokens.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import ConditionalNavbar from "./ConditionalNavbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://taskjarvis.app'),
  title: {
    default: "TaskJarvis - AI-Powered Task Manager",
    template: "%s | TaskJarvis"
  },
  description: "Manage your tasks efficiently with AI assistance. TaskJarvis helps you organize, prioritize, and complete your tasks with intelligent automation.",
  keywords: ["task manager", "AI assistant", "productivity", "task organization", "project management", "collaboration"],
  authors: [{ name: "TaskJarvis Team" }],
  creator: "TaskJarvis",
  publisher: "TaskJarvis",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taskjarvis.app',
    siteName: 'TaskJarvis',
    title: 'TaskJarvis - AI-Powered Task Manager',
    description: 'Manage your tasks efficiently with AI assistance. Organize, prioritize, and complete tasks with intelligent automation.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TaskJarvis - AI-Powered Task Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskJarvis - AI-Powered Task Manager',
    description: 'Manage your tasks efficiently with AI assistance',
    images: ['/twitter-image.png'],
    creator: '@taskjarvis',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://taskjarvis.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TaskJarvis",
              "description": "AI-Powered Task Manager for efficient task organization and productivity",
              "url": "https://taskjarvis.app",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI-powered task management",
                "Smart task prioritization",
                "Team collaboration",
                "Workspace organization",
                "Task analytics"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased text-base md:text-base`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <WorkspaceProvider>
            <ConditionalNavbar />
            <main id="main-content">
              {children}
            </main>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
