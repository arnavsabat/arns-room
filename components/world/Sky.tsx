"use client";

/**
 * SKY — the dreamy night behind the room.
 * ----------------------------------------
 * Layers (back → front): gradient (CSS vars, shifts with day phase) → aurora
 * wash → moon → star field → drifting clouds → shooting stars → weather.
 *
 * Everything animates with transform/opacity only. Star positions come from
 * a SEEDED random generator so the server and client render identical markup
 * (no hydration mismatch, no Math.random in render).
 */

import React, { useMemo } from "react";
import { PixelSprite, type PixelGrid } from "@/lib/pixel";
import type { WeatherKind } from "@/lib/weather";
import type { DayPhase } from "@/data/config";

/* ------------------------------------------------------------- seeded rng */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------ pixel clouds */

const cloudGrid: PixelGrid = {
  palette: { c: "#8a84a8", C: "#6f6890" },
  rows: [
    ".....cccc.......",
    "...cccccccc.....",
    "..cccccccccccc..",
    "cccccccccccccccc",
    "CCcccccccccccCCC",
    "..CCCCCCCCCCC...",
  ],
};

const moonGrid: PixelGrid = {
  palette: { m: "#f5f3ff", M: "#cfc9e8", d: "#b3abd6" },
  rows: [
    "...mmmm...",
    ".mmmmmmmm.",
    ".mmMmmmmm.",
    "mmmmmmdmmm",
    "mmdmmmmmmm",
    "mmmmmmmmmm",
    "mmmmmdmmmm",
    ".mmmmmmmm.",
    ".mmmmmmMm.",
    "...mmmm...",
  ],
};

/* ================================================================== SKY */

type SkyProps = {
  phase: DayPhase;
  weather: WeatherKind;
};

export function Sky({ phase, weather }: SkyProps) {
  const night = phase === "night" || phase === "dusk";

  /* Stars: fixed seed → same field every render, server and client. */
  const stars = useMemo(() => {
    const rand = mulberry32(20260703);
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() > 0.85 ? 3 : 2,
      delay: rand() * 6,
      dur: 3 + rand() * 5,
    }));
  }, []);

  const drops = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      delay: rand() * 4,
      dur: weather === "snow" ? 7 + rand() * 6 : 0.9 + rand() * 0.7,
    }));
  }, [weather]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))",
        transition: "background 1.2s linear",
      }}
    >
      {/* Aurora / nebula wash — barely-there, night only */}
      <div
        className="absolute -inset-x-20 top-[-10%] h-[55%]"
        style={{
          opacity: night ? 1 : 0,
          transition: "opacity 2s linear",
          background:
            "radial-gradient(60% 70% at 30% 30%, rgba(79,214,201,0.10), transparent 70%), radial-gradient(50% 60% at 70% 20%, rgba(154,123,216,0.14), transparent 70%)",
          animation: "aurora-sway 26s ease-in-out infinite",
        }}
      />

      {/* Hint of Olympus: faint warm glow on the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%]"
        style={{
          opacity: night ? 0.5 : 0.2,
          transition: "opacity 2s linear",
          background:
            "radial-gradient(50% 80% at 50% 100%, rgba(255,180,84,0.10), transparent 75%)",
        }}
      />

      {/* Moon */}
      <div
        className="absolute"
        style={{
          left: "56%",
          top: "9%",
          opacity: night ? 1 : 0.25,
          transition: "opacity 2s linear",
          filter: "drop-shadow(0 0 18px rgba(245,243,255,0.35))",
        }}
      >
        <PixelSprite grid={moonGrid} scale={5} />
      </div>

      {/* Star field */}
      <div
        className="absolute inset-0"
        style={{ opacity: night ? 1 : 0.15, transition: "opacity 2s linear" }}
      >
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: "var(--star)",
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Drifting clouds (parallax: two speeds) */}
      {[
        { top: "16%", dur: 150, delay: -30, scale: 4, opacity: 0.5 },
        { top: "34%", dur: 210, delay: -120, scale: 3, opacity: 0.35 },
        { top: "8%", dur: 260, delay: -200, scale: 5, opacity: 0.25 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: c.top,
            opacity: c.opacity,
            animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
            willChange: "transform",
          }}
        >
          <PixelSprite grid={cloudGrid} scale={c.scale} />
        </div>
      ))}

      {/* Shooting stars — rare, slow */}
      {[{ top: "10%", right: "12%", delay: 7, dur: 34 }, { top: "26%", right: "30%", delay: 21, dur: 47 }].map(
        (s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: s.top,
              right: s.right,
              width: 3,
              height: 3,
              background: "var(--star)",
              boxShadow: "6px -3px 12px 2px rgba(245,243,255,0.5)",
              opacity: night ? undefined : 0,
              animation: `shooting-star ${s.dur}s linear ${s.delay}s infinite`,
            }}
          />
        ),
      )}

      {/* Weather particles */}
      {(weather === "rain" || weather === "snow") &&
        drops.map((d) => (
          <div
            key={d.id}
            className="absolute"
            style={{
              left: `${d.x}%`,
              top: "-4vh",
              width: weather === "snow" ? 3 : 2,
              height: weather === "snow" ? 3 : 12,
              borderRadius: weather === "snow" ? 2 : 0,
              background:
                weather === "snow" ? "var(--star)" : "rgba(143,211,255,0.5)",
              animation: `${weather === "snow" ? "snow-fall" : "rain-fall"} ${d.dur}s linear ${d.delay}s infinite`,
              willChange: "transform",
            }}
          />
        ))}
    </div>
  );
}
