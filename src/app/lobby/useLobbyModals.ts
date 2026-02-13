"use client";

import { useCallback, useEffect } from "react";

export type ModalId = "letter" | "photobooth" | "game" | null;

const PICK_SOUND = "/song/pick.mp3";

function playClickSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // ignore
  }
}

/** เล่นเสียงเอฟเฟกต์เมื่อกดเข้า host (letter / photobooth / game) */
function playPickSound() {
  try {
    const audio = new Audio(PICK_SOUND);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function useLobbyModals(activeModal: ModalId, setActiveModal: (id: ModalId) => void) {
  const openModal = useCallback(
    (id: "letter" | "photobooth" | "game") => {
      setActiveModal(id);
      document.body.style.overflow = "hidden";
      playPickSound();
    },
    [setActiveModal]
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    document.body.style.overflow = "";
    playClickSound();
  }, [setActiveModal]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeModal]);

  useEffect(() => {
    if (!activeModal) return;
    const cleanup = () => {
      document.body.style.overflow = "";
    };
    return cleanup;
  }, [activeModal]);

  return { openModal, closeModal };
}
