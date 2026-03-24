"use client";

import { useEffect, useRef, useState } from "react";

interface CoinDisplayProps {
  coins: number;
  username: string;
}

export function CoinDisplay({ coins, username }: CoinDisplayProps) {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const prevCoins = useRef(coins);

  useEffect(() => {
    const prev = prevCoins.current;
    if (prev === coins) return;

    const diff = coins - prev;
    const steps = 20;
    const stepValue = diff / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current >= steps) {
        setDisplayCoins(coins);
        clearInterval(interval);
      } else {
        setDisplayCoins(Math.round(prev + stepValue * current));
      }
    }, 30);

    prevCoins.current = coins;
    return () => clearInterval(interval);
  }, [coins]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">{username}</span>
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-4 py-2">
        <span className="text-lg">🪙</span>
        <span className="text-lg font-bold tabular-nums text-amber-600">
          {displayCoins.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
