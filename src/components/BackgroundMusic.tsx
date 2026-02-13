"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const SONGS = {
  lobby: "/song/lobbysong.mp3",
  bouquet: "/song/so easy-Sung Holly.mp3",
} as const;

type SongId = keyof typeof SONGS;

interface BackgroundMusicProps {
  /** "lobby" = lobbysong, "bouquet" = so easy */
  song?: SongId;
  /** Try to autoplay when the component mounts (used on bouquet page) */
  autoPlayOnMount?: boolean;
}

export default function BackgroundMusic({
  song = "lobby",
  autoPlayOnMount = false,
}: BackgroundMusicProps) {
  const src = SONGS[song];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const hasStartedRef = useRef(false);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.play().catch(() => {});
      setIsMuted(false);
    } else {
      audio.pause();
      setIsMuted(true);
    }
  }, [isMuted]);

  // Try to autoplay on mount when allowed (e.g. navigation from a user gesture)
  useEffect(() => {
    if (!autoPlayOnMount) return;
    const audio = audioRef.current;
    if (!audio || hasStartedRef.current) return;

    audio
      .play()
      .then(() => {
        hasStartedRef.current = true;
        setIsMuted(false);
      })
      .catch(() => {
        // If autoplay is blocked, fall back to waiting for user interaction below
      });
  }, [autoPlayOnMount, src]);

  // Start playing on first user interaction (browser autoplay policy)
  useEffect(() => {
    const startOnInteraction = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      const audio = audioRef.current;
      if (audio && isMuted) {
        audio.play().then(() => setIsMuted(false)).catch(() => {});
      }
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    };
    document.addEventListener("click", startOnInteraction, { once: true });
    document.addEventListener("keydown", startOnInteraction, { once: true });
    document.addEventListener("touchstart", startOnInteraction, { once: true });
    return () => {
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    };
  }, [isMuted]);

  return (
    <>
      <audio
        key={src}
        ref={(el) => {
          audioRef.current = el;
          if (el) {
            el.loop = true;
            el.volume = 0.5;
          }
        }}
        src={src}
        preload="metadata"
        aria-label="Background music"
      />
      <button
        type="button"
        className="music-toggle"
        onClick={toggleMute}
        aria-label={isMuted ? "เปิดเพลง" : "ปิดเพลง"}
        title={isMuted ? "เปิดเพลง" : "ปิดเพลง"}
      >
        <span className="music-toggle-icon" aria-hidden="true">
          {isMuted ? "🔇" : "🔊"}
        </span>
      </button>
    </>
  );
}
