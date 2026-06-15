'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  text: string;
  isText: boolean;
  wiggleSpeed: number;
  wigglePhase: number;
}

export default function CoffeeCup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isHovered = false;

    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const createParticle = (): Particle => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Cup center
      const cx = canvasWidth / 2;
      const cy = canvasHeight * 0.72; // Just above the cup brim

      // Steam starts narrow from the coffee surface
      const x = cx + (Math.random() - 0.5) * 40;
      const y = cy;

      // Base rising speed, faster if hovered
      const vy = -(Math.random() * 0.8 + 0.6) * (isHovered ? 1.8 : 1.0);
      const vx = (Math.random() - 0.5) * 0.4;

      const isText = Math.random() > 0.4; // 60% chance to turn into code symbols higher up
      const dataSymbols = ['0', '1', 'AI', 'data', 'feed', 'signal', '☕', '{ }', 'INR', 'USD'];
      const text = dataSymbols[Math.floor(Math.random() * dataSymbols.length)];

      return {
        x,
        y,
        vx,
        vy,
        size: Math.random() * 2 + 1.5,
        alpha: 0.8,
        decay: Math.random() * 0.003 + 0.002,
        text,
        isText,
        wiggleSpeed: Math.random() * 0.02 + 0.01,
        wigglePhase: Math.random() * Math.PI * 2,
      };
    };

    // Initialize some particles
    for (let i = 0; i < 40; i++) {
      const p = createParticle();
      p.y = canvas.height * 0.72 - Math.random() * 200; // distribute vertically
      p.alpha = Math.max(0, 1 - (canvas.height * 0.72 - p.y) / 200);
      particles.push(p);
    }

    const drawCup = (cWidth: number, cHeight: number) => {
      const cx = cWidth / 2;
      const cy = cHeight * 0.75;
      
      // Coffee cup base radius
      const cupWidth = 90;
      const cupHeight = 85;

      ctx.save();
      
      // Shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + cupHeight + 5, 65, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // Saucer
      ctx.beginPath();
      ctx.ellipse(cx, cy + cupHeight, 75, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#18110e';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2c1f1b';
      ctx.fill();
      ctx.stroke();

      // Saucer inner ring
      ctx.beginPath();
      ctx.ellipse(cx, cy + cupHeight, 45, 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(194, 136, 84, 0.15)';
      ctx.stroke();

      // Cup handle
      ctx.beginPath();
      ctx.arc(cx + cupWidth / 2 + 10, cy + cupHeight / 2 - 5, 20, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = '#2c1f1b';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = '#c28854';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cup Body (Gradient Coffee Espresso / Ceramic styling)
      const cupGrad = ctx.createLinearGradient(cx - cupWidth/2, cy, cx + cupWidth/2, cy);
      cupGrad.addColorStop(0, '#1c1310');
      cupGrad.addColorStop(0.3, '#2c1f1b');
      cupGrad.addColorStop(0.7, '#2c1f1b');
      cupGrad.addColorStop(1, '#18110e');

      ctx.beginPath();
      ctx.moveTo(cx - cupWidth/2, cy);
      ctx.bezierCurveTo(cx - cupWidth/2, cy + cupHeight * 0.7, cx - cupWidth/3, cy + cupHeight, cx, cy + cupHeight);
      ctx.bezierCurveTo(cx + cupWidth/3, cy + cupHeight, cx + cupWidth/2, cy + cupHeight * 0.7, cx + cupWidth/2, cy);
      ctx.closePath();
      ctx.fillStyle = cupGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3d2b26';
      ctx.stroke();

      // Cup Brim highlight
      ctx.beginPath();
      ctx.ellipse(cx, cy, cupWidth / 2, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#2c1f1b';
      ctx.fill();
      ctx.strokeStyle = '#c28854';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Coffee inside
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, cupWidth / 2 - 4, 6, 0, 0, Math.PI * 2);
      const coffeeGrad = ctx.createRadialGradient(cx, cy + 2, 5, cx, cy + 2, cupWidth/2);
      coffeeGrad.addColorStop(0, '#8b5a2b'); // rich coffee brown center
      coffeeGrad.addColorStop(0.8, '#4a301a');
      coffeeGrad.addColorStop(1, '#1c1310');
      ctx.fillStyle = coffeeGrad;
      ctx.fill();

      // Crema details (small golden circles)
      ctx.beginPath();
      ctx.arc(cx - 15, cy + 3, 2, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy + 1, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy + 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 220, 211, 0.4)';
      ctx.fill();

      // Minimalistic Filter Dripper structure above the cup (Stripe vibe)
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 15);
      ctx.lineTo(cx + 60, cy - 15);
      ctx.strokeStyle = 'rgba(194, 136, 84, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Cup
      drawCup(canvas.width, canvas.height);

      // 2. Spawn steam particles
      if (particles.length < 90 && Math.random() < 0.25) {
        particles.push(createParticle());
      }

      // 3. Update & Draw Particles
      particles.forEach((p, index) => {
        p.y += p.vy;
        p.wigglePhase += p.wiggleSpeed;
        p.x += p.vx + Math.sin(p.wigglePhase) * 0.35;
        p.alpha -= p.decay;

        // Transition from cloud-like steam to code data higher up
        const heightFromBrim = (canvas.height * 0.72) - p.y;
        
        ctx.save();
        if (heightFromBrim > 80 && p.isText) {
          // Morph into matrix-like code data streams
          ctx.font = `500 ${Math.max(9, p.size * 3.5)}px 'Outfit', sans-serif`;
          ctx.fillStyle = `rgba(194, 136, 84, ${p.alpha})`; // gold cream
          ctx.fillText(p.text, p.x, p.y);
        } else {
          // Classical glowing steam puff
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          grad.addColorStop(0, `rgba(236, 220, 211, ${p.alpha * 0.45})`);
          grad.addColorStop(0.5, `rgba(194, 136, 84, ${p.alpha * 0.15})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Remove dead particles
        if (p.alpha <= 0 || p.y < 50) {
          particles[index] = createParticle();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] md:h-[450px] flex items-center justify-center cursor-pointer select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
