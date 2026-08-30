"use client";

/**
 * GITHUB WIDGET (bottom-right HUD): "currently building" — the most recent
 * public repos pushed to. Hides itself entirely when unconfigured, erroring,
 * or empty; the site never looks broken because of it.
 */

import React, { useEffect, useState } from "react";
import { features } from "@/data/config";

type Activity = { items: Array<{ repo: string; url: string; when: string }> };

export function GithubWidget() {
  const [items, setItems] = useState<Activity["items"]>([]);

  useEffect(() => {
    if (!features.github) return;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Activity | null) => setItems(data?.items?.slice(0, 2) ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <div className="pixel-panel hidden max-w-56 px-3 py-2 sm:block">
      <h2
        className="mb-1 text-[9px] tracking-widest"
        style={{ fontFamily: "var(--font-press-start)", color: "var(--arcane)" }}
      >
        CURRENTLY BUILDING
      </h2>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.repo} className="truncate text-xs">
            <a href={it.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {it.repo}
            </a>{" "}
            <span style={{ color: "var(--ink-muted)" }}>{it.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
