import { useMemo } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useDatabase } from '../client';
import { type User, type UserRow, toUser } from '../schema/users';

/**
 * UserRepository のインターフェース
 *
 * 【なぜ型を別途exportするか】
 * - テスト時にメモリ実装などのモックに差し替え可能になる
 * - 利用側はこの型にだけ依存することで、内部実装の変更に影響を受けない
 */
export type UserRepository = {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  create(input: { name: string; email: string }): Promise<number>;
  update(
    id: number,
    input: Partial<{ name: string; email: string }>
  ): Promise<void>;
  delete(id: number): Promise<void>;
};

/**
 * UserRepository のファクトリ関数
 *
 * 【なぜシングルトンではなくファクトリにしたか】
 * - DBインスタンスは SQLiteProvider が管理しているため、外から渡される
 * - これによりテスト時にテスト用DBを渡せる
 * - HMR（ホットリロード）でDBが作り直されても追従できる
 */
export function createUserRepository(db: SQLiteDatabase): UserRepository {
  return {
    /**
     * 全ユーザー取得（新しい順）
     * DBから取得したRowを必ず Domain型 に変換してから返す
     */
    async findAll() {
      const rows = await db.getAllAsync<UserRow>(
        `SELECT * FROM users ORDER BY id DESC`
      );
      return rows.map(toUser);
    },

    /**
     * IDで1件取得
     * 見つからない場合は null を返す（例外は投げない）
     */
    async findById(id) {
      const row = await db.getFirstAsync<UserRow>(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );
      return row ? toUser(row) : null;
    },

    /**
     * ユーザー作成
     * 戻り値は採番された id（lastInsertRowId）
     */
    async create({ name, email }) {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO users (name, email, created_at) VALUES (?, ?, ?)`,
        [name, email, now]
      );
      return result.lastInsertRowId;
    },

    /**
     * ユーザー更新（部分更新対応）
     *
     * 【設計意図】
     * Partial<>で受け取り、渡されたフィールドだけ UPDATE する。
     * 「name だけ更新したい」「email だけ更新したい」を1メソッドで賄える。
     *
     * Object.entries で取り出した上で undefined を除外することで、
     * 「キーは渡されたが値が undefined」というケースも安全に弾く。
     */
    async update(id, input) {
      const entries = Object.entries(input).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      );
      if (entries.length === 0) return; // 更新対象なしなら何もしない

      const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
      const values = entries.map(([, v]) => v);

      await db.runAsync(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
    },

    /**
     * ユーザー削除
     */
    async delete(id) {
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
    },
  };
}

/**
 * UserRepository をReactコンポーネントから使うためのカスタムフック
 *
 * 【useMemo の意図】
 * 毎レンダリングでrepositoryオブジェクトを作り直すと、
 * useEffectの依存配列に入れた時に毎回再実行されてしまう。
 * dbが変わらない限り同じインスタンスを返すことで、無駄な再実行を防ぐ。
 */
export function useUserRepository(): UserRepository {
  const db = useDatabase();
  return useMemo(() => createUserRepository(db), [db]);
}
