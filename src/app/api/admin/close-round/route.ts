import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { round_id } = await request.json();

    if (!round_id) {
      return NextResponse.json(
        { success: false, error: "라운드 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // Get round with secret_number
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("id, secret_number, is_active")
      .eq("id", round_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { success: false, error: "라운드를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!round.is_active) {
      return NextResponse.json(
        { success: false, error: "이미 종료된 라운드입니다." },
        { status: 400 },
      );
    }

    const isOdd = round.secret_number % 2 !== 0;

    // Get all pending bets for this round
    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select("id, user_id, bet_amount")
      .eq("round_id", round_id)
      .eq("result", "pending");

    if (betsError) {
      return NextResponse.json(
        { success: false, error: "베팅 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    let winners = 0;
    let losers = 0;

    for (const bet of bets ?? []) {
      if (isOdd) {
        // Win: refund bet_amount * 2 (since already deducted)
        const { data: user } = await supabase
          .from("users")
          .select("coins")
          .eq("id", bet.user_id)
          .single();

        if (user) {
          await supabase
            .from("users")
            .update({ coins: user.coins + bet.bet_amount * 2 })
            .eq("id", bet.user_id);
        }

        await supabase.from("bets").update({ result: "win" }).eq("id", bet.id);

        winners++;
      } else {
        // Loss: coins already deducted, just update result
        await supabase.from("bets").update({ result: "loss" }).eq("id", bet.id);

        losers++;
      }
    }

    // Close the round
    await supabase
      .from("game_rounds")
      .update({ is_active: false, closed_at: new Date().toISOString() })
      .eq("id", round_id);

    return NextResponse.json({
      success: true,
      data: { winners, losers },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
