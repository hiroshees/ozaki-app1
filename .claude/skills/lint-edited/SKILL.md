---
name: lint-edited
description: ファイルの編集が一区切りついた後、編集したファイルだけに ESLint と Prettier を実行して問題を直す。コードを Edit/Write で変更し終えたとき、コミットやレビュー依頼の前に使う。
---

# 編集したファイルに Linter を実行する

編集が終わったら、**変更したファイルだけ**に Linter をかける（全体の `pnpm lint` は重いので使わない）。

## 手順

1. 対象ファイルを集める（未コミットの変更 + 未追跡。削除済みは除く）
   ```bash
   git diff --name-only --diff-filter=d HEAD; git ls-files --others --exclude-standard
   ```
   - 会話中に自分が編集したファイルが分かっていれば、それを優先してよい
   - `.claude/`、`node_modules/`、`.next/` 配下は除外する
2. 拡張子で振り分けて実行する（パッケージマネージャーは `pnpm`）
   - `*.{js,jsx,ts,tsx,mjs}`: `pnpm exec eslint --fix <files>` → `pnpm exec prettier --write <files>`
   - `*.{json,css,md}`: `pnpm exec prettier --write <files>`
   - 対象が無い種類は実行しない
3. `--fix` で直らなかった ESLint の指摘は、ファイルを読んで手動で修正し、手順 2 をやり直す
   - ルールを無効化する `eslint-disable` で逃げない。やむを得ない場合はユーザーに確認する
4. `.ts` / `.tsx` を変更していたら、型エラーも確認する: `pnpm typecheck`

## 報告

- 実行したファイル数と、自動修正された内容（あれば）を 1〜2 行で伝える
- 直せなかった指摘が残る場合は、ファイル・行・ルール名を示す
- 全て通ったら「Lint 問題なし」と簡潔に伝える

## 注意

- 自動修正でユーザーが意図していない無関係なファイルの差分を増やさない（対象は変更済みファイルのみ）
- 新しい依存パッケージは追加しない（プロジェクトの eslint / prettier を使う）
