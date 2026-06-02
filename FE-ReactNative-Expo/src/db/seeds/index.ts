import type { SQLiteDatabase } from 'expo-sqlite';
import { seedUsers } from './users.seed';

/**
 * 開発用初期データ投入のエントリポイント
 *
 * 【重要】呼び出し側（client.ts の onInit）で __DEV__ ガードしているため、
 * 本番ビルドではここは実行されない。
 * 新しいseedを追加したら、この関数内で順次 await して呼び出す。
 */
export async function runSeeds(db: SQLiteDatabase): Promise<void> {
  await seedUsers(db);
}
