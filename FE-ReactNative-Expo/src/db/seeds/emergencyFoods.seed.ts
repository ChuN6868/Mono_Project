import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * emergency_foods テーブルの開発用初期データ投入
 *
 * 【前提】
 * category_mst が先にシードされていること。
 * 下のデータは category_mst のシード順（保存食=1, 飲み物=2）
 * を前提にIDを直書きしている。
 *
 * ※実運用ではカテゴリIDを SELECT で動的取得すべきだが、
 *   開発用ダミーデータなのでシンプルさを優先。
 */
export async function seedEmergencyFoods(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM emergency_foods`
  );

  if (result?.count && result.count > 0) {
    return;
  }

  // 期限日は「今日からN日後」で生成（開発時に期限切れ状況を確認しやすくするため）
  const today = new Date();
  const daysFromNow = (days: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  };

  // categoryId: 1=保存食, 2=飲み物
  const foods: {
    categoryId: number;
    name: string;
    expirationDate: string;
    storageLocation: string | null;
  }[] = [
    { categoryId: 1, name: 'アルファ米(白米)',  expirationDate: daysFromNow(365),  storageLocation: '押入れ上段' },
    { categoryId: 1, name: 'パンの缶詰',        expirationDate: daysFromNow(1095), storageLocation: '押入れ上段' },
    { categoryId: 1, name: 'サバの味噌煮缶',    expirationDate: daysFromNow(730),  storageLocation: 'キッチン棚' },
    { categoryId: 1, name: 'ビスコ保存缶',      expirationDate: daysFromNow(1460), storageLocation: '押入れ下段' },
    { categoryId: 1, name: 'カレーレトルト',    expirationDate: daysFromNow(-10),  storageLocation: null },        // 期限切れ
    { categoryId: 2, name: '保存水 2L',         expirationDate: daysFromNow(1825), storageLocation: 'ガレージ' },
    { categoryId: 2, name: '保存水 500ml',      expirationDate: daysFromNow(30),   storageLocation: '玄関' },      // 期限近め
  ];

  // created_at / updated_at はDDLのDEFAULTで自動採番されるためINSERT列から除外
  for (const food of foods) {
    await db.runAsync(
      `INSERT INTO emergency_foods
         (category_id, emergency_food_name, expiration_date, storage_location)
       VALUES (?, ?, ?, ?)`,
      [
        food.categoryId,
        food.name,
        food.expirationDate,
        food.storageLocation,
      ]
    );
  }
}
