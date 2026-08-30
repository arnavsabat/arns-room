/**
 * TIME SERVICE — day/night cycle + live clock.
 * Where to change: phase boundaries below; the colors they map to live in
 * app/globals.css ([data-phase=...] blocks).
 */

import { useEffect, useState } from "react";
import type { DayPhase } from "@/data/config";

/** Phase boundaries in local hours. */
const PHASES: Array<{ from: number; to: number; phase: DayPhase }> = [
  { from: 5, to: 8, phase: "dawn" },
  { from: 8, to: 17, phase: "day" },
  { from: 17, to: 20, phase: "dusk" },
  // everything else is night
];

export function phaseForHour(hour: number): DayPhase {
  for (const p of PHASES) if (hour >= p.from && hour < p.to) return p.phase;
  return "night";
}

/** True when the room lamp should be on (dusk + night + dawn). */
export function lampOn(phase: DayPhase): boolean {
  return phase !== "day";
}

/** Live clock string, updating every second. Returns "" until mounted (SSR-safe). */
export function useClock(): string {
  const [text, setText] = useState("");
  useEffect(() => {
    const tick = () =>
      setText(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return text;
}

/** Current day phase, re-checked once a minute. Defaults to night (SSR-safe). */
export function useDayPhase(enabled: boolean): DayPhase {
  const [phase, setPhase] = useState<DayPhase>("night");
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setPhase(phaseForHour(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [enabled]);
  return phase;
}
