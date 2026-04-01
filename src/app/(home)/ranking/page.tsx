"use client";

import { RankingTable } from "@/components/ranking/ranking-table";
import { useRanking } from "@/hooks/useRanking";
import { useUserCoins } from "@/hooks/useGame";

export default function RankingPage() {
  const { data: rankings = [], isLoading } = useRanking();
  const { data: userData } = useUserCoins();
  const currentUserId = userData?.username ?? "";

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-1">랭킹</h2>
        <p className="text-sm text-gray-400 mb-4">상위 50명</p>
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">랭킹을 불러오는 중...</div>
        ) : (
          <RankingTable rankings={rankings} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
