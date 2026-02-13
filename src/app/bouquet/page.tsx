"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BackgroundMusic from "@/components/BackgroundMusic";

const FlowerCanvas = dynamic(() => import("@/components/FlowerCanvas"), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'rgba(107, 91, 107, 0.6)',
      gap: '0.5rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(212, 86, 140, 0.2)',
        borderTop: '3px solid rgba(212, 86, 140, 0.8)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: '0.9rem' }}>Loading 3D bouquet...</p>
      <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>(11 MB - may take a moment)</p>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
    </div>
  )
});
import { useConfetti } from "@/hooks/useConfetti";

export default function BouquetPage() {
  const [messageOpen, setMessageOpen] = useState(false);
  const { pieces, runConfetti } = useConfetti();

  const openMessage = () => {
    setMessageOpen(true);
    runConfetti();
  };

  return (
    <div className="bouquet-page">
      <BackgroundMusic song="bouquet" autoPlayOnMount />
      <div className="bouquet-intro-overlay" aria-hidden="true" />
      {pieces.length > 0 && (
        <div className="confetti-container confetti-container--page" aria-hidden="true">
          {pieces.map((p) =>
            p.shape === "heart" && p.heart ? (
              <span
                key={p.id}
                className="confetti-piece confetti-piece--heart"
                style={{
                  left: `${p.left}%`,
                  top: 0,
                  color: p.color,
                  animationDelay: `${p.delay}s`,
                }}
              >
                {p.heart}
              </span>
            ) : (
              <div
                key={p.id}
                className="confetti-piece"
                style={{
                  left: `${p.left}%`,
                  top: 0,
                  backgroundColor: p.color,
                  animationDelay: `${p.delay}s`,
                }}
              />
            )
          )}
        </div>
      )}
      <div className="bouquet-inner">
        <div className="bouquet-header">
          <a href="/" className="btn-back">
            ← Back to room
          </a>
          <div className="bouquet-header-center">
            <h1 className="bouquet-title">
              Happy Valentine&apos;s Day & Happy 7-Year Anniversary 🤍
            </h1>
          </div>
          <div className="bouquet-header-spacer" aria-hidden="true" />
        </div>

        <div className="canvas-container">
          <FlowerCanvas />
        </div>

        <div className="bouquet-message-wrap">
          {messageOpen ? (
            <div className="bouquet-message">
              <button
                type="button"
                className="bouquet-message-close"
                onClick={() => setMessageOpen(false)}
                aria-label="Close message"
              >
                ×
              </button>
              <p className="bouquet-message-line">Happy Valentine&apos;s Day 🤍</p>
              <p className="bouquet-message-line">
                No bouquet in my hands cuz I&apos;m broke and practical 😌
              </p>
              <p className="bouquet-message-line">
                So I crafted you a 3D bouquet instead… and of course made a tiny
                website to go with it bc I can&apos;t flirt normally, I code
                555555 ✨
              </p>
              <p className="bouquet-message-line">
                Real flowers wilt, but this one can be rotated, zoomed, and
                admired forever.
              </p>
              <p className="bouquet-message-line">
                Thank you for your constant support seriously. You&apos;ve been
                my favorite kind of good luck charm na ja
              </p>
              <p className="bouquet-message-line">
                Now please accept this digital flower and pretend you&apos;re
                impressed. Truly. eiei 😄
              </p>
            </div>
          ) : (
            <button
              type="button"
              className="bouquet-message-toggle"
              onClick={openMessage}
            >
              Read message 💌
            </button>
          )}
        </div>

        <p className="bouquet-hint">Drag to rotate / scroll to zoom</p>
      </div>
    </div>
  );
}
