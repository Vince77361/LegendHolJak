"use client";

import { CoinDisplay } from "@/components/game/coin-display";
import { BetForm } from "@/components/game/bet-form";
import { ResultModal } from "@/components/game/result-modal";
import { usePlaceBet, useUserCoins } from "@/hooks/useGame";
import { useGameStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";

export default function HomePage() {
  const { data: userData } = useUserCoins();
  const placeBet = usePlaceBet();

  const userCoins = useGameStore((s) => s.userCoins);
  const lastResult = useGameStore((s) => s.lastResult);
  const clearLastResult = useGameStore((s) => s.clearLastResult);

  const username = userData?.username ?? "Player";

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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-gray-900">
            🎲 홀짝
          </h1>
          <CoinDisplay coins={userCoins} username={username} />
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
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
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-amber-500"
          >
            <span className="text-xl">🎲</span>
            <span className="text-xs font-medium">게임</span>
          </Link>
<Link
            href="/ranking"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs font-medium">랭킹</span>
          </Link>
        </div>
      </nav>

      {/* Result Modal */}
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
