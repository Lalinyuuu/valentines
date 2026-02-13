"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type Facing = "up" | "down" | "left" | "right";

export interface Hotspot {
  id: "letter" | "photobooth" | "game";
  x: number;
  y: number;
  radius: number;
  label: string;
}

const PLAYER_BOUNDS = { minX: 12, maxX: 88, minY: 24, maxY: 86 };
const STEP = 3.5;

export const HOTSPOTS: Hotspot[] = [
  { id: "letter", x: 80, y: 42, radius: 10, label: "Letter" },
  { id: "photobooth", x: 22, y: 78, radius: 10, label: "Photobooth" },
  { id: "game", x: 50, y: 30, radius: 11, label: "Room of Secrets" },
];

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function usePlayer(modalOpen: boolean) {
  const [player, setPlayer] = useState({ x: 52, y: 78, facing: "down" as Facing });

  const activeHotspot = useMemo(() => {
    let nearest: Hotspot | null = null;
    let nearestDist = Infinity;
    for (const h of HOTSPOTS) {
      const d = distance({ x: player.x, y: player.y }, h);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = h;
      }
    }
    return nearest && nearestDist <= nearest.radius ? nearest : null;
  }, [player.x, player.y]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (modalOpen) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      let dx = 0;
      let dy = 0;
      let facing = player.facing;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dy = -STEP;
          facing = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dy = STEP;
          facing = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dx = -STEP;
          facing = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dx = STEP;
          facing = "right";
          break;
        default:
          return;
      }
      e.preventDefault();
      setPlayer((p) => ({
        x: clamp(p.x + dx, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX),
        y: clamp(p.y + dy, PLAYER_BOUNDS.minY, PLAYER_BOUNDS.maxY),
        facing,
      }));
    },
    [modalOpen, player.facing]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const move = useCallback((direction: Facing) => {
    if (modalOpen) return;
    let dx = 0;
    let dy = 0;
    switch (direction) {
      case "up":
        dy = -STEP;
        break;
      case "down":
        dy = STEP;
        break;
      case "left":
        dx = -STEP;
        break;
      case "right":
        dx = STEP;
        break;
    }
    setPlayer((p) => ({
      x: clamp(p.x + dx, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX),
      y: clamp(p.y + dy, PLAYER_BOUNDS.minY, PLAYER_BOUNDS.maxY),
      facing: direction,
    }));
  }, [modalOpen]);

  return { player, activeHotspot, move };
}
