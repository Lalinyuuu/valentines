import { asset } from "@/lib/basePath";

export const STICKER_IMAGE_SRCS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(
  (n) => asset(`/images/FRAME/stickers/${n}.png`)
);

export const STICKER_SIZE = 40;
export const STICKER_SCALE_MIN = 0.5;
export const STICKER_SCALE_MAX = 2;
export const STICKER_SCALE_STEP = 0.25;

export const LANDSCAPE_ASPECT = 4 / 3;
export const PORTRAIT_ASPECT = 3 / 4;

export const GAP = 8;
export const STRIP_PADDING = 16;

/** Portrait slot: 160×220 (แนวตั้ง) */
export const SLOT_W_PORTRAIT = 160;
export const SLOT_H_PORTRAIT = 220;

/** Landscape slot: 220×160 (แนวนอน) */
export const SLOT_W_LANDSCAPE = 220;
export const SLOT_H_LANDSCAPE = 160;

export const IMAGE_FRAME_KEYS = ["bow", "cherry", "polaroid", "sun"] as const;
export const FRAME_IMAGE_PATHS: Record<(typeof IMAGE_FRAME_KEYS)[number], string> = {
  bow: asset("/images/FRAME/bow-frame.png"),
  cherry: asset("/images/FRAME/cherry-frame.png"),
  polaroid: asset("/images/FRAME/polaroid-frame.png"),
  sun: asset("/images/FRAME/sun-frame.png"),
};

export const GRADIENT_FRAME_STYLES: Record<string, { type: "gradient"; colors: string[] }> = {
  gradient_black: { type: "gradient", colors: ["#2a2a2a", "#1a1a1a", "#0d0d0d"] },
  gradient_white: { type: "gradient", colors: ["#ffffff", "#f5f5f5", "#eeeeee"] },
};

export const ALL_FRAME_KEYS = [...IMAGE_FRAME_KEYS, "gradient_black", "gradient_white"] as const;
export const STRIP_BG_COLOR = "#f8f2f6";

export const FRAME_LABELS: Record<string, string> = {
  bow: "Bow",
  cherry: "Cherry",
  polaroid: "Polaroid",
  sun: "Sun",
  gradient_black: "Black",
  gradient_white: "White",
};
