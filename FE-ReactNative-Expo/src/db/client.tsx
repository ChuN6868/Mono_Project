import React from 'react';
import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { runMigrations } from './migrations';
import { runSeeds } from './seeds';

/**
 * SQLite データベース名
 * 端末上に作成される実ファイルの名前
 */
const DATABASE_NAME = 'myapp.db';

/**
 * DB初期化処理（SQLiteProvider 側から1度だけ呼ばれる）
 *
 * 【ここで行うこと】
 *   1. PRAGMA設定（journal_mode=WAL, foreign_keys=ON）
 *   2. マイグレーション実行（未適用分のみ）
 *   3. 開発環境のみ初期データ投入
 *
 * 【なぜ PRAGMA を毎回設定するか】
 * SQLiteの一部PRAGMAは接続単位なので、毎回の起動で再設定が必要。
 * - journal_mode=WAL : 書き込み中も読み取り可能。並行性能が大幅向上
 * - foreign_keys=ON  : SQLiteはデフォルトOFF。外部キー制約を効かせる
 */
async function onInit(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  // マイグレーション（本番・開発の両方で実行）
  await runMigrations(db);

  // 開発時のみダミーデータ投入
  if (__DEV__) {
    await runSeeds(db);
  }
}

/**
 * アプリ全体をラップするProvider
 *
 * 【使い方】
 *   app/_layout.tsx で <DatabaseProvider> としてルートをラップする。
 *   children として何かが渡される前にDB初期化が完了している保証がある。
 */
export function DatabaseProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={onInit}>
      {children}
    </SQLiteProvider>
  );
}

/**
 * 任意のコンポーネントからDBインスタンスを取得するカスタムフック
 *
 * 【なぜこのフックを経由するか】
 * 直接 useSQLiteContext を使うと expo-sqlite への依存が
 * アプリ全体に散らばってしまう。
 * 本フック経由にすれば、将来DBライブラリを差し替える時に
 * ここ1か所の修正で済む（ファサードの効果）。
 */
export function useDatabase(): SQLiteDatabase {
  return useSQLiteContext();
}
