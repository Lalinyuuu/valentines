export function ResizeHandleArrow({ corner }: { corner: "nw" | "ne" | "se" | "sw" }) {
  const rot = { nw: 225, ne: 315, se: 45, sw: 135 }[corner];
  return (
    <svg
      className="strip-resize-handle-arrow"
      viewBox="0 0 12 12"
      width={12}
      height={12}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path
        d="M2 10L10 2M10 2H5M10 2V7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v4M10 7v4M4 4l.5 8a1 1 0 001 1h5a1 1 0 001-1L12 4" />
    </svg>
  );
}

export function RotateIcon() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3a6 6 0 00-6 6v2M3 13a6 6 0 016-6V5" />
      <path d="M3 3l2 2 2-2M13 13l-2-2 2-2" />
    </svg>
  );
}
