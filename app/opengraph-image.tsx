import { ImageResponse } from "next/og";
import { site } from "@/data/config";

/**
 * OG / Twitter card — a simple pixel night scene so shared links look right.
 * Rendered at build/request time by next/og; no asset files needed.
 */

export const alt = `${site.tabTitle} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #0e0f24, #241a3a)",
          color: "#ece7dd",
          fontFamily: "monospace",
        }}
      >
        {/* stars */}
        {[
          [140, 90], [320, 180], [520, 70], [760, 140], [980, 90], [1080, 220],
          [220, 300], [880, 320], [80, 460], [1120, 480],
        ].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 6,
              height: 6,
              background: i % 3 ? "#f5f3ff" : "#9a7bd8",
            }}
          />
        ))}
        {/* floor diamond + lamp */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            width: 420,
            height: 150,
            background: "#3a3550",
            transform: "rotate(0deg) skewX(0deg)",
            clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 170,
            width: 70,
            height: 44,
            background: "#ffb454",
            boxShadow: "0 0 80px 30px rgba(255,180,84,0.35)",
          }}
        />
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: 6, marginBottom: 18 }}>
          {site.tabTitle}
        </div>
        <div style={{ fontSize: 32, color: "#9a94a8" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
