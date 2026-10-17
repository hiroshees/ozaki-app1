import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { PAGE_AFTER_LOGIN, MAIL_ERROR } from "@/config/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? PAGE_AFTER_LOGIN;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // 成功、ダッシュボードへ移動
      redirect(next);
    }
  }
  // エラー
  redirect(MAIL_ERROR);
}
