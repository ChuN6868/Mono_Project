import type { SQLiteDatabase } from 'expo-sqlite';
import { seedUsers } from './users.seed';
import { seedCategoryMst } from './categoryMst.seed';
import { seedEmergencyFoods } from './emergencyFoods.seed';

/**
 * 開発用初期データ投入のエントリポイント
 *
 * 【重要】呼び出し側（client.ts の onInit）で __DEV__ ガードしているため、
 * 本番ビルドではここは実行されない。
 * 新しいseedを追加したら、この関数内で順次 await して呼び出す。
 *
 * 【実行順序の注意】
 * 外部キー依存があるため、参照される側を先に投入すること。
 *   category_mst（マスタ） → emergency_foods（FK参照）
 */
export async function runSeeds(db: SQLiteDatabase): Promise<void> {
  await seedUsers(db);
  await seedCategoryMst(db);
  await seedEmergencyFoods(db);
}
