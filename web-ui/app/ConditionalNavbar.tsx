"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Ensure component only renders after hydration to prevent mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide navbar on login and register pages
    const hideNavbar = pathname === '/login' || pathname === '/register' || pathname === '/landing';

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return <div className="h-16 md:h-20" />;
    }

    if (hideNavbar) {
        return null;
    }

    return (
        <>
            <Navbar />
            {/* Spacer for fixed navbar */}
            <div className="h-16 md:h-20" />
        </>
    );
}