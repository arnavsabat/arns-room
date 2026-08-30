"use client";

/**
 * PANEL RENDERERS — generic components that turn ContentPanel data
 * (data/content.ts) into window contents. One renderer per `kind`; adding
 * content never requires touching these.
 */

import React from "react";
import type { ContentPanel } from "@/data/content";
import { site } from "@/data/config";

export function PanelBody({ panel }: { panel: ContentPanel }) {
  switch (panel.kind) {
    case "about":
      return (
        <div className="space-y-4 text-[15px] leading-relaxed">
          {panel.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {panel.facts && (
            <dl className="mt-2 space-y-2 border-t-2 pt-3" style={{ borderColor: "var(--panel-wood)" }}>
              {panel.facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-sm" style={{ color: "var(--ink-muted)" }}>
                    {f.label}
                  </dt>
                  <dd className="text-sm">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );

    case "cards":
      return (
        <div className="space-y-4">
          {panel.intro && (
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              {panel.intro}
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {panel.cards.map((card) => (
              <li
                key={card.title}
                className="border-2 p-3"
                style={{ borderColor: "var(--panel-wood)", background: "rgba(0,0,0,0.18)" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{ background: card.accent ?? "var(--arcane)" }}
                  />
                  <h3 className="text-[15px] font-semibold leading-tight">{card.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {card.description}
                </p>
                {card.tags && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {card.tags.map((t) => (
                      <span
                        key={t}
                        className="border px-1.5 py-0.5 text-[11px]"
                        style={{ borderColor: "var(--panel-wood-hi)", color: "var(--ink-muted)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </p>
                )}
                {card.link && (
                  <a
                    href={card.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pixel-btn mt-3 inline-block px-2 py-1 text-xs"
                  >
                    {card.link.label} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      );

    case "writing":
      return (
        <div className="space-y-5">
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            {panel.intro}
          </p>
          <ul className="space-y-4">
            {panel.pieces.map((piece) => (
              <li key={piece.title} className="border-l-4 pl-3" style={{ borderColor: "var(--myth)" }}>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-[15px] font-semibold">{piece.title}</h3>
                  <span
                    className="border px-1.5 text-[11px] uppercase tracking-wide"
                    style={{ borderColor: "var(--panel-wood-hi)", color: "var(--arcane)" }}
                  >
                    {piece.status}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {piece.blurb}
                </p>
                {piece.excerpt && (
                  <blockquote className="mt-2 text-sm italic" style={{ color: "var(--ink)" }}>
                    “{piece.excerpt}”
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
          {panel.shelf && (
            <div>
              <h3
                className="mb-2 text-[11px] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-press-start)", color: "var(--lamp)" }}
              >
                On the shelf
              </h3>
              <ul className="space-y-1.5">
                {panel.shelf.map((book) => (
                  <li key={book.title} className="text-sm">
                    <span aria-hidden style={{ color: "var(--myth)" }}>
                      ▮{" "}
                    </span>
                    {book.title}{" "}
                    <span style={{ color: "var(--ink-muted)" }}>— {book.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

    case "contact":
      return (
        <div className="space-y-5 text-[15px] leading-relaxed">
          <p>{panel.blurb}</p>
          <a href={`mailto:${site.email}`} className="pixel-btn inline-block px-3 py-2 text-sm">
            ✉ {site.email}
          </a>
          <p className="flex flex-wrap gap-2">
            <a
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn px-3 py-1.5 text-sm"
            >
              GitHub ↗
            </a>
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn px-3 py-1.5 text-sm"
            >
              LinkedIn ↗
            </a>
          </p>
        </div>
      );
  }
}
