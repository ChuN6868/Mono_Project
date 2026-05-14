import { db } from "../db/database";

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

/**
 * ユーザー一覧取得
 */
export function getUsers(): User[] {
  return db.getAllSync<User>(
    `SELECT * FROM users ORDER BY id DESC`
  );
}

/**
 * ユーザー1件取得
 */
export function getUserById(id: number) {
  return db.getFirstSync(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
}

/**
 * ユーザー作成
 */
export function createUser(
  name: string,
  email: string
) {
  db.runSync(
    `INSERT INTO users (name, email, created_at)
     VALUES (?, ?, ?)`,
    [name, email, new Date().toISOString()]
  );
}

/**
 * ユーザー更新
 */
export function updateUser(
  id: number,
  name: string,
  email: string
) {
  db.runSync(
    `UPDATE users
     SET name = ?, email = ?
     WHERE id = ?`,
    [name, email, id]
  );
}

/**
 * ユーザー削除
 */
export function deleteUser(id: number) {
  db.runSync(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );
}