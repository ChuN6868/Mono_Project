import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * category_mst テーブルの開発用初期データ投入
 *
 * 既存データがあればスキップ（冪等性確保）。
 * カテゴリIDは AUTOINCREMENT で 1, 2, 3, ... と振られる前提で、
 * emergency_foods 側のシードもこの順序を前提にしている。
 */
export async function seedCategoryMst(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM category_mst`
  );

  if (result?.count && result.count > 0) {
    return;
  }

  // 防災備蓄品の最小限のカテゴリ
  const categories = ['保存食', '飲み物'];

  // created_at / updated_at はDDLのDEFAULTで自動採番されるためINSERT列から除外
  for (const name of categories) {
    await db.runAsync(
      `INSERT INTO category_mst (category_name) VALUES (?)`,
      [name]
    );
  }
}
