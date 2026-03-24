"use client";

interface RoundStatusProps {
  isActive: boolean;
  roundId: string | null;
}

export function RoundStatus({ isActive, roundId }: RoundStatusProps) {
  if (!isActive || !roundId) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="h-3 w-3 rounded-full bg-gray-300" />
        <span className="text-sm font-medium">대기 중...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-emerald-400">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
      </span>
      <span className="text-sm font-medium">게임 진행 중</span>
    </div>
  );
}
