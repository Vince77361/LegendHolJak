import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import type { MyRanking } from "@/types/game";

export async function GET() {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabaseAuth.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = getSupabase();

    // 전체 유저를 코인 내림차순으로 조회
    const { data, error } = await supabase
      .from("users")
      .select("auth_id, coins")
      .order("coins", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: "랭킹 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    const users = data ?? [];
    const totalUsers = users.length;
    const topCoins = users.length > 0 ? users[0].coins : 0;

    const myIndex = users.findIndex((u) => u.auth_id === authUser.id);
    const myRank = myIndex >= 0 ? myIndex + 1 : totalUsers;
    const myCoins = myIndex >= 0 ? users[myIndex].coins : 0;

    const ranking: MyRanking = { myRank, myCoins, topCoins, totalUsers };

    return NextResponse.json({ success: true, data: ranking });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
