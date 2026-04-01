"use client";

import { BetForm } from "@/components/game/bet-form";
import { ResultModal } from "@/components/game/result-modal";
import { usePlaceBet, useUserCoins } from "@/hooks/useGame";
import { useGameStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function HomePage() {
  const { data: userData } = useUserCoins();
  const placeBet = usePlaceBet();
  const userCoins = useGameStore((s) => s.userCoins);
  const lastResult = useGameStore((s) => s.lastResult);
  const clearLastResult = useGameStore((s) => s.clearLastResult);

  const handleBet = (guess: "odd" | "even", amount: number) => {
    placeBet.mutate(
      { guess, betAmount: amount },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-4">
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">베팅하기</h2>
          <p className="text-sm text-gray-400 mb-6">
            랜덤 숫자가 홀수인지 짝수인지 맞히면 코인을 획득합니다.
          </p>
          <BetForm
            onSubmit={handleBet}
            isLoading={placeBet.isPending}
            maxCoins={userCoins}
          />
        </div>
      </div>

      <ResultModal
        isOpen={lastResult !== null}
        onClose={clearLastResult}
        result={lastResult?.result ?? null}
        betAmount={lastResult?.amount ?? 0}
        secretNumber={lastResult?.secretNumber ?? 0}
      />
    </div>
  );
}
