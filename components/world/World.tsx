"use client";

/**
 * WORLD — the conductor. Owns:
 *  - the scale-to-fit math (one transform on one container; sprites stay crisp)
 *  - day/night phase + weather wiring (sets data-phase for the CSS tokens)
 *  - interactions (windows, doors + fade transition, bounces, sparkles)
 *  - HUD layout for every breakpoint
 *  - the loading screen, Konami code, and the dev debug overlay
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { rooms } from "@/data/rooms";
import type { PlacedObject } from "@/data/rooms";
import { features } from "@/data/config";
import { useDayPhase, lampOn } from "@/lib/time";
import { useWeather } from "@/lib/weather";
import { audio } from "@/lib/audio";
import { avatarPos, useWorld } from "@/store/world";
import { Sky } from "./Sky";
import { Room, roomBounds } from "./Room";
import { AvatarLayer } from "./AvatarLayer";
import { WindowLayer } from "@/components/windows/WindowLayer";
import { LoadingScreen } from "@/components/boot/LoadingScreen";
import { SocialButtons } from "@/components/hud/SocialButtons";
import { ClockWidget } from "@/components/hud/ClockWidget";
import { MusicPlayer } from "@/components/hud/MusicPlayer";
import { AudioToggle } from "@/components/hud/AudioToggle";
import { GithubWidget } from "@/components/hud/GithubWidget";
import { Toast } from "@/components/hud/Toast";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

export function World() {
  const booted = useWorld((s) => s.booted);
  const boot = useWorld((s) => s.boot);
  const roomId = useWorld((s) => s.roomId);
  const transitionTo = useWorld((s) => s.transitionTo);
  const startTransition = useWorld((s) => s.startTransition);
  const finishTransition = useWorld((s) => s.finishTransition);
  const openWindows = useWorld((s) => s.openWindows);
  const openWindow = useWorld((s) => s.openWindow);
  const closeTopWindow = useWorld((s) => s.closeTopWindow);
  const konami = useWorld((s) => s.konami);
  const setKonami = useWorld((s) => s.setKonami);
  const debug = useWorld((s) => s.debug);
  const toggleDebug = useWorld((s) => s.toggleDebug);

  const room = rooms[roomId];
  const phase = useDayPhase(features.dayNightCycle);
  const weather = useWeather();
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showMobileHint, setShowMobileHint] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paused = !booted || openWindows.length > 0 || transitionTo !== null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* Day/night: expose the phase to CSS custom properties on <html>. */
  useEffect(() => {
    document.documentElement.dataset.phase = phase;
  }, [phase]);

  /* Position the avatar at the room's spawn on very first load. */
  useEffect(() => {
    avatarPos.gx = rooms[roomId].spawn.gx;
    avatarPos.gy = rooms[roomId].spawn.gy;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally first-mount only
  }, []);

  /* Scale-to-fit: one number, recomputed on resize (rAF-throttled). */
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const { width, height } = roomBounds(rooms[useWorld.getState().roomId]);
      const isNarrow = window.innerWidth < 640;
      const marginX = isNarrow ? 16 : 48;
      const marginTop = isNarrow ? 120 : 90;
      const marginBottom = isNarrow ? 110 : 120; // clear the bottom HUD row
      const s = Math.min(
        (window.innerWidth - marginX * 2) / width,
        (window.innerHeight - marginTop - marginBottom) / height,
        2,
      );
      // Snap to quarter steps ≥ 0.5 so pixels stay even.
      setScale(Math.max(0.5, Math.floor(s * 4) / 4));
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [roomId]);

  /* Esc closes the top window (windows also handle it; this is the fallback
     for when focus has wandered). Backquote toggles the dev debug overlay. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTopWindow();
      if (e.key === "`" && process.env.NODE_ENV === "development") toggleDebug();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeTopWindow, toggleDebug]);

  /* Konami code: a small mythic star shower. */
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      idx = e.key === KONAMI[idx] ? idx + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        setKonami(true);
        audio.play("sparkle");
        showToast("⭐ The gods smile upon you.");
        setTimeout(() => setKonami(false), 6000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setKonami, showToast]);

  /* One-time hint for touch visitors (appears a beat after load). */
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const show = setTimeout(() => setShowMobileHint(true), 600);
    const hide = setTimeout(() => setShowMobileHint(false), 8000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  /* ------------------------------------------------- interaction routing */
  const handleInteract = useCallback(
    (obj: PlacedObject) => {
      const act = obj.interaction;
      if (!act) return;
      switch (act.type) {
        case "window":
          audio.play("click");
          openWindow(act.panelId);
          break;
        case "door":
          audio.play("click");
          startTransition(act.to, act.entry);
          break;
        case "bounce":
          audio.play("bounce");
          showToast(act.message);
          break;
        case "sparkle":
          audio.play("sparkle");
          openWindow(act.panelId);
          break;
      }
    },
    [openWindow, startTransition, showToast],
  );

  const bounds = roomBounds(room);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Sky phase={phase} weather={weather.kind} />

      {/* ---------------- world (scaled as one unit; sprites stay crisp) */}
      <main
        aria-label={`${room.name} — interactive pixel room`}
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingBottom: "min(12vh, 100px)", paddingTop: 60 }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <div style={{ width: bounds.width, height: bounds.height }} className="relative">
            <Room room={room} lampsOn={lampOn(phase)} onInteract={handleInteract}>
              <AvatarLayer
                room={room}
                originX={bounds.originX}
                originY={bounds.originY}
                paused={paused}
                onInteract={handleInteract}
              />
            </Room>
          </div>
        </div>
      </main>

      {/* ---------------- room name */}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-30 text-center text-[10px] tracking-[0.25em]"
        style={{ fontFamily: "var(--font-press-start)", color: "var(--ink-muted)" }}
      >
        {room.name.toUpperCase()}
      </div>

      {/* ---------------- HUD corners */}
      <div className="fixed left-3 top-8 z-30 max-w-[46vw] sm:top-3 sm:max-w-none">
        <SocialButtons />
      </div>
      <div className="fixed right-3 top-8 z-30 sm:top-3">
        <ClockWidget phase={phase} weather={weather} />
      </div>
      <div className="fixed bottom-3 left-3 z-30 flex flex-col gap-2">
        <GithubWidget />
        <MusicPlayer />
      </div>
      <div className="fixed bottom-3 right-3 z-30">
        <AudioToggle />
      </div>

      {/* keyboard hint / mobile hint */}
      <div
        className="kbd-hint pointer-events-none fixed bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px]"
        style={{ color: "var(--ink-muted)" }}
      >
        WASD/arrows to walk · E to interact · Esc closes windows
      </div>
      <AnimatePresence>
        {showMobileHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pixel-panel fixed inset-x-4 top-20 z-30 px-3 py-2 text-center text-xs sm:hidden"
          >
            Tap the furniture to explore! The full walkable room is best on desktop.
          </motion.p>
        )}
      </AnimatePresence>

      <WindowLayer />
      <Toast message={toast} />

      {/* ---------------- Konami star shower */}
      {konami && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[350] overflow-hidden">
          {Array.from({ length: 26 }, (_, i) => (
            <span
              key={i}
              className="absolute text-lg"
              style={{
                left: `${(i * 37) % 100}%`,
                top: "-5vh",
                color: i % 2 ? "var(--myth)" : "var(--lamp)",
                animation: `rain-fall ${2.2 + (i % 5) * 0.5}s linear ${(i % 7) * 0.3}s infinite`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}

      {/* ---------------- room transition fade */}
      <AnimatePresence>
        {transitionTo && (
          <motion.div
            key={transitionTo.roomId}
            className="fixed inset-0 z-[380]"
            style={{ background: "var(--sky-top)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onAnimationComplete={() => finishTransition()}
          />
        )}
      </AnimatePresence>

      {/* ---------------- dev debug overlay (` to toggle; dev builds only) */}
      {debug && <DebugOverlay roomId={roomId} phase={phase} scale={scale} />}

      {!booted && <LoadingScreen onDone={boot} />}
    </div>
  );
}

/* ------------------------------------------------------------ debug HUD */

function DebugOverlay({ roomId, phase, scale }: { roomId: string; phase: string; scale: number }) {
  const [pos, setPos] = useState({ gx: 0, gy: 0 });
  useEffect(() => {
    const id = setInterval(
      () => setPos({ gx: Math.round(avatarPos.gx * 10) / 10, gy: Math.round(avatarPos.gy * 10) / 10 }),
      150,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="fixed left-3 top-24 z-[500] border-2 bg-black/80 p-2 text-[11px] leading-relaxed"
      style={{ borderColor: "var(--arcane)", color: "var(--arcane)" }}
    >
      <div>room: {roomId}</div>
      <div>avatar: {pos.gx}, {pos.gy}</div>
      <div>phase: {phase}</div>
      <div>scale: {scale}</div>
      <div>blocked tiles shown in red</div>
    </div>
  );
}
