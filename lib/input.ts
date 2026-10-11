/**
 * INPUT ABSTRACTION
 * -----------------
 * All movement/interaction input flows through this tiny manager as named
 * ACTIONS, never raw key codes. The keyboard binds to it today; a touch
 * joystick / D-pad (future feature) just calls `press()`/`release()` with the
 * same action names — no changes needed anywhere else.
 */

export type InputAction = "up" | "down" | "left" | "right" | "interact";

type Listener = (action: InputAction) => void;

class InputManager {
  private held = new Set<InputAction>();
  private tapListeners = new Set<Listener>();

  /** Actions currently held down (polled by the movement loop each frame). */
  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  press(action: InputAction) {
    if (!this.held.has(action)) {
      this.held.add(action);
      if (action === "interact") this.tapListeners.forEach((l) => l(action));
    }
  }

  release(action: InputAction) {
    this.held.delete(action);
  }

  releaseAll() {
    this.held.clear();
  }

  /** Subscribe to discrete taps (currently just "interact"). */
  onTap(listener: Listener): () => void {
    this.tapListeners.add(listener);
    return () => this.tapListeners.delete(listener);
  }
}

export const input = new InputManager();

/** Keyboard bindings. Arrows + WASD move; E / Enter / Space interact. */
const KEY_MAP: Record<string, InputAction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
  e: "interact",
  E: "interact",
  Enter: "interact",
  " ": "interact",
};

function shouldIgnoreKey(
  el: EventTarget | null,
  action: InputAction,
  key: string
): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
    return true; // never steal keys from a text field
  // Buttons/links keep Enter and Space (activation keys); movement keys like
  // WASD still walk even when a button happens to hold focus.
  if (
  action === "interact" &&
  (el.tagName === "BUTTON" || el.tagName === "A") &&
  (key === "Enter" || key === " ")
) {
  return true;
}
  return false;
}

/**
 * Attach global keyboard listeners. Call once from the World component;
 * returns a cleanup function. `enabled` is checked at event time so the
 * world can pause input while a modal window is open.
 */
export function bindKeyboard(enabled: () => boolean): () => void {
  const down = (e: KeyboardEvent) => {
    const action = KEY_MAP[e.key];
    if (!action || shouldIgnoreKey(e.target, action, e.key) || !enabled()) return;
    // Prevent arrows/space from scrolling the page.
    e.preventDefault();
    input.press(action);
  };
  const up = (e: KeyboardEvent) => {
    const action = KEY_MAP[e.key];
    if (action) input.release(action);
  };
  const blur = () => input.releaseAll();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", blur);
    input.releaseAll();
  };
}
