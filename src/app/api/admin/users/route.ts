import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabaseAuth.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("username");
  const supabase = getSupabase();

  let query = supabase.from("users").select("id, username, coins").order("coins", { ascending: false });
  if (username) query = query.ilike("username", `%${username}%`);

  const { data, error } = await query.limit(20);

  if (error) {
    return NextResponse.json({ success: false, error: "조회 실패" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
