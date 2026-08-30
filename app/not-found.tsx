import Link from "next/link";

/**
 * 404 — "you wandered into an empty room." A bare pixel room with a single
 * flickering lamp and a door back home.
 */
export default function NotFound() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "linear-gradient(to bottom, #0e0f24, #241a3a)" }}
    >
      {/* a bare room: floor diamond + lonely lamp */}
      <svg width="260" height="170" viewBox="0 0 260 170" aria-hidden shapeRendering="crispEdges">
        <polygon points="130,10 250,70 130,130 10,70" fill="#3a3550" />
        <polygon points="130,130 250,70 250,80 130,140" fill="#2a2438" />
        <polygon points="130,130 10,70 10,80 130,140" fill="#2a2438" />
        {/* lamp */}
        <rect x="126" y="52" width="8" height="30" fill="#5c5768" />
        <rect x="118" y="40" width="24" height="14" fill="#ffb454">
          <animate attributeName="opacity" values="1;1;0.75;1;0.9;1" dur="4s" repeatCount="indefinite" />
        </rect>
        <ellipse cx="130" cy="86" rx="46" ry="18" fill="rgba(255,180,84,0.12)" />
      </svg>

      <h1 className="text-lg" style={{ fontFamily: "var(--font-press-start)", color: "var(--ink)" }}>
        404 — an empty room
      </h1>
      <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        You wandered somewhere the string lights don&apos;t reach. Nothing here but a lamp
        and some very confused dust.
      </p>
      <Link href="/" className="pixel-btn px-4 py-2 text-sm">
        ← Back to the bedroom
      </Link>
    </div>
  );
}
