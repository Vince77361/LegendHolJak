import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

async function getOrCreateUser(authId: string, email?: string) {
  const supabase = getSupabase();
  const { data: user } = await supabase
    .from("users")
    .select("id, coins")
    .eq("auth_id", authId)
    .single();

  if (user) return user;

  const username = email?.split("@")[0] || "익명";

  const { data: newUser } = await supabase
    .from("users")
    .insert({ auth_id: authId, username, coins: 100 })
    .select("id, coins")
    .single();

  return newUser;
}

export async function POST(request: NextRequest) {
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

    const { guess, bet_amount } = await request.json();

    if (!guess || !["odd", "even"].includes(guess) || !bet_amount || bet_amount <= 0) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 요청입니다." },
        { status: 400 },
      );
    }

    const user = await getOrCreateUser(authUser.id, authUser.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자 처리에 실패했습니다." },
        { status: 500 },
      );
    }

    if (user.coins < bet_amount) {
      return NextResponse.json(
        { success: false, error: "코인이 부족합니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const secret_number = Math.floor(Math.random() * 100) + 1;
    const isOdd = secret_number % 2 !== 0;
    const result =
      (guess === "odd" && isOdd) || (guess === "even" && !isOdd) ? "win" : "loss";
    const newCoins =
      result === "win"
        ? user.coins + bet_amount
        : Math.max(0, user.coins - bet_amount);

    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "코인 업데이트에 실패했습니다." },
        { status: 500 },
      );
    }

    await supabase.from("bets").insert({
      user_id: user.id,
      bet_amount,
      guess,
      secret_number,
      result,
    });

    return NextResponse.json({
      success: true,
      data: { secret_number, result, remaining_coins: newCoins },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
