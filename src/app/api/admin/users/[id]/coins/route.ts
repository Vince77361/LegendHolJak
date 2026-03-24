import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { coins } = await request.json();
  const { id } = await params;

  if (!coins || coins <= 0) {
    return NextResponse.json({ success: false, error: "유효하지 않은 코인 값입니다." }, { status: 400 });
  }

  const { data: user } = await supabase.from("users").select("coins").eq("id", id).single();
  if (!user) {
    return NextResponse.json({ success: false, error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  await supabase.from("users").update({ coins: user.coins + coins }).eq("id", id);

  return NextResponse.json({ success: true });
}
