import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, coins")
      .eq("clerk_id", userId)
      .single();

    if (!error && user) {
      return NextResponse.json({ success: true, data: user });
    }

    // 유저가 없으면 Clerk 정보로 자동 생성
    const clerkUser = await currentUser();
    const username =
      clerkUser?.username ||
      clerkUser?.firstName ||
      clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "익명";

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ clerk_id: userId, username, coins: 100 })
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
