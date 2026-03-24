import { create } from "zustand";

interface GameStore {
  userCoins: number;
  setUserCoins: (coins: number) => void;
  lastResult: { result: "win" | "loss"; amount: number; secretNumber: number } | null;
  setLastResult: (result: { result: "win" | "loss"; amount: number; secretNumber: number }) => void;
  clearLastResult: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  userCoins: 100,
  setUserCoins: (coins) => set({ userCoins: coins }),
  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),
  clearLastResult: () => set({ lastResult: null }),
}));
