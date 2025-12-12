/**
 * Reusable section effects components for consistent visual styling across pages
 * Uses theme colors from CSS variables
 */

import { useEffect, useRef } from 'react';

// Section divider with glow gradient
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`section-divider ${className}`} 
      aria-hidden="true" 
    />
  );
}

// Strategic glow positioned on the left side
export function GlowLeft({ pulse = true }: { pulse?: boolean }) {
  return (
    <div 
      className={`glow-left ${pulse ? 'glow-pulse' : ''}`} 
      aria-hidden="true" 
    />
  );
}

// Strategic glow positioned on the right side
export function GlowRight({ pulse = true }: { pulse?: boolean }) {
  return (
    <div 
      className={`glow-right ${pulse ? 'glow-pulse' : ''}`} 
      aria-hidden="true" 
    />
  );
}

// Top right corner glow
export function GlowTopRight({ pulse = true }: { pulse?: boolean }) {
  return (
    <div 
      className={`glow-top-right ${pulse ? 'glow-pulse' : ''}`} 
      aria-hidden="true" 
    />
  );
}

// Bottom left corner glow
export function GlowBottomLeft({ pulse = true }: { pulse?: boolean }) {
  return (
    <div 
      className={`glow-bottom-left ${pulse ? 'glow-pulse' : ''}`} 
      aria-hidden="true" 
    />
  );
}

// Interactive card glow effect handler
export function useCardGlow() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };
  
  return { handleMouseMove };
}

// Page wrapper with glow effects
export function PageGlowWrapper({ 
  children,
  showTopGlow = true 
}: { 
  children: React.ReactNode;
  showTopGlow?: boolean;
}) {
  return (
    <div className="relative">
      {showTopGlow && (
        <div className="absolute inset-0 glow-bg pointer-events-none" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
