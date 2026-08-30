"use client";

/**
 * WINDOW LAYER — renders every open window from the store. AnimatePresence
 * lets closes play their exit spring.
 */

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useWorld } from "@/store/world";
import { panels } from "@/data/content";
import { RetroWindow } from "./RetroWindow";
import { PanelBody } from "./panels";

export function WindowLayer() {
  const openWindows = useWorld((s) => s.openWindows);
  const closeWindow = useWorld((s) => s.closeWindow);
  const focusWindow = useWorld((s) => s.focusWindow);

  return (
    <AnimatePresence>
      {openWindows.map((win, i) => {
        const panel = panels[win.panelId];
        if (!panel) return null;
        return (
          <RetroWindow
            key={win.panelId}
            title={panel.title}
            accent={panel.accent}
            size={panel.size}
            z={win.z}
            index={i}
            onClose={() => closeWindow(win.panelId)}
            onFocus={() => focusWindow(win.panelId)}
          >
            <PanelBody panel={panel} />
          </RetroWindow>
        );
      })}
    </AnimatePresence>
  );
}
