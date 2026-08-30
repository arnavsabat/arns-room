/**
 * AUDIO MANAGER — tiny SFX, all synthesized with WebAudio (no background music).
 * ---------------------------------------------------------------------------
 * No audio files to load: every sound is generated from oscillators, which
 * keeps the bundle at zero bytes of audio and makes first playback instant.
 *
 * Rules honored here:
 *  - Sound is OFF until the user opts in (browser autoplay policies + spec).
 *  - The preference persists in localStorage across visits.
 *  - Everything routes through one master gain so mute is instant and total.
 *
 * Where to change: SFX recipes are in the SFX map at the bottom.
 */

const STORAGE_KEY = "arns-room:audio";

type SfxName = "click" | "open" | "close" | "step" | "bounce" | "sparkle";

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _enabled = false;
  private listeners = new Set<(on: boolean) => void>();

  get enabled() {
    return this._enabled;
  }

  /** Restore the persisted preference. Call once on mount (client only). */
  init() {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") {
        // Don't start the context yet (needs a user gesture) — just remember
        // intent; the first click on the toggle or the world will start it.
        this._enabled = true;
        this.notify();
      }
    } catch {
      /* localStorage unavailable (private mode) — stay muted */
    }
  }

  toggle(): boolean {
    this.setEnabled(!this._enabled);
    return this._enabled;
  }

  setEnabled(on: boolean) {
    this._enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (on) this.ensureContext();
    this.notify();
  }

  onChange(l: (on: boolean) => void): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private notify() {
    this.listeners.forEach((l) => l(this._enabled));
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Play a one-shot blip. Silently no-ops when muted. */
  play(name: SfxName) {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const recipe = SFX[name];
    for (const note of recipe) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, t + note.at);
      if (note.slide) {
        osc.frequency.exponentialRampToValueAtTime(
          note.slide,
          t + note.at + note.dur,
        );
      }
      gain.gain.setValueAtTime(0, t + note.at);
      gain.gain.linearRampToValueAtTime(note.vol, t + note.at + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.at + note.dur);
      osc.connect(gain).connect(this.master);
      osc.start(t + note.at);
      osc.stop(t + note.at + note.dur + 0.02);
    }
  }

}

/** One-shot SFX recipes: tiny oscillator envelopes. */
const SFX: Record<
  SfxName,
  Array<{
    type: OscillatorType;
    freq: number;
    slide?: number;
    at: number;
    dur: number;
    vol: number;
  }>
> = {
  click: [{ type: "square", freq: 660, at: 0, dur: 0.06, vol: 0.12 }],
  open: [
    { type: "square", freq: 440, at: 0, dur: 0.07, vol: 0.1 },
    { type: "square", freq: 660, at: 0.07, dur: 0.09, vol: 0.1 },
  ],
  close: [
    { type: "square", freq: 660, at: 0, dur: 0.07, vol: 0.1 },
    { type: "square", freq: 440, at: 0.07, dur: 0.09, vol: 0.1 },
  ],
  step: [{ type: "triangle", freq: 200, at: 0, dur: 0.045, vol: 0.06 }],
  bounce: [
    { type: "sine", freq: 300, slide: 520, at: 0, dur: 0.12, vol: 0.14 },
  ],
  sparkle: [
    { type: "sine", freq: 880, at: 0, dur: 0.08, vol: 0.08 },
    { type: "sine", freq: 1320, at: 0.06, dur: 0.1, vol: 0.08 },
    { type: "sine", freq: 1760, at: 0.13, dur: 0.14, vol: 0.06 },
  ],
};

export const audio = new AudioManager();
