import type { SQLiteDatabase } from 'expo-sqlite';
import { MigrationError } from '../errors';
import m001 from './001_create_users';
import m002 from './002_create_category_mst';
import m003 from './003_create_emergency_foods';

/**
 * マイグレーション登録リスト
 *
 * 【新規マイグレーション追加手順】
 *   1. ./00N_xxx.ts ファイルを作成
 *   2. 下記の import 文を追加
 *   3. MIGRATIONS 配列に追加
 *
 * sort() を入れているので、配列順序を間違えても version 昇順で実行される
 */
const MIGRATIONS = [m001, m002, m003].sort((a, b) => a.version - b.version);

/**
 * 未適用のマイグレーションを順次実行する
 *
 * 【動作の流れ】
 *   1. PRAGMA user_version で現在のDBバージョンを取得
 *   2. 未適用（version > currentVersion）のものだけを抽出
 *   3. 1件ずつトランザクション内で実行
 *      - 成功したら PRAGMA user_version を更新
 *      - 失敗したらロールバック + MigrationError を throw
 *
 * 【なぜ1マイグレーション=1トランザクションか】
 * 複数マイグレーションをまとめて1トランザクションにすると、
 * 後半で失敗した時に前半の変更も巻き戻ってしまい、
 * 「どこまで進んだか」が user_version から追えなくなる。
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;
  const latestVersion = MIGRATIONS[MIGRATIONS.length - 1].version;

  // 全て適用済みなら何もしない（毎回起動時に呼ばれるため早期return重要）
  if (currentVersion >= latestVersion) return;

  // 未適用分のみ抽出
  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);

  for (const migration of pending) {
    try {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        // user_version をそのマイグレーションの version に更新
        // ※トランザクション内なので、up失敗時はこの更新もロールバックされる
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
      });
      if (__DEV__) {
        console.log(`[migrate] ✓ v${migration.version} ${migration.name}`);
      }
    } catch (e) {
      // 失敗したら型付きエラーで上位に伝える
      throw new MigrationError(migration.version, migration.name, e);
    }
  }
}
