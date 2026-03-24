import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, RankingEntry } from "@/types/game";

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async (): Promise<RankingEntry[]> => {
      const res = await fetch("/api/ranking");
      const json: ApiResponse<RankingEntry[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data ?? [];
    },
    refetchInterval: 30000,
  });
}
