import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { RankingEntry } from "@/types/game";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, coins")
      .order("coins", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { success: false, error: "랭킹 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    const rankings: RankingEntry[] = (data ?? []).map((user, index) => ({
      username: user.username,
      coins: user.coins,
      rank: index + 1,
    }));

    return NextResponse.json({ success: true, data: rankings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
