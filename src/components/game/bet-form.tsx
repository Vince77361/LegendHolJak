"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface BetFormProps {
  onSubmit: (guess: "odd" | "even", betAmount: number) => void;
  isLoading: boolean;
  maxCoins: number;
}

export function BetForm({ onSubmit, isLoading, maxCoins }: BetFormProps) {
  const [guess, setGuess] = useState<"odd" | "even" | null>(null);
  const [betAmount, setBetAmount] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess || betAmount < 1 || betAmount > maxCoins) return;
    onSubmit(guess, betAmount);
    setGuess(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setBetAmount(Math.min(Math.max(1, value), maxCoins));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 홀/짝 선택 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">홀수 / 짝수 선택</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGuess("odd")}
            disabled={isLoading}
            className={`rounded-2xl py-6 text-xl font-black transition-all ${
              guess === "odd"
                ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-gray-200"
            }`}
          >
            홀수
            <span className="block text-sm font-normal mt-1 opacity-70">1, 3, 5 ...</span>
          </button>
          <button
            type="button"
            onClick={() => setGuess("even")}
            disabled={isLoading}
            className={`rounded-2xl py-6 text-xl font-black transition-all ${
              guess === "even"
                ? "bg-blue-500 text-white shadow-md scale-[1.02]"
                : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
            }`}
          >
            짝수
            <span className="block text-sm font-normal mt-1 opacity-70">2, 4, 6 ...</span>
          </button>
        </div>
      </div>

      {/* 베팅 금액 */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">베팅 금액</p>
        <Input
          type="number"
          min={1}
          max={maxCoins}
          value={betAmount}
          onChange={handleAmountChange}
          className="text-center text-2xl font-bold h-14"
          disabled={isLoading}
        />
        <Slider
          value={[betAmount]}
          onValueChange={(v) => setBetAmount(Array.isArray(v) ? v[0] : v)}
          min={1}
          max={Math.max(1, maxCoins)}
          step={1}
          disabled={isLoading}
          className="py-2"
        />
        <div className="flex gap-2">
          {[10, 25, 50, 100].map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setBetAmount(Math.min(preset, maxCoins))}
              disabled={isLoading}
            >
              {preset}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setBetAmount(maxCoins)}
            disabled={isLoading}
          >
            전부
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className={`w-full h-14 text-lg font-bold transition-all ${
          guess
            ? guess === "odd"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        disabled={isLoading || !guess || maxCoins < 1}
      >
        {isLoading
          ? "결과 확인 중..."
          : guess
            ? `${guess === "odd" ? "홀수" : "짝수"}에 ${betAmount} 코인 베팅`
            : "홀수 또는 짝수를 선택하세요"}
      </Button>
    </form>
  );
}
