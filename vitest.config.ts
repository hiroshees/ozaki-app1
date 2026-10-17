import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Vercel のサーバー（UTC）と同じ条件で日付計算をテストする
process.env.TZ = 'UTC';

export default defineConfig({
  // tsconfig の jsx は preserve（Next.js 用）のため、テストでは自動変換する
  esbuild: { jsx: 'automatic' },
  resolve: {
    // tsconfig の paths（@/*）をテストでも解決する
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Vitest には react-server 条件が無く、import しただけで例外になるため差し替える
      'server-only': path.resolve(__dirname, 'src/test/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    // jsdom が必要なテストは、ファイル先頭の `@vitest-environment jsdom` で切り替える
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
