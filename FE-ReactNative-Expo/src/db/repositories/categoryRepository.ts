import { useMemo } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useDatabase } from '../client';
import {
  type Category,
  type CategoryMstRow,
  toCategory,
} from '../schema/categoryMst';

/**
 * カテゴリマスタ用 Repository
 *
 * 【現状の責務】
 * 登録モーダルで「カテゴリ名 → category_id」を引くために
 * 全カテゴリを取得する用途のみ。
 * 将来カテゴリのCRUD管理画面が増えたらここに追加していく。
 */
export type CategoryRepository = {
  findAll(): Promise<Category[]>;
};

export function createCategoryRepository(db: SQLiteDatabase): CategoryRepository {
  return {
    async findAll() {
      const rows = await db.getAllAsync<CategoryMstRow>(
        `SELECT * FROM category_mst ORDER BY category_id`
      );
      return rows.map(toCategory);
    },
  };
}

export function useCategoryRepository(): CategoryRepository {
  const db = useDatabase();
  return useMemo(() => createCategoryRepository(db), [db]);
}
