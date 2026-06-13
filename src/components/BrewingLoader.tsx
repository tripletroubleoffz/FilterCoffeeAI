'use client';

import React from 'react';

interface BrewingLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrewingLoader({ message = 'Brewing intelligence...', size = 'md' }: BrewingLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer brewing progress circle */}
        <svg className="w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(44, 31, 27, 0.4)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#c28854"
            strokeWidth="3"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset="140"
            className="opacity-80"
          />
        </svg>

        {/* Coffee Dripper SVG inside the circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-1/2 h-1/2 text-coffee-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Filter dripper outline */}
            <path d="M5 3h14l-4 10H9L5 3z" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dripper plate */}
            <path d="M3 3h18" strokeLinecap="round" />
            <path d="M7 16h10" strokeLinecap="round" />
            {/* Coffee drop dripping */}
            <circle cx="12" cy="19" r="1.5" className="fill-coffee-accent stroke-none animate-[bounce_1s_infinite]" />
            {/* Steam lines */}
            <path d="M10 2c0 0-.5-1 0-1.5s.5-1 0-1.5" stroke="rgba(236, 220, 211, 0.6)" strokeLinecap="round" />
            <path d="M14 2c0 0-.5-1 0-1.5s.5-1 0-1.5" stroke="rgba(236, 220, 211, 0.6)" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-mono text-coffee-text-muted tracking-wider uppercase animate-pulse">{message}</span>
        </div>
      )}
    </div>
  );
}
