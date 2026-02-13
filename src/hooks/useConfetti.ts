"use client";

import { useEffect, useMemo, useState } from "react";

export const CONFETTI_COLORS = [
  "#ff6b9d",
  "#c44569",
  "#ffa8c5",
  "#f8bbd9",
  "#fff0f5",
  "#ffebee",
  "#ffcdd2",
  "#fce4ec",
  "#e91e63",
  "#ad1457",
  "#ffd54f",
  "#fff9c4",
];

const HEARTS = ["♥", "♡", "❤"];

export type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  color: string;
  shape: "square" | "heart";
  heart?: string;
};

export function useConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const run = useMemo(() => {
    return () => {
      const count = 55;
      const next: ConfettiPiece[] = Array.from({ length: count }, (_, i) => {
        const isHeart = Math.random() < 0.4;
        return {
          id: Date.now() + i,
          left: Math.random() * 100,
          delay: Math.random() * 0.6,
          color:
            CONFETTI_COLORS[
              Math.floor(Math.random() * CONFETTI_COLORS.length)
            ]!,
          shape: isHeart ? "heart" : "square",
          heart: isHeart ? HEARTS[Math.floor(Math.random() * HEARTS.length)]! : undefined,
        };
      });
      setPieces(next);
    };
  }, []);

  useEffect(() => {
    if (pieces.length === 0) return;
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [pieces.length]);

  return { pieces, runConfetti: run };
}
