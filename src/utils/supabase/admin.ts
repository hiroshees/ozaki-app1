import 'server-only';
import { createClient } from '@supabase/supabase-js';

// 書き込み用クライアント（secret key）。Server Actions など、サーバー側だけで使う
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY を設定してください',
    );
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
