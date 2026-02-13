import type { NumSlots, PhotoOrientation, StripLayout } from "./types";
import {
  GAP,
  STRIP_PADDING,
  SLOT_W_PORTRAIT,
  SLOT_H_PORTRAIT,
  SLOT_W_LANDSCAPE,
  SLOT_H_LANDSCAPE,
  IMAGE_FRAME_KEYS,
  GRADIENT_FRAME_STYLES,
} from "./constants";

export function getStripLayout(n: NumSlots, orientation: PhotoOrientation): StripLayout {
  const slotW = orientation === "landscape" ? SLOT_W_LANDSCAPE : SLOT_W_PORTRAIT;
  const slotH = orientation === "landscape" ? SLOT_H_LANDSCAPE : SLOT_H_PORTRAIT;

  if (n === 1) {
    const w = STRIP_PADDING * 2 + slotW;
    const h = STRIP_PADDING * 2 + slotH;
    return { width: w, height: h, slots: [{ x: STRIP_PADDING, y: STRIP_PADDING }], slotW, slotH };
  }

  if (n === 2) {
    const w = STRIP_PADDING * 2 + slotW * 2 + GAP;
    const h = STRIP_PADDING * 2 + slotH;
    const y = STRIP_PADDING;
    return {
      width: w,
      height: h,
      slots: [
        { x: STRIP_PADDING, y },
        { x: STRIP_PADDING + slotW + GAP, y },
      ],
      slotW,
      slotH,
    };
  }

  // 4 = 2x2
  const w = STRIP_PADDING * 2 + slotW * 2 + GAP;
  const h = STRIP_PADDING * 2 + slotH * 2 + GAP;
  const y0 = STRIP_PADDING;
  const y1 = y0 + slotH + GAP;
  return {
    width: w,
    height: h,
    slots: [
      { x: STRIP_PADDING, y: y0 },
      { x: STRIP_PADDING + slotW + GAP, y: y0 },
      { x: STRIP_PADDING, y: y1 },
      { x: STRIP_PADDING + slotW + GAP, y: y1 },
    ],
    slotW,
    slotH,
  };
}

export function drawFrameAround(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  key: string,
  frameImages: Record<string, HTMLImageElement>
) {
  if (IMAGE_FRAME_KEYS.includes(key as (typeof IMAGE_FRAME_KEYS)[number])) {
    const img = frameImages[key];
    if (img?.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    ctx.fillStyle = "#e8e0e8";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    return;
  }

  const style = GRADIENT_FRAME_STYLES[key];
  if (style?.type === "gradient") {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    style.colors.forEach((c, i) => g.addColorStop(i / (style.colors.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = key === "gradient_black" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}
