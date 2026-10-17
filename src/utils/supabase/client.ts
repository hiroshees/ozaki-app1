import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ブラウザ・サーバー共通の読み取り用クライアント（anon key）。書き込みには使わない
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
