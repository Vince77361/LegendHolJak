"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/game";

interface UserEntry {
  id: string;
  username: string;
  coins: number;
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [searchUsername, setSearchUsername] = useState("");
  const [coinsToAdd, setCoinsToAdd] = useState(100);

  const { data: users, isLoading } = useQuery<UserEntry[]>({
    queryKey: ["adminUsers", searchUsername],
    queryFn: async () => {
      const params = searchUsername ? `?username=${encodeURIComponent(searchUsername)}` : "";
      const res = await fetch(`/api/admin/users${params}`);
      const json: ApiResponse<UserEntry[]> = await res.json();
      return json.data ?? [];
    },
  });

  const giveCoins = useMutation({
    mutationFn: async ({ userId, coins }: { userId: string; coins: number }) => {
      const res = await fetch(`/api/admin/users/${userId}/coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins }),
      });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      toast.success(`${coinsToAdd} 코인이 지급되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-black tracking-tight">⚙️ 어드민 패널</h1>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">

          {/* 코인 지급 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">🪙 코인 수동 지급</h2>
            <div className="flex gap-2">
              <Input
                placeholder="유저명 검색"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                value={coinsToAdd}
                onChange={(e) => setCoinsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">불러오는 중...</p>
            ) : users && users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">🪙 {user.coins.toLocaleString()} 코인</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                      onClick={() => giveCoins.mutate({ userId: user.id, coins: coinsToAdd })}
                      disabled={giveCoins.isPending}
                    >
                      +{coinsToAdd} 지급
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {searchUsername ? "검색 결과가 없습니다." : "유저명을 검색하세요."}
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
