import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * users テーブルの開発用初期データ投入
 *
 * 【設計のポイント】
 * - すでにデータがある場合は何もしない（冪等性の確保）
 * - 本番環境では絶対に実行されないよう、呼び出し側で __DEV__ ガードする
 *   （このファイル自体にはガードを入れない＝役割分離）
 */
export async function seedUsers(db: SQLiteDatabase): Promise<void> {
  // 既存データチェック：既にユーザーが居れば二重投入を避ける
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM users`
  );

  if (result?.count && result.count > 0) {
    return;
  }

  const users = [
    { name: 'Taro Yamada', email: 'taro@example.com' },
    { name: 'Hanako Suzuki', email: 'hanako@example.com' },
    { name: 'John Doe', email: 'john@example.com' },
  ];

  // ループ内のINSERTは1トランザクションにまとめた方が高速だが、
  // ここでは開発用seedなので可読性優先で素直に書く
  const now = new Date().toISOString();
  for (const user of users) {
    await db.runAsync(
      `INSERT INTO users (name, email, created_at) VALUES (?, ?, ?)`,
      [user.name, user.email, now]
    );
  }
}
