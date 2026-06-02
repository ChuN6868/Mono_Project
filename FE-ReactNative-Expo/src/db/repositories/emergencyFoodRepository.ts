import { useMemo } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useDatabase } from '../client';
import {
  type EmergencyFood,
  type EmergencyFoodRow,
  toEmergencyFood,
} from '../schema/emergencyFoods';

/**
 * 一覧表示用：非常食 + category_mst からカテゴリ名をJOINした「ビュー型」
 *
 * 【なぜ Domain型を拡張するか】
 * カテゴリ名は emergency_foods テーブル単体には存在しないが、
 * UI表示には必須。JOINクエリで1回取得し、UI層で再JOINさせないことで
 * N+1問題を回避する。
 */
export type EmergencyFoodWithCategory = EmergencyFood & {
  categoryName: string;
};

export type EmergencyFoodRepository = {
  findAll(): Promise<EmergencyFoodWithCategory[]>;
  findByCategoryName(name: string): Promise<EmergencyFoodWithCategory[]>;
  create(input: {
    categoryId: number;
    name: string;
    expirationDate: string; // 'YYYY-MM-DD'
    storageLocation: string | null;
  }): Promise<number>;
  update(
    id: number,
    input: {
      categoryId: number;
      name: string;
      expirationDate: string; // 'YYYY-MM-DD'
      storageLocation: string | null;
    }
  ): Promise<void>;
  delete(id: number): Promise<void>;
};

/**
 * SQLのJOIN結果行の型（Row型 + category_name カラム）
 * 内部利用のためexportしない
 */
type EmergencyFoodJoinRow = EmergencyFoodRow & { category_name: string };

/**
 * Row + categoryName → EmergencyFoodWithCategory への変換
 */
function toEmergencyFoodWithCategory(
  row: EmergencyFoodJoinRow
): EmergencyFoodWithCategory {
  return {
    ...toEmergencyFood(row),
    categoryName: row.category_name,
  };
}

export function createEmergencyFoodRepository(
  db: SQLiteDatabase
): EmergencyFoodRepository {
  return {
    /**
     * 全件取得（期限が近い順）
     */
    async findAll() {
      const rows = await db.getAllAsync<EmergencyFoodJoinRow>(`
        SELECT ef.*, cm.category_name
        FROM emergency_foods ef
        JOIN category_mst cm ON cm.category_id = ef.category_id
        ORDER BY ef.expiration_date ASC
      `);
      return rows.map(toEmergencyFoodWithCategory);
    },

    /**
     * カテゴリ名で絞り込み（期限が近い順）
     *
     * カテゴリIDではなく名前で受けることで、UI側がIDを意識せずに済む。
     * インデックスが効くのは category_id 側だが、件数が少ない前提なので
     * 名前検索のオーバーヘッドは無視できる。
     */
    async findByCategoryName(name) {
      const rows = await db.getAllAsync<EmergencyFoodJoinRow>(
        `
        SELECT ef.*, cm.category_name
        FROM emergency_foods ef
        JOIN category_mst cm ON cm.category_id = ef.category_id
        WHERE cm.category_name = ?
        ORDER BY ef.expiration_date ASC
        `,
        [name]
      );
      return rows.map(toEmergencyFoodWithCategory);
    },

    /**
     * 新規作成
     * created_at / updated_at は DDL の DEFAULT で自動採番されるため指定しない
     */
    async create({ categoryId, name, expirationDate, storageLocation }) {
      const result = await db.runAsync(
        `INSERT INTO emergency_foods
           (category_id, emergency_food_name, expiration_date, storage_location)
         VALUES (?, ?, ?, ?)`,
        [categoryId, name, expirationDate, storageLocation]
      );
      return result.lastInsertRowId;
    },

    /**
     * 更新
     *
     * 【updated_at の扱い】
     * DDL の DEFAULT は INSERT 時にしか効かないため、UPDATE では明示的に
     * 同じ strftime() で現時刻を上書きする。
     * （DBレベルで保証したい場合は AFTER UPDATE トリガーを追加する手もあるが、
     *   Repository集中管理のほうがシンプルなので現状はこちら。）
     */
    async update(id, { categoryId, name, expirationDate, storageLocation }) {
      await db.runAsync(
        `UPDATE emergency_foods
           SET category_id         = ?,
               emergency_food_name = ?,
               expiration_date     = ?,
               storage_location    = ?,
               updated_at          = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE emergency_food_id = ?`,
        [categoryId, name, expirationDate, storageLocation, id]
      );
    },

    /**
     * 削除
     * emergency_foods はカテゴリマスタの子（参照する側）なのでFK制約に引っかからない。
     * 物理削除を採用。論理削除（deleted_at列）にしたい場合はDDL変更が必要。
     */
    async delete(id) {
      await db.runAsync(
        `DELETE FROM emergency_foods WHERE emergency_food_id = ?`,
        [id]
      );
    },
  };
}

/**
 * Reactコンポーネントから利用するためのカスタムフック
 */
export function useEmergencyFoodRepository(): EmergencyFoodRepository {
  const db = useDatabase();
  return useMemo(() => createEmergencyFoodRepository(db), [db]);
}
