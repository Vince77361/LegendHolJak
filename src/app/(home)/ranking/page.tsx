"use client";

import { useRanking } from "@/hooks/useRanking";

export default function RankingPage() {
  const { data: ranking, isLoading } = useRanking();

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-1">랭킹</h2>
        <p className="text-sm text-gray-400 mb-6">내 순위를 확인하세요</p>

        {isLoading || !ranking ? (
          <div className="text-center py-12 text-gray-400">
            랭킹을 불러오는 중...
          </div>
        ) : (
          <div className="space-y-4">
            {/* 내 순위 카드 */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <p className="text-sm text-amber-600 font-medium mb-2">내 순위</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600">
                  {ranking.myRank}
                </span>
                <span className="text-sm text-gray-400">
                  / {ranking.totalUsers}명
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                내 코인:{" "}
                <span className="font-bold text-amber-600">
                  🪙 {ranking.myCoins.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 1등 코인 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-2">
                🥇 1등 코인
              </p>
              <span className="text-2xl font-bold text-amber-600">
                🪙 {ranking.topCoins.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
