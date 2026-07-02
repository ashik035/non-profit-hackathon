import { useEffect, useRef, useState } from "react";

const DEFAULT_MS_PER_CHAR = 38;
const FINISH_MS_PER_CHAR = 24;

export interface UseSpeakingRevealOptions {
  instant?: boolean;
  enabled?: boolean;
  msPerChar?: number;
  onProgress?: () => void;
  onComplete?: () => void;
}

/**
 * Decouples streamed full text from what is shown on screen for a readable typewriter effect.
 */
export function useSpeakingReveal(
  fullText: string,
  isSpeaking: boolean,
  options: UseSpeakingRevealOptions = {},
): string {
  const {
    instant = false,
    enabled = true,
    msPerChar = DEFAULT_MS_PER_CHAR,
    onProgress,
    onComplete,
  } = options;
  const [revealed, setRevealed] = useState(instant ? fullText : "");
  const indexRef = useRef(instant ? fullText.length : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const fullTextRef = useRef(fullText);
  const isSpeakingRef = useRef(isSpeaking);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const enabledRef = useRef(enabled);

  fullTextRef.current = fullText;
  isSpeakingRef.current = isSpeaking;
  enabledRef.current = enabled;

  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
  }, [onProgress, onComplete]);

  useEffect(() => {
    completedRef.current = false;
  }, [fullText, instant, enabled]);

  useEffect(() => {
    if (instant) {
      indexRef.current = fullText.length;
      setRevealed(fullText);
      if (fullText.length > 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    if (fullText.length < indexRef.current) {
      indexRef.current = fullText.length;
      setRevealed(fullText);
    }
  }, [fullText, instant]);

  useEffect(() => {
    if (instant || !enabled) return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const maybeComplete = () => {
      const target = fullTextRef.current.length;
      if (
        !completedRef.current &&
        target > 0 &&
        indexRef.current >= target &&
        !isSpeakingRef.current
      ) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    const tick = () => {
      if (!enabledRef.current) {
        clearTimer();
        return;
      }

      const target = fullTextRef.current.length;
      if (indexRef.current >= target) {
        clearTimer();
        maybeComplete();
        return;
      }

      indexRef.current += 1;
      setRevealed(fullTextRef.current.slice(0, indexRef.current));
      onProgressRef.current?.();

      const delay = isSpeakingRef.current ? msPerChar : FINISH_MS_PER_CHAR;
      timerRef.current = setTimeout(tick, delay);
    };

    if (indexRef.current < fullText.length && !timerRef.current) {
      tick();
    } else {
      maybeComplete();
    }

    return clearTimer;
  }, [fullText, isSpeaking, instant, enabled, msPerChar]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (instant) return fullText;
  if (!enabled) return revealed;
  return revealed;
}
