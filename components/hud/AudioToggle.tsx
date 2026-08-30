"use client";

/**
 * AUDIO TOGGLE (bottom-right HUD): opt-in sound, persisted preference.
 * Also hosts the subtle CRT-overlay toggle.
 */

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio";
import { features } from "@/data/config";

/* Subscribe to the audio manager as an external store (SSR snapshot: off). */
function subscribeAudio(cb: () => void) {
  return audio.onChange(cb);
}

export function AudioToggle() {
  const on = useSyncExternalStore(
    subscribeAudio,
    () => audio.enabled,
    () => false,
  );
  const [crt, setCrt] = useState(false);

  useEffect(() => {
    audio.init(); // restores the persisted preference, notifies subscribers
  }, []);

  useEffect(() => {
    if (!features.crtOverlay) return;
    try {
      const saved = localStorage.getItem("arns-room:crt") === "on";
      document.body.dataset.crt = saved ? "on" : "off";
      // Deferred so hydration (which rendered "off") settles first.
      if (saved) {
        const id = setTimeout(() => setCrt(true), 0);
        return () => clearTimeout(id);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCrt = () => {
    const next = !crt;
    setCrt(next);
    document.body.dataset.crt = next ? "on" : "off";
    try {
      localStorage.setItem("arns-room:crt", next ? "on" : "off");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex gap-2">
      {features.crtOverlay && (
        <button
          className="pixel-btn px-2.5 py-1.5 text-xs"
          onClick={toggleCrt}
          aria-pressed={crt}
          aria-label="Toggle CRT scanlines"
          title="CRT scanlines"
        >
          ▤
        </button>
      )}
      {features.sound && (
        <button
          className="pixel-btn px-2.5 py-1.5 text-xs"
          onClick={() => audio.toggle()}
          aria-pressed={on}
          aria-label={on ? "Mute sound" : "Enable sound effects"}
        >
          {on ? "♪ on" : "♪ off"}
        </button>
      )}
    </div>
  );
}
