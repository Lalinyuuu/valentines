"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/basePath";
import type { ModalId } from "@/app/lobby/useLobbyModals";
import { useLobbyModals } from "@/app/lobby/useLobbyModals";
import { usePlayer } from "@/app/lobby/usePlayer";
import PhotoboothModal from "@/app/lobby/PhotoboothModal";
import GameModal from "@/app/lobby/GameModal";
import BackgroundMusic from "@/components/BackgroundMusic";
import { useConfetti } from "@/hooks/useConfetti";

export default function Page() {
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const { openModal, closeModal } = useLobbyModals(activeModal, setActiveModal);
  const { player, activeHotspot, move } = usePlayer(activeModal !== null);
  const gamePanelRef = useRef<HTMLDivElement>(null);
  const { pieces, runConfetti } = useConfetti();

  // Confetti when opening Letter
  useEffect(() => {
    if (activeModal === "letter") runConfetti();
  }, [activeModal, runConfetti]);

  // Space / Enter: open active hotspot modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeModal) return;
      if (e.key !== " " && e.key !== "Spacebar" && e.key !== "Enter") return;
      if (activeHotspot) {
        e.preventDefault();
        openModal(activeHotspot.id);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeModal, activeHotspot, openModal]);

  return (
    <>
      <BackgroundMusic song="lobby" />
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
      <main id="lobby" className="lobby">
        <div className="lobby-map">
          <div className="room-bg" />

          <div className="zone zone-cozy">
            <div className="window">
              <div className="window-frame" />
              <div className="window-glass" />
            </div>
            <div className="lamp">
              <div className="lamp-base" />
              <div className="lamp-shade" />
              <div className="lamp-glow" />
            </div>
            <div className="bed">
              <div className="bed-base" />
              <div className="bed-pillow" />
            </div>
            <button
              type="button"
              className="room-item room-item-letter"
              aria-label="Open Letter"
              onClick={() => openModal("letter")}
            >
              <span className="item-icon item-icon-img">
                <img src={asset("/images/MAP/letter.png")} alt="" />
              </span>
              <span className="item-sparkle" />
            </button>
            <button
              type="button"
              className="room-item room-item-photobooth"
              aria-label="Open Photobooth"
              onClick={() => openModal("photobooth")}
            >
              <span className="item-icon item-icon-img">
                <img src={asset("/images/MAP/camera.png")} alt="" />
              </span>
              <span className="item-sparkle" />
            </button>
          </div>

          <div className="zone zone-desk">
            <div className="table">
              <div className="table-surface" />
            </div>
          </div>

          <div className="zone zone-game">
            <div className="poster-area">
              <button
                type="button"
                className="room-item room-item-game"
                aria-label="Open Room of Secrets"
                onClick={() => openModal("game")}
              >
                <span className="item-icon item-icon-img item-icon-heart">
                  <img src={asset("/images/MAP/heart.png")} alt="" />
                </span>
                <span className="item-sparkle" />
              </button>
            </div>
          </div>

          <div
            className={`player-avatar facing-${player.facing}`}
            aria-label="You are in the Love Lobby"
            role="img"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          />

          {activeHotspot && (
            <button
              type="button"
              className="interaction-hint interaction-hint-btn"
              onClick={() => openModal(activeHotspot.id)}
              aria-label={`Open ${activeHotspot.label}`}
            >
              <span className="interaction-hint-key">Tap</span>
              <span className="interaction-hint-text">{activeHotspot.label}</span>
            </button>
          )}
        </div>

        <div className="lobby-dpad" aria-label="Move">
          <button type="button" className="dpad-btn dpad-up" aria-label="Move up" onClick={() => move("up")}>↑</button>
          <button type="button" className="dpad-btn dpad-down" aria-label="Move down" onClick={() => move("down")}>↓</button>
          <button type="button" className="dpad-btn dpad-left" aria-label="Move left" onClick={() => move("left")}>←</button>
          <button type="button" className="dpad-btn dpad-right" aria-label="Move right" onClick={() => move("right")}>→</button>
        </div>

        <header className="lobby-header">
          <h1 className="lobby-title">LOBBY</h1>
          <p className="lobby-sub">You&apos;re in. Don&apos;t smile alone 🫶</p>
          <p className="lobby-hint lobby-hint-desktop">Use arrow keys or W A S D to move, Space to interact</p>
          <p className="lobby-hint lobby-hint-mobile">Use the arrows below to move. Tap the label when near a spot to open.</p>
        </header>
      </main>

      {/* Letter Modal */}
      <div
        className={`modal ${activeModal === "letter" ? "is-open" : ""}`}
        role="dialog"
        aria-labelledby="letter-title"
        aria-modal="true"
        hidden={activeModal !== "letter"}
      >
        <div className="modal-backdrop" onClick={closeModal} role="button" tabIndex={0} aria-label="Close" />
        <div className="modal-panel modal-panel-letter">
          <button type="button" className="modal-close" aria-label="Close" onClick={closeModal}>
            ×
          </button>
          <div className="letter-content">
            <h2 id="letter-title" className="letter-title">
              To my favorite person,
            </h2>
            <div className="letter-body">
              <p>Thank you for staying by my side on the good days… and especially on the tired, grumpy, &quot;I need food and silence&quot; days too.</p>
              <p>You&apos;ve seen every version of me soft, chaotic, sleepy, dramatic and somehow you&apos;re still here. That&apos;s talent.</p>
              <p>Happy Valentine&apos;s Day &amp; happy 7-year anniversary 🤍<br />Seven years is wild. Like… we really did that.</p>
              <p>Thank you for being my safe place, my comfort, my laughter, and my everyday <span style={{ color: "#d4568c", fontWeight: 600 }}>{`"okay I can do this"`}</span> energy.</p>
              <p>I love you more than the word love can even handle<br />and if love had a score, you&apos;d be max level already. 💗</p>
            </div>
            <p className="letter-signature">— GAGA</p>
          </div>
        </div>
      </div>

      {/* Photobooth Modal */}
      <div
        className={`modal ${activeModal === "photobooth" ? "is-open" : ""}`}
        role="dialog"
        aria-labelledby="photobooth-title"
        aria-modal="true"
        hidden={activeModal !== "photobooth"}
      >
        <div className="modal-backdrop" onClick={closeModal} role="button" tabIndex={0} aria-label="Close" />
        <div className="modal-panel modal-panel-photobooth">
          <button type="button" className="modal-close" aria-label="Close" onClick={closeModal}>
            ×
          </button>
          <h2 id="photobooth-title" className="photobooth-header">
            Our Photobooth 📸
          </h2>
          <p className="photobooth-sub">Snap a few before the cuteness fades</p>
          <PhotoboothModal isOpen={activeModal === "photobooth"} />
        </div>
      </div>

      {/* Game Modal */}
      <div
        className={`modal ${activeModal === "game" ? "is-open" : ""}`}
        role="dialog"
        aria-labelledby="game-title"
        aria-modal="true"
        hidden={activeModal !== "game"}
      >
        <div className="modal-backdrop" onClick={closeModal} role="button" tabIndex={0} aria-label="Close" />
        <div className="modal-panel modal-panel-game" ref={gamePanelRef}>
          <button type="button" className="modal-close" aria-label="Close" onClick={closeModal}>
            ×
          </button>
          <GameModal isOpen={activeModal === "game"} panelRef={gamePanelRef} />
        </div>
      </div>
    </>
  );
}
