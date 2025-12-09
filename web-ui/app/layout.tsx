import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./design-tokens.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import ConditionalNavbar from "./ConditionalNavbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskJarvis - AI-Powered Task Manager",
  description: "Manage your tasks with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased text-base md:text-base`}
      >
        <AuthProvider>
          <WorkspaceProvider>
            <ConditionalNavbar />
            {children}
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
