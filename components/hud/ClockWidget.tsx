"use client";

/**
 * CLOCK + SCENE WIDGET (top-right HUD): live local time plus a tiny pixel
 * window showing the current day phase and weather.
 */

import React from "react";
import { useClock } from "@/lib/time";
import { site, type DayPhase } from "@/data/config";
import type { Weather } from "@/lib/weather";
import { PixelSprite, type PixelGrid } from "@/lib/pixel";

/* Tiny scene: sky square + sun/moon + weather marks, per phase. */
function sceneGrid(phase: DayPhase, weather: Weather["kind"]): PixelGrid {
  const skyByPhase: Record<DayPhase, string> = {
    dawn: "#7a4a63",
    day: "#8fa3cc",
    dusk: "#63365c",
    night: "#241a3a",
  };
  const sky = skyByPhase[phase];
  const orb = phase === "day" || phase === "dawn" ? "#ffd9a0" : "#f5f3ff";
  const drop = weather === "snow" ? "#f5f3ff" : "#8fd3ff";
  const showDrops = weather === "rain" || weather === "snow";
  const cloudy = weather === "cloudy" || showDrops;
  return {
    palette: { s: sky, o: orb, c: "#8a84a8", d: drop, g: "#3a3550" },
    rows: [
      "ssssssssss",
      cloudy ? "s.cc..oo.s".replace(/\./g, "s") : "ssssssooss",
      cloudy ? "sccccsooss" : "ssssssooss",
      showDrops ? "s.d..d..ds".replace(/\./g, "s") : "ssssssssss",
      showDrops ? "sd..d..d.s".replace(/\./g, "s") : "ssssssssss",
      "ssssssssss",
      "gggggggggg",
    ],
  };
}

export function ClockWidget({ phase, weather }: { phase: DayPhase; weather: Weather }) {
  const time = useClock();
  return (
    <div className="pixel-panel flex items-center gap-3 px-3 py-2">
      <div style={{ border: "2px solid var(--panel-wood-dark)" }} aria-hidden>
        <PixelSprite grid={sceneGrid(phase, weather.kind)} scale={4} />
      </div>
      <div className="text-right">
        <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
          {site.name}&apos;s Time
        </div>
        {/* suppressHydrationWarning: the clock only ticks client-side */}
        <div
          className="min-w-[9ch] text-lg font-semibold tabular-nums"
          style={{ letterSpacing: "0.04em" }}
          suppressHydrationWarning
        >
          {time || "…"}
        </div>
        <div className="text-[11px] capitalize" style={{ color: "var(--ink-muted)" }}>
          {phase}
          {weather.temp !== null && ` · ${weather.temp}°C ${weather.kind}`}
        </div>
      </div>
    </div>
  );
}
