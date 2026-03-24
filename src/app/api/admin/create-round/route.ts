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

    const { secret_number } = await request.json();

    if (
      typeof secret_number !== "number" ||
      secret_number < 1 ||
      secret_number > 100 ||
      !Number.isInteger(secret_number)
    ) {
      return NextResponse.json(
        { success: false, error: "숫자는 1~100 사이의 정수여야 합니다." },
        { status: 400 },
      );
    }

    // Check for existing active round
    const { data: activeRound } = await supabase
      .from("game_rounds")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (activeRound) {
      return NextResponse.json(
        { success: false, error: "이미 활성 라운드가 존재합니다." },
        { status: 400 },
      );
    }

    const { data: round, error } = await supabase
      .from("game_rounds")
      .insert({ secret_number })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "라운드 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { round_id: round.id },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
