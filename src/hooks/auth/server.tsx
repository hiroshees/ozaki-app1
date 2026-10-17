import { redirect } from "next/navigation";
import type { AuthSignData } from "@/types/auth";
import {
  PAGE_AFTER_LOGIN,
  PAGE_SIGNIN,
  PAGE_ERROR,
  PAGE_AFTER_LOGOUT,
} from "@/config/data";
import { createClient } from "@/utils/supabase/server";

const HOST = process.env.HOST;

export async function getAuth() {
  // サーバーコンポーネント用接続
  const supabase = await createClient();
  // ユーザ取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証
  if (!user) {
    redirect(PAGE_SIGNIN);
  }

  // サインアウト関数
  const signOut = async () => {
    await supabase.auth.signOut();
    redirect(PAGE_AFTER_LOGOUT);
  };

  const userName = user?.user_metadata.full_name ?? "";
  const email = user?.email ?? user?.user_metadata.email;
  const avatarUrl = user?.user_metadata.avatar_url ?? "";

  return {
    user,
    userName,
    email,
    avatarUrl,
    signOut,
  };
}

export async function getAuthSign() {
  // サーバーコンポーネント用接続
  const supabase = await createClient();

  // ユーザ登録関数
  const signUp = async (data: AuthSignData) => {
    const { error } = await supabase.auth.signUp(data);
    return { error };
  };

  // サインイン関数
  const signIn = async (data: AuthSignData) => {
    const { error } = await supabase.auth.signInWithPassword(data);
    return { error };
  };

  // Google認証関数
  const signInWithOAuth = async () => {
    const {
      data: { url },
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://${HOST}/auth/callback?next=${PAGE_AFTER_LOGIN}`,
      },
    });
    if (error || !url) {
      redirect(PAGE_ERROR);
    }
    // ここはsupabaseのURLなので通常のリダイレクト
    redirect(url as string);
  };

  // パスワード更新関数
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    return { error };
  };

  // ユーザ名更新関数
  const updateUserName = async (fullName: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    return { error };
  };

  return {
    signUp,
    signIn,
    signInWithOAuth,
    updatePassword,
    updateUserName,
  };
}

export async function isAuth() {
  // サーバーコンポーネント用接続
  const supabase = await createClient();

  // 認証可否を判定する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? true : false;
}
