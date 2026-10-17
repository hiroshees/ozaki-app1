"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/hooks/auth/server";

// 新規登録処理を行うサーバーアクション関数
export async function sampleAction(data: any) {
  revalidatePath("/");
  // 結果を返す
  return {};
}
