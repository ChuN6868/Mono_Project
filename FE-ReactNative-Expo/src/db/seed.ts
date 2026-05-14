import { db } from './database';

/**
 * 初期ユーザーデータ投入（開発用）
 * ※すでにデータがある場合は何もしない
 */
export function seedUsers() {
  // ★重要：すでにデータがあるならスキップ
  const result = db.getFirstSync<{ count: number }>(
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

  for (const user of users) {
    db.runSync(
      `
      INSERT INTO users (name, email, created_at)
      VALUES (?, ?, ?)
      `,
      [
        user.name,
        user.email,
        new Date().toISOString(),
      ]
    );
  }
}