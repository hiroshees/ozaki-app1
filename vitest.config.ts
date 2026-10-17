import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Vercel のサーバー（UTC）と同じ条件で日付計算をテストする
process.env.TZ = 'UTC';

export default defineConfig({
  resolve: {
    // tsconfig の paths（@/*）をテストでも解決する
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
