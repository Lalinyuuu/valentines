"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BTN_NO_SIZE = 52;
const PANEL_PAD = 24;
const NO_RUN_RADIUS = 90;
const NO_RUN_COOLDOWN_MS = 220;

import { asset } from "@/lib/basePath";

/** ใส่ไฟล์ GIF ใน public/images/FRAME/gif/ แล้วตั้งชื่อเป็น coupon-kiss.gif หรือแก้ path ด้านล่าง */
const COUPON_KISS_GIF = asset("/images/FRAME/gif/coupon-kiss.gif");

function randomPosition(panelRef: React.RefObject<HTMLElement | null>): { left: number; top: number } {
  const panel = panelRef.current;
  if (!panel) return { left: 80, top: 60 };
  const w = panel.offsetWidth || 320;
  const h = panel.offsetHeight || 200;
  const maxLeft = Math.max(PANEL_PAD, w - PANEL_PAD - BTN_NO_SIZE);
  const maxTop = Math.max(PANEL_PAD, h - PANEL_PAD - BTN_NO_SIZE);
  return {
    left: PANEL_PAD + Math.random() * (maxLeft - PANEL_PAD),
    top: PANEL_PAD + Math.random() * (maxTop - PANEL_PAD),
  };
}

export default function GameModal({
  isOpen,
  panelRef,
}: {
  isOpen: boolean;
  panelRef: React.RefObject<HTMLElement | null>;
}) {
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [noClicks, setNoClicks] = useState(0);
  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});
  const [noText, setNoText] = useState("NO");
  const [showProposal, setShowProposal] = useState(false);
  const [showCouponGif, setShowCouponGif] = useState(false);
  const lastNoRunAt = useRef(0);
  const [noScale, setNoScale] = useState(1);
  const [noFontSize, setNoFontSize] = useState(14);
  const [noShrinking, setNoShrinking] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const moveNoAway = useCallback(() => {
    const pos = randomPosition(panelRef);
    setNoButtonStyle({
      position: "absolute",
      left: pos.left,
      top: pos.top,
      transform: "none",
    } as React.CSSProperties);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setNoClicks(0);
    setNoButtonStyle({});
    setNoText("NO");
    setShowProposal(false);
    setShowCouponGif(false);
    setNoScale(1);
    setNoFontSize(14);
    lastNoRunAt.current = 0;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseMove = (e: MouseEvent) => {
      if (noClicks >= 7) return;
      const btn = noButtonRef.current;
      if (!btn) return;
      const now = Date.now();
      if (now - lastNoRunAt.current < NO_RUN_COOLDOWN_MS) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < NO_RUN_RADIUS) {
        lastNoRunAt.current = now;
        moveNoAway();
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isOpen, noClicks, moveNoAway]);

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNoClicks((c) => {
      const next = c + 1;
      if (next <= 3) {
        const pos = randomPosition(panelRef);
        setNoButtonStyle({
          position: "absolute",
          left: pos.left,
          top: pos.top,
          transform: "none",
        } as React.CSSProperties);
      } else if (next <= 6) {
        setNoShrinking(true);
        setNoScale(1 - (next - 3) * 0.08);
        setNoFontSize(Math.max(12, 14 - (next - 3) * 2));
        setTimeout(() => setNoShrinking(false), 300);
      } else if (next >= 7) {
        setNoText("ok ok 😳");
        setNoButtonStyle({});
        setNoScale(1);
        setNoFontSize(14);
      }
      return next;
    });
  };

  const handleYesClick = () => {
    setShowProposal(true);
  };

  const handleCoupon = () => {
    setShowCouponGif(true);
  };

  const handleNavigateToBouquet = () => {
    setIsNavigating(true);
    router.push("/bouquet");
  };

  return (
    <>
      <div
        id="game-screen"
        className="game-screen"
        style={{ display: showProposal ? "none" : undefined }}
      >
        <h2 id="game-title" className="game-title">
          Will you be my Valentine?
        </h2>
        <div className="game-buttons">
          <button type="button" className="btn-yes" onClick={handleYesClick}>
            YES
          </button>
          <button
            type="button"
            ref={noButtonRef}
            className={`btn-no ${noShrinking ? "is-shrinking" : ""}`}
            onClick={handleNoClick}
            style={{
              ...noButtonStyle,
              transform: noButtonStyle.transform ?? `scale(${noScale})`,
              fontSize: noFontSize,
            }}
          >
            {noText}
          </button>
        </div>
      </div>

      <div
        id="proposal-card"
        className="proposal-card"
        style={{ display: showProposal ? undefined : "none" }}
        hidden={!showProposal}
      >
        <h3 className="proposal-headline">YAY! 💖</h3>
        <p className="proposal-text">Thanks for being our warm home</p>
        <button type="button" className="btn-coupon" onClick={handleCoupon}>
          Claim your kiss coupon 💌
        </button>
        <button 
          type="button" 
          className="btn-bouquet" 
          onClick={handleNavigateToBouquet}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <>
              <span className="btn-spinner" />
              Loading...
            </>
          ) : (
            "Take me there ✨"
          )}
        </button>
        <div id="confetti-container" className="confetti-container" />
      </div>

      {showCouponGif && (
        <div
          className="coupon-gif-overlay"
          role="dialog"
          aria-label="Kiss coupon claimed"
          onClick={() => setShowCouponGif(false)}
        >
          <div className="coupon-gif-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="coupon-gif-close"
              aria-label="Close"
              onClick={() => setShowCouponGif(false)}
            >
              ×
            </button>
            <p className="coupon-gif-title">💌 Coupon claimed! Valid forever 🫶</p>
            <img
              src={COUPON_KISS_GIF}
              alt="Cute kiss"
              className="coupon-gif-img"
            />
          </div>
        </div>
      )}
    </>
  );
}
