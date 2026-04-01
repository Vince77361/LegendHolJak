import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

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
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, coins")
      .eq("auth_id", authUser.id)
      .single();

    if (!error && user) {
      return NextResponse.json({ success: true, data: user });
    }

    // 유저가 없으면 Supabase Auth 정보로 자동 생성
    let username =
      authUser.user_metadata?.username ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "익명";

    // admin 이름 차단
    if (username.trim().toLowerCase() === "admin") {
      username = "익명";
    }

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ auth_id: authUser.id, username, coins: 100 })
      .select("id, username, coins")
      .single();

    if (createError || !newUser) {
      return NextResponse.json(
        { success: false, error: "사용자 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 },
    );
  }
}
