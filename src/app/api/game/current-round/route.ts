import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("game_rounds")
      .select("id, is_active, created_at")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, error: "라운드 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data ?? null });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
