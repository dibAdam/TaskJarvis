'use client';

import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export function LandingFooter() {
    const footerLinks = {
        Product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Testimonials', href: '#testimonials' },
            { label: 'Roadmap', href: '#' },
        ],
        Company: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        Legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'Security', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Mail, href: '#', label: 'Email' },
    ];

    return (
        <footer className="relative bg-[#0a0a0f] border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                            TaskJarvis
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Your AI-powered productivity revolution. Transform chaos into clarity.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-slate-400" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-white font-semibold mb-4">{category}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} TaskJarvis. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <Link href="#" className="hover:text-white transition-colors duration-200">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors duration-200">
                            Terms
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors duration-200">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
