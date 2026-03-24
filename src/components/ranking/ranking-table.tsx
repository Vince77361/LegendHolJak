"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingEntry } from "@/types/game";

interface RankingTableProps {
  rankings: RankingEntry[];
  currentUserId?: string;
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

export function RankingTable({ rankings, currentUserId }: RankingTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-16 text-center text-gray-500">순위</TableHead>
            <TableHead className="text-gray-500">유저</TableHead>
            <TableHead className="text-right text-gray-500">코인</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((entry) => {
            const isMe = currentUserId === entry.username;
            return (
              <TableRow
                key={entry.rank}
                className={`border-gray-100 ${
                  isMe
                    ? "bg-amber-50 hover:bg-amber-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <TableCell className="text-center text-lg font-bold">
                  {getMedal(entry.rank)}
                </TableCell>
                <TableCell
                  className={`font-medium ${isMe ? "text-amber-600" : "text-gray-800"}`}
                >
                  {entry.username}
                  {isMe && (
                    <span className="ml-2 text-xs text-amber-500">(나)</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="text-amber-600 font-bold">
                    🪙 {entry.coins.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
          {rankings.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                아직 랭킹 데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
