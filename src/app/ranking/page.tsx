"use client";

import { RankingTable } from "@/components/ranking/ranking-table";
import { useRanking } from "@/hooks/useRanking";
import { useUserCoins } from "@/hooks/useGame";
import Link from "next/link";

export default function RankingPage() {
  const { data: rankings = [], isLoading } = useRanking();
  const { data: userData } = useUserCoins();
  const currentUserId = userData?.username ?? "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-gray-900">🏆 랭킹</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            게임으로 돌아가기
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-400 mb-4">상위 50명</p>
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              랭킹을 불러오는 중...
            </div>
          ) : (
            <RankingTable rankings={rankings} currentUserId={currentUserId} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-xl">🎲</span>
            <span className="text-xs font-medium">게임</span>
          </Link>
<Link
            href="/ranking"
            className="flex flex-col items-center gap-1 text-amber-500"
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs font-medium">랭킹</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
