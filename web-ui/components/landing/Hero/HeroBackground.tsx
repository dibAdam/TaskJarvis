'use client';

import React, { useEffect, useRef } from 'react';

export function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
            };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Configuration
        const particles: any[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)` // Blue/Purple hues
            });
        }

        const animate = () => {
            time += 0.005;
            ctx.fillStyle = 'rgba(15, 12, 41, 0.2)'; // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Gradient Mesh-like background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsla(${240 + Math.sin(time) * 30}, 70%, 20%, 0.5)`);
            gradient.addColorStop(0.5, `hsla(${280 + Math.cos(time) * 30}, 70%, 20%, 0.5)`);
            gradient.addColorStop(1, `hsla(${320 + Math.sin(time) * 30}, 70%, 20%, 0.5)`);

            ctx.globalCompositeOperation = 'lighter';

            // Draw Orbs
            for (let i = 0; i < 3; i++) {
                const x = canvas.width * 0.5 + Math.cos(time + i * 2) * 300;
                const y = canvas.height * 0.5 + Math.sin(time * 1.5 + i) * 200;
                const radius = 200 + Math.sin(time * 2) * 50;

                const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                orbGradient.addColorStop(0, `hsla(${240 + i * 60}, 80%, 60%, 0.1)`);
                orbGradient.addColorStop(1, 'transparent');

                ctx.fillStyle = orbGradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw Particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Mouse interaction
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    p.x -= dx * 0.02;
                    p.y -= dy * 0.02;
                }

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: '#0f0c29' }}
        />
    );
}
