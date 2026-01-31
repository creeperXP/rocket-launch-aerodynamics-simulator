'use client';

import React, { useId, useRef, useEffect } from 'react';

export function TermTooltip({
  term,
  definition,
  detail,
  children,
}: {
  term?: string;
  definition: string;
  detail?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  // Adjust tooltip horizontally so it stays within the parent bounds (prevents off-screen)
  const adjust = () => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip || !trigger.parentElement) return;

    // Temporarily make it measurable without affecting layout
    const prevVisibility = tip.style.visibility;
    const prevDisplay = tip.style.display;
    tip.style.visibility = 'hidden';
    tip.style.display = 'block';

    const parentRect = trigger.parentElement.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();

    // Compute left relative to parent
    const centerLeft = triggerRect.left - parentRect.left + triggerRect.width / 2 - tipRect.width / 2;
    const padding = 8;
    let left = centerLeft;
    const maxLeft = parentRect.width - tipRect.width - padding;
    if (left < padding) left = padding;
    if (left > maxLeft) left = Math.max(padding, maxLeft);

    tip.style.left = `${left}px`;
    tip.style.transform = 'translateX(0) translateY(-0.5rem)';

    tip.style.visibility = prevVisibility;
    tip.style.display = prevDisplay;
  };

  useEffect(() => {
    const onResize = () => {
      // Only adjust when tooltip is visible (group-hover:visible applies)
      if (tipRef.current && getComputedStyle(tipRef.current).visibility === 'visible') adjust();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <span className="relative inline-block group">
      <span ref={triggerRef} className="cursor-help underline decoration-dotted" aria-describedby={id} onMouseEnter={adjust} onFocus={adjust}>
        {children}
      </span>

      <div
        id={id}
        ref={tipRef}
        role="tooltip"
        // initial centered positioning via inline style, but adjust() will override when needed
        style={{ left: '50%', transform: 'translateX(-50%) translateY(-0.5rem)' }}
        className="pointer-events-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute z-50 -translate-y-2 bg-slate-900 text-slate-100 text-sm rounded p-2 w-72 shadow-lg"
      >
        {term && <div className="font-semibold text-xs text-amber-400">{term}</div>}
        <div className="text-xs">{definition}</div>
        {detail && <div className="text-xs text-slate-400 mt-1">{detail}</div>}
      </div>
    </span>
  );
}
