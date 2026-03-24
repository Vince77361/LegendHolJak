import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameStore } from "@/lib/store";
import type { ApiResponse, BetResult } from "@/types/game";

export function useUserCoins() {
  const setUserCoins = useGameStore((s) => s.setUserCoins);

  return useQuery({
    queryKey: ["userCoins"],
    queryFn: async (): Promise<{ id: string; username: string; coins: number }> => {
      const res = await fetch("/api/user");
      const json: ApiResponse<{ id: string; username: string; coins: number }> =
        await res.json();
      if (!json.success) throw new Error(json.error);
      const data = json.data!;
      setUserCoins(data.coins);
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();
  const setUserCoins = useGameStore((s) => s.setUserCoins);
  const setLastResult = useGameStore((s) => s.setLastResult);

  return useMutation({
    mutationFn: async ({
      guess,
      betAmount,
    }: {
      guess: "odd" | "even";
      betAmount: number;
    }): Promise<BetResult> => {
      const res = await fetch("/api/game/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess, bet_amount: betAmount }),
      });
      const json: ApiResponse<BetResult> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data!;
    },
    onSuccess: (data, variables) => {
      setUserCoins(data.remaining_coins);
      setLastResult({
        result: data.result,
        amount: variables.betAmount,
        secretNumber: data.secret_number,
      });
      queryClient.invalidateQueries({ queryKey: ["userCoins"] });
    },
  });
}
