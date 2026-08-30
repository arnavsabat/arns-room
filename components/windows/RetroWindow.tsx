"use client";

/**
 * RETRO WINDOW — draggable OS-style dialog with a wooden pixel title bar.
 * Accessibility contract: role=dialog, focus trapped inside, Esc closes,
 * focus returns to whatever opened it. Never larger than the viewport;
 * content scrolls internally.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { audio } from "@/lib/audio";

type RetroWindowProps = {
  title: string;
  accent?: string;
  z: number;
  /** Cascade index so stacked windows don't perfectly overlap. */
  index: number;
  size?: { w: number; h: number };
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function RetroWindow({
  title,
  accent,
  z,
  index,
  size,
  onClose,
  onFocus,
  children,
}: RetroWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const reducedMotion = useReducedMotion();
  const [pos, setPos] = useState(() => ({
    x: (index % 4) * 28,
    y: (index % 4) * 24,
  }));
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  /* Focus management: remember the opener, focus the dialog, restore after. */
  useEffect(() => {
    opener.current = document.activeElement;
    ref.current?.focus();
    audio.play("open");
    return () => {
      audio.play("close");
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !ref.current) return;
    /* Focus trap */
    const focusables = Array.from(
      ref.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* Title-bar dragging via pointer events. */
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const margin = 40;
    const nx = drag.current.baseX + (e.clientX - drag.current.startX);
    const ny = drag.current.baseY + (e.clientY - drag.current.startY);
    setPos({
      x: Math.max(-window.innerWidth / 2 + margin, Math.min(window.innerWidth / 2 - margin, nx)),
      y: Math.max(-window.innerHeight / 2 + margin, Math.min(window.innerHeight / 2 - margin, ny)),
    });
  };
  const onPointerUp = () => (drag.current = null);

  const titleId = `win-title-${title.replace(/\W+/g, "-")}`;

  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 100 + z }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reducedMotion ? false : { scale: 0.85, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        onKeyDown={onKeyDown}
        onPointerDownCapture={onFocus}
        className="pixel-panel pointer-events-auto flex flex-col outline-none"
        style={{
          translate: `${pos.x}px ${pos.y}px`,
          width: `min(${size?.w ?? 520}px, calc(100vw - 24px))`,
          maxHeight: "min(calc(100dvh - 90px), " + (size?.h ?? 460) + "px)",
        }}
      >
        {/* Title bar */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex touch-none select-none items-center gap-2 px-3 py-2"
          style={{
            background: "var(--panel-wood)",
            borderBottom: "3px solid var(--panel-wood-dark)",
            cursor: "grab",
          }}
        >
          <span
            aria-hidden
            className="inline-block h-3 w-3"
            style={{ background: accent ?? "var(--lamp)" }}
          />
          <h2
            id={titleId}
            className="min-w-0 flex-1 truncate text-[11px] tracking-wider"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="pixel-btn px-2 py-0.5 text-xs leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content (scrolls internally) */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
