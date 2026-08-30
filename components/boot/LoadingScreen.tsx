"use client";

/**
 * LOADING SCREEN — the deliberate retro "Loading… N%" gag.
 * The bar tracks real readiness (fonts loaded + first paint settled) but
 * animates through charming fake increments so it never looks broken.
 * Reduced motion → quick, quiet load with no crawl.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { site } from "@/data/config";

const FLAVOR = [
  "sweeping the floor…",
  "lighting the lamp…",
  "shelving the myths…",
  "inflating the soccer ball…",
  "arguing with the muses…",
  "untangling the string lights…",
];

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [flavorIdx, setFlavorIdx] = useState(0);
  const [gone, setGone] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    let fontsReady = false;
    void document.fonts?.ready.then(() => (fontsReady = true));

    const started = performance.now();
    const minShow = reducedMotion ? 250 : 1400; // the gag needs a beat — but not for reduced motion

    const id = setInterval(() => {
      if (!mounted) return;
      setProgress((p) => {
        const elapsed = performance.now() - started;
        // Crawl toward 90%, then wait for fonts + minimum time to finish.
        const target = fontsReady && elapsed > minShow ? 100 : 90;
        const step = reducedMotion ? 34 : 3 + Math.round(Math.sin(elapsed / 300) * 2 + 3);
        return Math.min(target, p + step);
      });
    }, reducedMotion ? 60 : 90);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setFlavorIdx((i) => (i + 1) % FLAVOR.length), 900);
    return () => clearInterval(id);
  }, [reducedMotion]);

  useEffect(() => {
    if (progress >= 100 && !gone) {
      const id = setTimeout(() => {
        setGone(true);
        onDone();
      }, 350);
      return () => clearTimeout(id);
    }
  }, [progress, gone, onDone]);

  const cells = 20;
  const filled = Math.floor((progress / 100) * cells);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[400] flex flex-col items-center justify-center gap-6 px-6"
          style={{ background: "linear-gradient(to bottom, #0e0f24, #241a3a)" }}
          role="status"
          aria-label="Loading"
        >
          <h1
            className="text-center text-lg sm:text-2xl"
            style={{ fontFamily: "var(--font-press-start)", color: "var(--ink)" }}
          >
            {site.tabTitle}
          </h1>

          {/* chunky pixel progress bar */}
          <div
            className="flex gap-1 border-4 p-1.5"
            style={{ borderColor: "var(--panel-wood)", background: "rgba(0,0,0,0.4)" }}
            aria-hidden
          >
            {Array.from({ length: cells }, (_, i) => (
              <div
                key={i}
                className="h-4 w-2.5 sm:h-5 sm:w-3"
                style={{ background: i < filled ? "var(--lamp)" : "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>

          <p className="text-sm tabular-nums" style={{ color: "var(--ink)" }}>
            Loading… {progress}%
          </p>
          <p className="min-h-[1.5em] text-xs" style={{ color: "var(--ink-muted)" }} aria-hidden>
            {FLAVOR[flavorIdx]}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
