'use client';

import React from 'react';
import { FeaturesSection } from '@/components/landing/Features/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/Testimonials/TestimonialsSection';
import { PricingSection } from '@/components/landing/Pricing/PricingSection';
import { LandingNav } from '@/components/landing/Navigation/LandingNav';
import { LandingFooter } from '@/components/landing/Footer/LandingFooter';
import { Hero } from '@/components/landing/Hero/Hero';
import { StorySection } from '@/components/landing/StorySection';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Navigation */}
            <LandingNav />

            {/* Hero Section */}
            <Hero />

            {/* Story Section */}
            <StorySection />

            {/* Features Section */}
            <FeaturesSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Pricing Section */}
            <PricingSection />

            {/* Final CTA */}
            <FinalCTA />

            {/* Footer */}
            <LandingFooter />
        </div>
    );
}
