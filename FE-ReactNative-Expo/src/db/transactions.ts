import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * 複数の操作をひとつのトランザクションで実行するためのヘルパー
 *
 * 【なぜ必要か】
 * 例：「ユーザー作成と同時に初期食料データも投入する」のように、
 * 複数Repositoryを横断する処理を“全部成功”か“全部失敗”にしたい時に使う。
 * 途中で例外が起きると自動的にロールバックされる。
 *
 * 【使い方】
 *   await withTransaction(db, async () => {
 *     await userRepo.create(...);
 *     await foodRepo.create(...);
 *   });
 */
export async function withTransaction<T>(
  db: SQLiteDatabase,
  fn: () => Promise<T>
): Promise<T> {
  let result!: T;
  await db.withTransactionAsync(async () => {
    result = await fn();
  });
  return result;
}
