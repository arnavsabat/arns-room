"use client";

/**
 * TOAST — small transient message (soccer-ball goals, Konami discovery…).
 * One at a time, announced politely to screen readers.
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-[300] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pixel-panel px-4 py-2 text-sm"
            style={{ color: "var(--lamp)" }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
