import { afterEach, describe, expect, it, vi } from 'vitest';

// server-only は Vitest（react-server 条件なし）では import 時に例外になるため無効化する
vi.mock('server-only', () => ({}));

import { createAdminClient } from '@/utils/supabase/admin';

describe('createAdminClient', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('SUPABASE_SECRET_KEY が無ければ例外を投げる', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    expect(() => createAdminClient()).toThrow('SUPABASE_SECRET_KEY');
  });

  it('環境変数が揃っていればクライアントを返す', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'dummy-secret');
    expect(createAdminClient().from).toBeTypeOf('function');
  });
});
