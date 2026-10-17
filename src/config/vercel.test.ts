import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// vercel.json の buildCommand が、環境ごとに正しいコマンドを実行することを確認する
// 本物の yarn の代わりに、引数を表示するだけの偽物を使う（マイグレーションは実行しない）
const { buildCommand } = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8'),
) as { buildCommand: string };

const run = (vercelEnv: string | undefined) => {
  const bin = mkdtempSync(path.join(tmpdir(), 'fake-yarn-'));
  const fake = path.join(bin, 'yarn');
  writeFileSync(fake, '#!/bin/sh\necho "yarn $@"\n');
  chmodSync(fake, 0o755);
  const env: Record<string, string | undefined> = {
    PATH: `${bin}:/usr/bin:/bin`,
  };
  if (vercelEnv !== undefined) env.VERCEL_ENV = vercelEnv;
  return execFileSync('sh', ['-c', buildCommand], {
    env: env as NodeJS.ProcessEnv,
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
};

describe('vercel.json の buildCommand', () => {
  it('本番では vercel-build（prisma generate → migrate deploy → next build）を実行する', () => {
    expect(run('production')).toEqual(['yarn run vercel-build']);
  });

  it('プレビューでは migrate deploy を実行せず、generate と build だけ', () => {
    const commands = run('preview');
    expect(commands).toEqual(['yarn prisma generate', 'yarn next build']);
    expect(commands.join(' ')).not.toContain('migrate');
  });

  it('VERCEL_ENV が無い（ローカルなど）場合も migrate deploy を実行しない', () => {
    expect(run(undefined).join(' ')).not.toContain('migrate');
    expect(run('development').join(' ')).not.toContain('migrate');
  });

  it('vercel-build スクリプトは migrate deploy を含む（本番でだけ使われる）', () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'),
    );
    expect(pkg.scripts['vercel-build']).toBe(
      'prisma generate && prisma migrate deploy && next build',
    );
  });
});
