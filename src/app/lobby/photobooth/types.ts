export type StickerItem = {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type PhotoOrientation = "landscape" | "portrait";

export type NumSlots = 1 | 2 | 4;

export type StripLayout = {
  width: number;
  height: number;
  slots: { x: number; y: number }[];
  slotW: number;
  slotH: number;
};
