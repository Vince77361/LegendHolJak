"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoinDisplay } from "@/components/game/coin-display";
import { useGameStore } from "@/lib/store";
import { useUserCoins } from "@/hooks/useGame";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: userData } = useUserCoins();
  const userCoins = useGameStore((s) => s.userCoins);
  const username = userData?.username ?? "Player";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-black tracking-tight text-gray-900">
              🎲 홀짝
            </h1>
          </Link>
          <CoinDisplay coins={userCoins} username={username} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="border-t border-gray-200 bg-white px-4 py-3 sticky bottom-0">
        <div className="max-w-lg mx-auto flex justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === "/"
                ? "text-amber-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">🎲</span>
            <span className="text-xs font-medium">게임</span>
          </Link>
          <Link
            href="/ranking"
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === "/ranking"
                ? "text-amber-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs font-medium">랭킹</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
