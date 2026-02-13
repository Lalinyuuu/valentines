"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StickerItem, PhotoOrientation, NumSlots } from "./photobooth/types";
import {
  STICKER_IMAGE_SRCS,
  STICKER_SIZE,
  STICKER_SCALE_MIN,
  STICKER_SCALE_MAX,
  LANDSCAPE_ASPECT,
  PORTRAIT_ASPECT,
  IMAGE_FRAME_KEYS,
  FRAME_IMAGE_PATHS,
  ALL_FRAME_KEYS,
  STRIP_BG_COLOR,
  FRAME_LABELS,
} from "./photobooth/constants";
import { getStripLayout, drawFrameAround } from "./photobooth/utils";
import { ResizeHandleArrow, TrashIcon, RotateIcon } from "./photobooth/icons";

export default function PhotoboothModal({ isOpen }: { isOpen: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const stripCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const stickerImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [framesReady, setFramesReady] = useState(0);
  const [stickersReady, setStickersReady] = useState(0);

  const [photos, setPhotos] = useState<string[]>([]);
  const [numSlots, setNumSlots] = useState<NumSlots>(4);
  const [photoOrientation, setPhotoOrientation] = useState<PhotoOrientation>("landscape");
  const [currentFrame, setCurrentFrame] = useState<string>("bow");
  const [names, setNames] = useState("");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [resizingHandle, setResizingHandle] = useState<"nw" | "ne" | "se" | "sw" | null>(null);
  const [rotatingStickerId, setRotatingStickerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const stripOverlayRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);
  const rotationStartRef = useRef<{ angle: number; rotation: number } | null>(null);
  const stickerIdRef = useRef(0);

  const layout = getStripLayout(numSlots, photoOrientation);

  useEffect(() => {
    IMAGE_FRAME_KEYS.forEach((key) => {
      const img = new Image();
      img.onload = () => {
        frameImagesRef.current[key] = img;
        setFramesReady((n) => n + 1);
      };
      img.src = FRAME_IMAGE_PATHS[key];
    });
  }, []);

  useEffect(() => {
    STICKER_IMAGE_SRCS.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        stickerImagesRef.current[src] = img;
        setStickersReady((n) => n + 1);
      };
      img.src = src;
    });
  }, []);

  const drawStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: stripW, height: stripH, slots, slotW, slotH } = getStripLayout(numSlots, photoOrientation);

    canvas.width = stripW;
    canvas.height = stripH;
    ctx.fillStyle = STRIP_BG_COLOR;
    ctx.fillRect(0, 0, stripW, stripH);

    slots.forEach((pos, i) => {
      drawFrameAround(ctx, pos.x, pos.y, slotW, slotH, currentFrame, frameImagesRef.current);
      if (!photos[i]) {
        ctx.fillStyle = "#e8dce8";
        ctx.fillRect(pos.x + 6, pos.y + 6, slotW - 12, slotH - 12);
      }
    });

    const innerW = slotW - 12;
    const innerH = slotH - 12;
    const slotAspect = innerW / innerH;

    const drawStickersOnCtx = (ctx2: CanvasRenderingContext2D) => {
      if (stickers.length === 0) return;
      stickers.forEach((s) => {
        const img = stickerImagesRef.current[s.src];
        if (img?.complete && img.naturalWidth > 0) {
          const size = STICKER_SIZE * (s.scale ?? 1);
          const half = size / 2;
          const cx = s.x * stripW;
          const cy = s.y * stripH;
          const rot = (s.rotation ?? 0) * (Math.PI / 180);
          ctx2.save();
          ctx2.translate(cx, cy);
          ctx2.rotate(rot);
          ctx2.drawImage(img, -half, -half, size, size);
          ctx2.restore();
        }
      });
    };

    photos.forEach((dataUrl, i) => {
      if (i >= slots.length) return;
      const pos = slots[i];
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const ctx2 = canvas.getContext("2d");
        if (!ctx2) return;
        const imgAspect = img.width / img.height;
        let sx: number, sy: number, sw: number, sh: number;
        if (imgAspect > slotAspect) {
          sw = img.height * slotAspect;
          sh = img.height;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = img.width / slotAspect;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        ctx2.drawImage(img, sx, sy, sw, sh, pos.x + 6, pos.y + 6, innerW, innerH);
        drawStickersOnCtx(ctx2);
      };
      img.src = dataUrl;
    });

    drawStickersOnCtx(ctx);
  }, [photos, currentFrame, numSlots, photoOrientation, stickers, stickersReady]);

  useEffect(() => {
    if (!isOpen) return;
    setPhotos([]);
    setStickers([]);
    setSelectedStickerId(null);
    setResizingHandle(null);
    setRotatingStickerId(null);
    rotationStartRef.current = null;
    setCountdown(null);
    const canvas = stripCanvasRef.current;
    if (canvas) {
      const { width: w, height: h } = getStripLayout(numSlots, photoOrientation);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = STRIP_BG_COLOR;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#6b5b6b";
        ctx.font = "14px Nunito, sans-serif";
        ctx.textAlign = "center";
        const msg = numSlots === 1 ? "Take 1 photo" : numSlots === 2 ? "Take 2 photos" : "Take 4 photos (2×2)";
        ctx.fillText(`${msg} to create your Photo Strip`, w / 2, h / 2);
      }
    }
    let s: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        s = stream;
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.style.display = "";
          video.play();
        }
      })
      .catch((err) => {
        console.warn("Camera not available:", err);
        if (videoRef.current) videoRef.current.style.display = "none";
      });
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (photos.length > 0) {
      drawStrip();
    } else if (isOpen) {
      const canvas = stripCanvasRef.current;
      if (canvas) {
        const { width: w, height: h } = getStripLayout(numSlots, photoOrientation);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = STRIP_BG_COLOR;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#6b5b6b";
          ctx.font = "14px Nunito, sans-serif";
          ctx.textAlign = "center";
          const msg = numSlots === 1 ? "Take 1 photo" : numSlots === 2 ? "Take 2 photos" : "Take 4 photos (2×2)";
          ctx.fillText(`${msg} to create your Photo Strip`, w / 2, h / 2);
        }
      }
    }
  }, [photos.length, drawStrip, isOpen, numSlots, photoOrientation, framesReady]);

  const addSticker = (src: string) => {
    stickerIdRef.current += 1;
    setStickers((prev) => [...prev, { id: `s-${stickerIdRef.current}`, src, x: 0.5, y: 0.5, scale: 1, rotation: 0 }]);
  };

  const updateStickerPosition = useCallback((id: string, x: number, y: number) => {
    const clamp = (v: number) => Math.max(0.05, Math.min(0.95, v));
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: clamp(x), y: clamp(y) } : s))
    );
  }, []);

  const removeSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStickerId((prev) => (prev === id ? null : prev));
  }, []);

  const updateStickerScale = useCallback((id: string, delta: number) => {
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = (s.scale ?? 1) + delta;
        const scale = Math.max(STICKER_SCALE_MIN, Math.min(STICKER_SCALE_MAX, next));
        return { ...s, scale };
      })
    );
  }, []);

  const updateStickerScaleValue = useCallback((id: string, scale: number) => {
    const clamped = Math.max(STICKER_SCALE_MIN, Math.min(STICKER_SCALE_MAX, scale));
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale: clamped } : s)));
  }, []);

  const updateStickerRotation = useCallback((id: string, rotation: number) => {
    const normalized = ((rotation % 360) + 360) % 360;
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, rotation: normalized } : s)));
  }, []);

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  const handleStripMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const el = stripOverlayRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { clientX, clientY } = getPointerPosition(e);

      if (rotatingStickerId && rotationStartRef.current) {
        const sticker = stickers.find((s) => s.id === rotatingStickerId);
        if (!sticker) return;
        const cx = rect.left + sticker.x * rect.width;
        const cy = rect.top + sticker.y * rect.height;
        const currentAngleDeg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
        const { angle: startAngle, rotation: startRotation } = rotationStartRef.current;
        let delta = currentAngleDeg - startAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        updateStickerRotation(rotatingStickerId, startRotation + delta);
        return;
      }

      if (resizingHandle && selectedStickerId) {
        const sticker = stickers.find((s) => s.id === selectedStickerId);
        if (!sticker) return;
        const cx = rect.left + sticker.x * rect.width;
        const cy = rect.top + sticker.y * rect.height;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const baseDistance =
          (STICKER_SIZE / 2) *
          Math.sqrt((rect.width / layout.width) ** 2 + (rect.height / layout.height) ** 2);
        const newScale = distance / baseDistance;
        updateStickerScaleValue(selectedStickerId, newScale);
        return;
      }

      if (draggingId === null || !dragOffsetRef.current) return;
      const x = (clientX - rect.left) / rect.width - dragOffsetRef.current.dx;
      const y = (clientY - rect.top) / rect.height - dragOffsetRef.current.dy;
      updateStickerPosition(draggingId, x, y);
    },
    [
      draggingId,
      resizingHandle,
      rotatingStickerId,
      selectedStickerId,
      stickers,
      layout.width,
      layout.height,
      updateStickerPosition,
      updateStickerScaleValue,
      updateStickerRotation,
    ]
  );

  const handleStripMouseUp = useCallback(() => {
    if (draggingId) setSelectedStickerId(draggingId);
    setDraggingId(null);
    setResizingHandle(null);
    setRotatingStickerId(null);
    rotationStartRef.current = null;
    dragOffsetRef.current = null;
  }, [draggingId]);

  const handleStickerMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string, stickerX: number, stickerY: number) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedStickerId(id);
      const el = stripOverlayRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { clientX, clientY } = getPointerPosition(e);
      const cursorX = (clientX - rect.left) / rect.width;
      const cursorY = (clientY - rect.top) / rect.height;
      dragOffsetRef.current = { dx: cursorX - stickerX, dy: cursorY - stickerY };
      setDraggingId(id);
    },
    []
  );

  const handleResizeHandleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, corner: "nw" | "ne" | "se" | "sw") => {
    e.preventDefault();
    e.stopPropagation();
    setResizingHandle(corner);
  }, []);

  const handleRotationHandleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const sticker = stickers.find((s) => s.id === id);
      if (!sticker || !stripOverlayRef.current) return;
      const rect = stripOverlayRef.current.getBoundingClientRect();
      const cx = rect.left + sticker.x * rect.width;
      const cy = rect.top + sticker.y * rect.height;
      const { clientX, clientY } = getPointerPosition(e);
      const angleDeg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
      rotationStartRef.current = { angle: angleDeg, rotation: sticker.rotation ?? 0 };
      setRotatingStickerId(id);
    },
    [stickers]
  );

  const handleStripAreaClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedStickerId(null);
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    const onUp = () => {
      setDraggingId(null);
      dragOffsetRef.current = null;
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [draggingId]);

  const handleRetakeLast = () => {
    setPhotos((p) => (p.length > 0 ? p.slice(0, -1) : p));
  };

  const handleRetakeSlot = (index: number) => {
    setPhotos((p) => {
      if (index < 0 || index >= p.length) return p;
      return p.filter((_, i) => i !== index);
    });
  };

  const handleSnap = async () => {
    if (photos.length >= numSlots) return;
    const video = videoRef.current;
    const capture = captureRef.current;
    if (!video || !capture) return;

    setCountdown(3);
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    setCountdown(-1);
    await new Promise((r) => setTimeout(r, 200));

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const isPortrait = photoOrientation === "portrait";
    const targetAspect = isPortrait ? PORTRAIT_ASPECT : LANDSCAPE_ASPECT;
    let sw: number, sh: number, sx: number, sy: number;
    const videoAspect = vw / vh;
    if (videoAspect > targetAspect) {
      sh = vh;
      sw = Math.round(vh * targetAspect);
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = Math.round(vw / targetAspect);
      sx = 0;
      sy = (vh - sh) / 2;
    }
    const outW = sw;
    const outH = sh;
    capture.width = outW;
    capture.height = outH;
    const ctx = capture.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
      ctx.restore();
      setPhotos((p) => [...p, capture.toDataURL("image/png")]);
    }
    setCountdown(null);
  };

  const handleExport = () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || photos.length === 0) return;
    const link = document.createElement("a");
    link.download = "valentine-photostrip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || photos.length === 0) return;
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], "valentine-photostrip.png", { type: "image/png" });
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            navigator.share({ title: "Our Photobooth", files: [file] });
          } else {
            const link = document.createElement("a");
            link.download = "valentine-photostrip.png";
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          }
        },
        "image/png"
      );
    } catch {
      const link = document.createElement("a");
      link.download = "valentine-photostrip.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const frameLabels: Record<string, string> = {
    bow: "Bow",
    cherry: "Cherry",
    polaroid: "Polaroid",
    sun: "Sun",
    gradient_black: "Black",
    gradient_white: "White",
  };

  return (
    <>
      <div className="photobooth-layout">
        <div className="photobooth-left">
          <div
            className={`camera-preview-wrap camera-preview-wrap--${photoOrientation}`}
            style={{ aspectRatio: photoOrientation === "portrait" ? "3/4" : "4/3" }}
          >
            <video ref={videoRef} className="camera-video" playsInline muted style={{ display: "none" }} />
            <canvas ref={captureRef} className="camera-capture" hidden />
            <div className="countdown-overlay" hidden={countdown === null}>
              <span className="countdown-num">{countdown === -1 ? "!" : countdown}</span>
            </div>
          </div>
          <div className="snap-actions">
            <button type="button" className="btn-snap" onClick={handleSnap} disabled={photos.length >= numSlots}>
              SNAP!
            </button>
            <button
              type="button"
              className="btn-retake"
              onClick={handleRetakeLast}
              disabled={photos.length === 0}
              title="Retake this photo"
            >
              Retake last
            </button>
          </div>
        </div>

        <div className="photobooth-right">
          <section className="pb-section">
            <h3 className="pb-section-title">Orientation</h3>
            <div className="pb-chips" role="listbox" aria-label="Orientation">
              <button
                type="button"
                className={`pb-chip ${photoOrientation === "landscape" ? "is-active" : ""}`}
                onClick={() => setPhotoOrientation("landscape")}
              >
                Horizontal
              </button>
              <button
                type="button"
                className={`pb-chip ${photoOrientation === "portrait" ? "is-active" : ""}`}
                onClick={() => setPhotoOrientation("portrait")}
              >
                Vertical
              </button>
            </div>
          </section>
          <section className="pb-section">
            <h3 className="pb-section-title">Photos</h3>
            <div className="pb-chips" role="listbox" aria-label="Number of photos">
              {([1, 2, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`pb-chip ${numSlots === n ? "is-active" : ""}`}
                  onClick={() => {
                    setNumSlots(n);
                    setPhotos((p) => (p.length > n ? p.slice(0, n) : p));
                  }}
                >
                  {n === 4 ? "2×2" : n === 1 ? "1" : `${n}`}
                </button>
              ))}
            </div>
          </section>
          <section className="pb-section">
            <h3 className="pb-section-title">Frame</h3>
            <div className="pb-chips pb-chips-frame" role="listbox">
              {ALL_FRAME_KEYS.map((frame) => (
                <button
                  key={frame}
                  type="button"
                  className={`pb-chip ${currentFrame === frame ? "is-active" : ""}`}
                  data-frame={frame}
                  title={frameLabels[frame] ?? frame}
                  onClick={() => setCurrentFrame(frame)}
                >
                  {frameLabels[frame] ?? frame}
                </button>
              ))}
            </div>
          </section>
          <section className="pb-section">
            <h3 className="pb-section-title">Names</h3>
            <input
              type="text"
              className="pb-input"
              placeholder="e.g. 3Y"
              maxLength={30}
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />
          </section>
          <section className="pb-section">
            <h3 className="pb-section-title">Stickers</h3>
            <p className="pb-section-hint">Click to add, drag on strip</p>
            <div className="pb-sticker-grid">
              {STICKER_IMAGE_SRCS.map((src) => (
                <button
                  key={src}
                  type="button"
                  className="pb-sticker-btn"
                  onClick={() => addSticker(src)}
                >
                  <img src={src} alt="" width={28} height={28} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="photo-strip-wrap">
        <p className="strip-label">Photo Strip</p>
        <div className="photo-strip">
          <div
            className="strip-canvas-wrap"
            style={{ width: layout.width, height: layout.height }}
          >
            <canvas ref={stripCanvasRef} className="strip-canvas" width={layout.width} height={layout.height} />
            {photos.length > 0 && (
              <div
                ref={stripOverlayRef}
                className="strip-sticker-overlay"
                onMouseMove={handleStripMouseMove}
                onMouseLeave={handleStripMouseUp}
                onMouseUp={handleStripMouseUp}
                onTouchMove={handleStripMouseMove}
                onTouchEnd={handleStripMouseUp}
                onClick={handleStripAreaClick}
              >
                {stickers.map((s) => {
                  const size = STICKER_SIZE * (s.scale ?? 1);
                  const isSelected = selectedStickerId === s.id;
                  return (
                    <span
                      key={s.id}
                      className={`strip-sticker-item ${isSelected ? "strip-sticker-item-selected" : ""}`}
                      style={{
                        left: `${s.x * 100}%`,
                        top: `${s.y * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${s.rotation ?? 0}deg)`,
                        width: size,
                        height: size,
                      }}
                      onMouseDown={(e) => handleStickerMouseDown(e, s.id, s.x, s.y)}
                      onTouchStart={(e) => handleStickerMouseDown(e, s.id, s.x, s.y)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        removeSticker(s.id);
                      }}
                    >
                      <img src={s.src} alt="" width={size} height={size} />
                      {isSelected && (
                        <>
                          <span
                            className="strip-rotate-handle"
                            onMouseDown={(e) => handleRotationHandleMouseDown(e, s.id)}
                            onTouchStart={(e) => handleRotationHandleMouseDown(e, s.id)}
                            title="ลากเพื่อหมุน"
                          >
                            <RotateIcon />
                          </span>
                          <button
                            type="button"
                            className="strip-sticker-delete"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSticker(s.id);
                            }}
                            title="ลบสติกเกอร์"
                            aria-label="ลบสติกเกอร์"
                          >
                            <TrashIcon />
                          </button>
                          {(["nw", "ne", "se", "sw"] as const).map((corner) => (
                            <span
                              key={corner}
                              className={`strip-resize-handle strip-resize-handle-${corner}`}
                              onMouseDown={(e) => handleResizeHandleMouseDown(e, corner)}
                              onTouchStart={(e) => handleResizeHandleMouseDown(e, corner)}
                              title="ลากเพื่อย่อ/ขยาย"
                            >
                              <ResizeHandleArrow corner={corner} />
                            </span>
                          ))}
                        </>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="strip-actions">
          {photos.length > 0 && (
            <div className="strip-retake-slots">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn-retake-slot"
                  onClick={() => handleRetakeSlot(i)}
                  title={`Retake photo ${i + 1}`}
                >
                  Retake {i + 1}
                </button>
              ))}
            </div>
          )}
          <button type="button" className="btn-export" disabled={photos.length === 0} onClick={handleExport}>
            Export photo strip
          </button>
          <button type="button" className="btn-share" disabled={photos.length === 0} onClick={handleShare}>
            Share
          </button>
        </div>
      </div>
    </>
  );
}
