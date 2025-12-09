"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Hide navbar on login and register pages
    const hideNavbar = pathname === '/login' || pathname === '/register';

    if (hideNavbar) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="pt-20" />
        </>
    );
}