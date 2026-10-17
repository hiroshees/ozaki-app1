# 共有カレンダー（学習用）

Next.js（App Router）+ TypeScript + Supabase + Prisma で作る、Googleカレンダー風の共有カレンダー。
仕様は `docs/SPEC.md`、実装計画と進捗は `docs/PLAN.md`。作業前に両方を読むこと。

## コマンド
- 開発サーバー: `yarn run dev`
- テスト: `yarn run test`（Vitest）（未決）
- 型チェック: `yarn tsx --noEmit`　（未決）
- lint: `yarn run lint`

## アーキテクチャの決まりごと
- フォルダ構造は既存の構造を解釈して、それに従うこと
- 

### データアクセス
- Supabase の接続設定は既にある。新しく作り直さず、既存のクライアント設定を確認して使う
- **書き込み（作成・更新・削除）はすべて Server Actions 経由**。サーバー専用のシークレットキーを使う
- ブラウザからは読み取り（SELECT）と 書き込み（INSERT、UPDATE、DELETE）を利用する。管理画面は利用しない。
- シークレットキー（`SUPABASE_SECRET_KEY`）を `NEXT_PUBLIC_` 付きの変数にしない。クライアントコンポーネントから import しない
- Server Actions の入力は必ず zod で検証する
- Prismaのスキーマファイルは以下に配置 `src/db/prisma/schema.prisma`
- 予定の取得は、表示範囲と重なるものだけを取る: `starts_at < 範囲の終わり AND ends_at > 範囲の始まり`
- DB の変更はマイグレーションファイルとして追加する。ダッシュボードで直接変更しない
- ログインがないので `@supabase/ssr` は使わない

### 日付・タイムゾーン
- DB の日時は `timestamptz`（UTC で保存）
- 表示・日付の区切りは常に `Asia/Tokyo` 基準。`date-fns` と `@date-fns/tz` の `TZDate` を使う
- **Vercel のサーバーは UTC で動く**。`new Date()` の `getDate()` や `getHours()` をそのまま使わない（日付がずれ、ハイドレーションエラーの原因になる）
- 終日予定は、開始をその日の 00:00（JST）、終了を最終日の翌日 00:00（JST）で保存する（終了は含まない）
- 日付計算・予定の重なり計算は `src/lib/calendar/` に純粋関数として置き、UI に書かない

### ディレクトリ
- `src/lib/calendar/` 日付グリッド・予定レイアウトの計算（純粋関数）
- `src/lib/events/` 予定の型、zod スキーマ、取得関数、Server Actions
- `src/components/calendar/` カレンダーの UI
- 表示状態（view, date）は URL の searchParams に持つ

## コーディング規約
- named export を使い、default export はページ・レイアウトなど Next.js が要求する所だけ
- `any` は使わない
- `src/lib/` の関数には Vitest のテストを書く。テストは仕様の受け入れ条件から先に作る
- 新しい依存パッケージは、追加前に理由とともに確認を取る

## 作業の進め方
- 作業の単位は GitHub Issue。着手前に `gh issue view <番号>` で内容と受け入れ条件を読む
- 1 Issue = 1 ブランチ（`issue-<番号>-<短い説明>`）= 1 PR。Issue の範囲外の変更はしない
- 範囲外で直すべきものを見つけたら、勝手に直さず新しい Issue の作成を提案する
- PR の前に lint・型チェック・テストを通す。PR 本文には `Closes #<番号>`、変更内容、ブラウザでの確認手順を書く
- PR のマージは前に人間にやっていいかを確認する
- Issue を作るときは `.github/ISSUE_TEMPLATE/task.md` の形式に従い、`phase-N` ラベルを付ける。作ったら `docs/PLAN.md` の `#?` を番号に置き換える
- 本番 DB に影響する操作（`supabase db push` など）は実行せず、コマンドを提示するだけにする
