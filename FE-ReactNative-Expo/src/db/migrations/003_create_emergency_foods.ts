import type { Migration } from './types';
import {
  CREATE_TABLE,
  CREATE_INDEX_EXPIRATION,
  CREATE_INDEX_CATEGORY,
} from '../schema/emergencyFoods';

/**
 * v3: emergency_foods テーブルとインデックスを作成する
 *
 * category_mst への外部キー参照があるため、必ず v2 の後に実行されること。
 */
const migration: Migration = {
  version: 3,
  name: 'create_emergency_foods',
  up: async (db) => {
    await db.execAsync(CREATE_TABLE);
    await db.execAsync(CREATE_INDEX_EXPIRATION);
    await db.execAsync(CREATE_INDEX_CATEGORY);
  },
};

export default migration;
