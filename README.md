# NextJSアプリ作成
## アプリ作成

## 対象
JavaScript+ゲーム開発コース修了  
JavaScript発展レベル4修了  
Reactレベル1基礎修了  
Reactレベル2基礎修了  
Reactレベル3基礎修了  
Reactレベル4基礎修了  
Reactレベル5基礎修了  
Reactレベル6基礎修了  
Reactレベル7基礎修了  
Reactアプリ1修了  
Reactアプリ2修了  
Reactアプリ3修了  
Reactアプリ4修了  
Reactアプリ製作修了  
TypeScriptレベル1基礎修了  
TypeScriptレベル2基礎修了  
TypeScriptレベル3基礎修了  
NextJSレベル1型注釈修了  
NextJSレベル2ルーティング基礎修了  
NextJSレベル3その他ルーティング基礎修了  
NextJSレベル4レンダリング修了  
NextJSレベル5通信処理修了  
NextJSレベル6フォーム処理修了  
NextJSレベル7データベース処理修了  
NextJSレベル8Tailwindの利用修了  
NextJSレベル9アプリ作成課題修了  
NextJSアプリ読書アプリ修了  
NextJSアプリ動画アプリ修了  


## 想定学習時間
21時間程度  

## 前提
* JavaScript+ゲーム開発コース修了
* JavaScriptレベル1
* JavaScriptレベル2
* JavaScriptレベル3
* JavaScriptレベル4
* オリジナルゲームゲーム開発
* JavaScriptES2015
* JavaScriptオブジェクト
* JavaScriptレベル5
* JavaScriptレベル6
* オリジナルゲームゲーム開発
* JavaScript発展レベル1
* JavaScript発展レベル2
* JavaScript発展レベル3
* JavaScript発展レベル4
* Reactレベル1
* Reactレベル2
* Reactレベル3
* Reactレベル4
* Reactレベル5
* Reactレベル6
* Reactレベル7
* Reactアプリ作成1
* Reactアプリ作成2
* Reactアプリ作成3
* Reactアプリ作成4
* Reactアプリ製作
* TypeScriptレベル1
* TypeScriptレベル2
* TypeScriptレベル3
* NextJSレベル1
* NextJSレベル2
* NextJSレベル3
* NextJSレベル4
* NextJSレベル5
* NextJSレベル6
* NextJSレベル7
* NextJSレベル8
* NextJSレベル9
* NextJS読書アプリ作成
* NextJS動画アプリ作成

## 目標
* NextJSを利用したアプリケーションの作成


---

# 共有カレンダー: デプロイ（Vercel）

仕様は `docs/SPEC.md`、計画は `docs/PLAN.md`、作業の単位は GitHub Issue。デプロイの確認項目は Issue #49 にまとめている。

## 環境変数

値はリポジトリに書かない。Vercel の Project Settings → Environment Variables に設定する（ローカルは `.env.local`）。

| 名前 | 用途 | ブラウザに渡るか | Production | Preview |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase のプロジェクト URL | 渡る | 必須 | 任意（下記） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 読み取り用キー（RLS で SELECT のみ許可） | 渡る | 必須 | 任意（下記） |
| `SUPABASE_SECRET_KEY` | 書き込み用キー（Server Actions） | **渡らない**（`NEXT_PUBLIC_` を付けない。Sensitive に設定） | 必須 | 設定しないのを推奨（下記） |
| `DATABASE_URL` | Prisma の接続（プーラー） | 渡らない | 必須 | 不要 |
| `DIRECT_URL` | Prisma の直接接続（`migrate deploy` 用） | 渡らない | 必須 | 不要 |

## ビルドの仕組み（`vercel.json`）

`buildCommand` は環境で切り替わる。

- **Production**: `yarn run vercel-build`（`prisma generate && prisma migrate deploy && next build`）。**デプロイのたびに、未適用のマイグレーションが本番 DB に適用される**
- **Preview（ブランチ・PR）**: `prisma generate && next build`。**`migrate deploy` は実行しない**。`prisma generate` は DB に接続しないため、`DATABASE_URL` / `DIRECT_URL` は不要

理由: このプロジェクトは開発用と本番用で DB が同じため、プレビューのたびにマイグレーションが走ると、マージ前の変更が本番 DB に反映されてしまう。

### Preview の扱い

Preview も同じ Supabase の DB につながる（データを共有する）。

- `SUPABASE_SECRET_KEY` を Preview に設定しなければ、プレビューは**読み取り専用**になる（書き込みの Server Action は失敗する）。本番データを誤って書き換えないために推奨
- プレビューで作成・編集・削除も確認したい場合だけ、`SUPABASE_SECRET_KEY` を Preview にも設定する。確認で作ったデータは削除する

## 初回のデプロイ手順

1. Vercel で New Project → このリポジトリを選択（Framework Preset: Next.js。`yarn.lock` から yarn が選ばれる）
2. 上の表のとおり環境変数を設定する
3. Project Settings → Functions → Function Region を、DB（`ap-southeast-2`、シドニー）に近いリージョンにする。既定の `iad1`（米国東部）は DB から遠い。利用者が日本なら東京（`hnd1`）、DB との距離を優先するならシドニー（`syd1`）
4. Project Settings → Deployment Protection で、**Production がログイン不要で開ける**ことを確認する（このアプリはログインなしで誰でも使う前提）
5. Deploy。成功したら、Issue #49 の確認項目を本番 URL で確認する

## マイグレーションを追加するとき

- マイグレーションは Production のデプロイ時に自動で適用される。**追加する PR の本文に、本番 DB に反映される旨を書く**
- 適用前に内容（`src/db/prisma/migrations/*/migration.sql`）を確認する。取り消せない変更（列の削除など）は特に注意する
- 手動で適用したい場合は `yarn dotenv -e .env.local -- yarn prisma migrate deploy`（接続先が意図した DB か `prisma migrate status` で先に確認する）

## ロールバック

Vercel の Deployments から以前のデプロイを Instant Rollback できる。**ただし DB のマイグレーションは戻らない**。DB を戻す必要がある場合は、別途マイグレーションで戻す。
