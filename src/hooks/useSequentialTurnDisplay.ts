import { useCallback, useEffect, useState } from "react";

export type TurnDisplayMode = "waiting" | "revealing" | "complete";

export function useSequentialTurnDisplay(turnCount: number, resetKey: string) {
  const [activeDisplayIndex, setActiveDisplayIndex] = useState(0);

  useEffect(() => {
    setActiveDisplayIndex(0);
  }, [resetKey]);

  const getTurnDisplayMode = useCallback(
    (index: number): TurnDisplayMode => {
      if (turnCount === 0) return "waiting";
      if (index < activeDisplayIndex) return "complete";
      if (index === activeDisplayIndex) return "revealing";
      return "waiting";
    },
    [activeDisplayIndex, turnCount],
  );

  const onTurnRevealComplete = useCallback(
    (index: number) => {
      if (index === activeDisplayIndex) {
        setActiveDisplayIndex((prev) => prev + 1);
      }
    },
    [activeDisplayIndex],
  );

  const allTurnsRevealed = turnCount > 0 && activeDisplayIndex >= turnCount;

  return {
    activeDisplayIndex,
    getTurnDisplayMode,
    onTurnRevealComplete,
    allTurnsRevealed,
  };
}
