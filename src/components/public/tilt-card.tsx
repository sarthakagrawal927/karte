'use client';

import { useEffect, useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // Max rotation in degrees on either axis. Default 4 — enough to
  // feel like a physical card under your finger, gentle enough that
  // the contained text stays comfortably readable.
  maxTilt?: number;
}

/**
 * Mouse-tracked 3D tilt wrapper. Tracks cursor position over the
 * element and applies a small rotateX/rotateY in perspective so the
 * card feels like a physical object you're holding. Returns to flat
 * on mouse-leave and is disabled entirely on prefers-reduced-motion
 * and on touch devices (where there's no hover signal anyway).
 */
export function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 4,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (reduced || isTouch) return;
    setEnabled(true);
  }, []);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setTilt({
        x: (py - 0.5) * -maxTilt * 2,
        y: (px - 0.5) * maxTilt * 2,
      });
    });
  }

  function onLeave() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="[perspective:1600px]">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={className}
        style={{
          ...style,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          transition:
            tilt.x === 0 && tilt.y === 0
              ? 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 80ms ease-out',
          willChange: enabled ? 'transform' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
