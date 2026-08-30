"use client";

/**
 * SOCIAL BUTTONS (top-left HUD): resume / LinkedIn / GitHub + a link to the
 * accessible text version of the site. Resume hides itself until a PDF path
 * is set in data/config.ts.
 */

import React from "react";
import Link from "next/link";
import { site } from "@/data/config";

export function SocialButtons() {
  return (
    <nav aria-label="Profile links" className="flex flex-wrap gap-2">
      {site.links.resume && (
        <a
          href={site.links.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn px-3 py-1.5 text-xs"
        >
          📄 Resumé
        </a>
      )}
      <a
        href={site.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel-btn px-3 py-1.5 text-xs"
      >
        in LinkedIn
      </a>
      <a
        href={site.links.github}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel-btn px-3 py-1.5 text-xs"
      >
        ⌥ GitHub
      </a>
      <Link href="/explore" className="pixel-btn px-3 py-1.5 text-xs" title="Text version of everything in the room">
        ☰ Text view
      </Link>
    </nav>
  );
}
