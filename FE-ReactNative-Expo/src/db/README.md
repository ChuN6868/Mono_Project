# DB Layer

SQLite（expo-sqlite）を使ったデータアクセス層。

## ディレクトリ構成

```
src/db/
├── index.ts                  # 公開API（外部はここからしかimportしない）
├── client.tsx                # SQLiteProvider + useDatabase
├── errors.ts                 # 型付きエラー
├── transactions.ts           # 複数操作のトランザクションヘルパー
├── schema/                   # テーブル定義（DDL + 型 + mapper）
│   ├── index.ts
│   └── users.ts
├── migrations/               # 1マイグレーション = 1ファイル
│   ├── index.ts              # 実行ランナー
│   ├── types.ts
│   └── 001_create_users.ts
├── repositories/             # CRUD操作
│   ├── index.ts
│   └── userRepository.ts
└── seeds/                    # 開発用ダミーデータ（__DEV__時のみ）
    ├── index.ts
    └── users.seed.ts
```

## 新規テーブル追加手順

1. `schema/xxx.ts` を作成（DDL・Row型・Domain型・mapper）
2. `schema/index.ts` に `export * from './xxx';` 追記
3. `migrations/00N_create_xxx.ts` を作成（連番）
4. `migrations/index.ts` に import 追加 + MIGRATIONS 配列に追加
5. `repositories/xxxRepository.ts` を作成
6. `repositories/index.ts` に re-export 追加
7. （開発用初期データが必要なら）`seeds/xxx.seed.ts` 追加 + `seeds/index.ts` で呼び出し

## 禁止事項

- `src/db/index.ts` 以外を外部から直接importしない
- リリース済みのマイグレーションファイル（`00N_*.ts`）を編集しない
  - 修正したい場合は新しいマイグレーションを追加する
- Row型（`UserRow` 等）を `db/` の外で使わない
  - 外部に出すのは Domain型（`User`）のみ

## 処理フロー

外部からの入口は常に `index.ts`。そこから先で何が起きるかを2つのシナリオで追う。

### 起動時（DB初期化） — `_layout.tsx` 起点

アプリ起動時に**1回だけ**走る初期化処理。

| # | 経由ファイル | 何をするか |
|---|---|---|
| 1 | `app/_layout.tsx` | `<DatabaseProvider>` でルート全体をラップ |
| 2 | `src/db/index.ts` | `DatabaseProvider` を `client.tsx` から再export |
| 3 | `src/db/client.tsx` | `SQLiteProvider` が `myapp.db` を開く。開いた直後に `onInit(db)` を呼ぶ |
| 4 | `src/db/client.tsx`（onInit内） | `PRAGMA journal_mode = WAL` と `PRAGMA foreign_keys = ON` を設定 |
| 5 | `src/db/migrations/index.ts` | `PRAGMA user_version` で現在バージョン取得 → 未適用分を抽出 |
| 6 | `src/db/migrations/001_create_users.ts` | v1の `up(db)` を実行（=usersテーブル作成） |
| 7 | `src/db/schema/users.ts` | CREATE TABLE 文を提供 |
| 8 | `src/db/migrations/index.ts` | 成功したら `PRAGMA user_version = 1` を記録 |
| 9 | `src/db/seeds/index.ts` ※`__DEV__`時のみ | `seedUsers(db)` を呼ぶ |
| 10 | `src/db/seeds/users.seed.ts` | usersが0件なら Taro/Hanako/John を INSERT |

**ポイント**：5〜8は失敗時に MigrationError を投げる。9〜10は本番ビルドでは丸ごとスキップ。

---

### 画面表示時（データ取得） — `account.tsx` 起点

ユーザー一覧画面を開いた時に走るデータ取得処理。

| # | 経由ファイル | 何をするか |
|---|---|---|
| 1 | `app/(tabs)/account.tsx` | `useUserRepository()` を呼んで Repository を取得 |
| 2 | `src/db/index.ts` | `useUserRepository` を `repositories/` から再export |
| 3 | `src/db/repositories/userRepository.ts` | `useDatabase()` でDBインスタンスを取得 |
| 4 | `src/db/client.tsx` | `useSQLiteContext()` で Provider が保持しているDBを返す |
| 5 | `src/db/repositories/userRepository.ts` | `createUserRepository(db)` を `useMemo` でキャッシュして返す |
| 6 | `app/(tabs)/account.tsx` | `useEffect` 内で `await userRepository.findAll()` |
| 7 | `src/db/repositories/userRepository.ts` | `db.getAllAsync<UserRow>('SELECT * FROM users ...')` 実行 |
| 8 | `src/db/schema/users.ts` | `toUser()` で各行を Row（snake_case）→ Domain（camelCase, Date型）に変換 |
| 9 | `app/(tabs)/account.tsx` | `setUsers(data)` で state 更新 → FlatList が再描画 |

**ポイント**：4で取得するDBは、起動時に `<DatabaseProvider>` が開いたインスタンスと同一。Provider経由で共有されている。

---

### 役割の覚え方

| 場所 | 一言で言うと |
|---|---|
| `index.ts` | 外向けの窓口（外部はここしか見ない） |
| `client.tsx` | DBインスタンスの「持ち主」 |
| `schema/` | テーブルの真実の情報源（DDL + 型 + mapper） |
| `migrations/` | スキーマ進化の履歴 |
| `repositories/` | CRUD操作の窓口 |
| `seeds/` | 開発用ダミーデータ |
