import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // 認証コードが取得できない
    return NextResponse.redirect(`${origin}/auth/error?e=code-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  const next = searchParams.get("next")
    ? searchParams.get("next")
    : error
      ? "/auth/error?e=exchange-code-error"
      : "/";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  // ローカル、かつリバースプロキシなら
  if (isLocalEnv && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  if (isLocalEnv) {
    // ローカルの場合
    return NextResponse.redirect(`${origin}${next}`);
  } else if (forwardedHost) {
    // リバースプロキシの場合
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    return NextResponse.redirect(`${origin}${next}`);
  }
}
