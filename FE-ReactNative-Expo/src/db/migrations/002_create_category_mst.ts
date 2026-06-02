import type { Migration } from './types';
import { CREATE_TABLE } from '../schema/categoryMst';

/**
 * v2: category_mst テーブルを作成する
 *
 * emergency_foods が外部キーで参照するため、emergency_foods より先に作成する必要がある。
 */
const migration: Migration = {
  version: 2,
  name: 'create_category_mst',
  up: async (db) => {
    await db.execAsync(CREATE_TABLE);
  },
};

export default migration;
