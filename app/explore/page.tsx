import type { Metadata } from "next";
import Link from "next/link";
import { panels } from "@/data/content";
import { site } from "@/data/config";
import { PanelBody } from "@/components/windows/panels";

/**
 * /explore — the text version of the site, styled as a retro OS desktop:
 * every section is a fixed "window" with the same wooden title bars as the
 * in-game dialogs, laid out recruiter-first (About → Projects → work →
 * Contact). Fully accessible, no game controls needed.
 */

export const metadata: Metadata = {
  title: `${site.tabTitle} — Text view`,
  description: `Everything in ${site.name}'s pixel room, as a readable page.`,
};

/** Recruiter-first order. */
const ORDER = ["about", "projects", "art", "writing", "comics", "hobbies", "contact"];
/** Windows that span the full desktop width (their content is card grids). */
const WIDE = new Set(["about", "projects", "art", "comics"]);

function WindowFrame({
  title,
  accent,
  wide,
  children,
}: {
  title: string;
  accent?: string;
  wide: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={`pixel-panel flex flex-col ${wide ? "md:col-span-2" : ""}`}
    >
      <header
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: "var(--panel-wood)", borderBottom: "3px solid var(--panel-wood-dark)" }}
      >
        <span aria-hidden className="inline-block h-3 w-3" style={{ background: accent ?? "var(--lamp)" }} />
        <h2 className="text-[11px] tracking-wider" style={{ fontFamily: "var(--font-press-start)" }}>
          {title}
        </h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ExplorePage() {
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "var(--sky-top)" }}>
      {/* ------------------------------------------------ desktop menu bar */}
      <div
        className="sticky top-0 z-10 px-4 py-2.5"
        style={{
          background: "var(--panel-wood)",
          borderBottom: "3px solid var(--panel-wood-dark)",
          boxShadow: "0 3px 0 rgba(0,0,0,0.35)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <span
            className="text-[11px] tracking-[0.2em]"
            style={{ fontFamily: "var(--font-press-start)", color: "var(--ink)" }}
          >
            {site.tabTitle.toUpperCase()} — TEXT VIEW
          </span>
          <nav aria-label="Profile links" className="flex flex-wrap items-center gap-2">
            {site.links.resume && (
              <a href={site.links.resume} target="_blank" rel="noopener noreferrer" className="pixel-btn px-2.5 py-1 text-[11px]">
                Resumé
              </a>
            )}
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="pixel-btn px-2.5 py-1 text-[11px]">
              GitHub
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="pixel-btn px-2.5 py-1 text-[11px]">
              LinkedIn
            </a>
            <a href={`mailto:${site.email}`} className="pixel-btn px-2.5 py-1 text-[11px]">
              Email
            </a>
            <Link href="/" className="pixel-btn px-2.5 py-1 text-[11px]" style={{ color: "var(--arcane)" }}>
              ◂ Enter the room
            </Link>
          </nav>
        </div>
      </div>

      {/* ------------------------------------------------ intro strip */}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          {site.name} — designer, artist, and writer. This is the plain-text version of{" "}
          <Link href="/" className="underline" style={{ color: "var(--arcane)" }}>
            the interactive room
          </Link>
          ; everything in the world is also readable below.
        </p>
      </div>

      {/* ------------------------------------------------ the windows */}
      <main className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 md:grid-cols-2">
        {ORDER.map((id) => {
          const panel = panels[id];
          if (!panel) return null;
          return (
            <WindowFrame key={id} title={panel.title} accent={panel.accent} wide={WIDE.has(id)}>
              <PanelBody panel={panel} />
            </WindowFrame>
          );
        })}
      </main>

      <footer className="pb-12 text-center text-xs" style={{ color: "var(--ink-muted)" }}>
        © {new Date().getFullYear()} {site.name} ·{" "}
        <a href={`mailto:${site.email}`} className="underline">
          {site.email}
        </a>
      </footer>
    </div>
  );
}
