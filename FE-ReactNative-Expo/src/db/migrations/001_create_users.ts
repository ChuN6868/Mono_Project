import type { Migration } from './types';
import { CREATE_TABLE } from '../schema/users';

/**
 * v1: users テーブルを作成する
 *
 * 【重要】このファイルは一度リリースした後は絶対に編集しないこと。
 * リリース済みユーザーの端末では v1 が既に適用済みのため、
 * このファイルを書き換えても再実行されず、スキーマ差異が発生する。
 * 修正が必要な場合は必ず新しいマイグレーション（002_*, 003_*）を追加する。
 */
const migration: Migration = {
  version: 1,
  name: 'create_users',
  up: async (db) => {
    await db.execAsync(CREATE_TABLE);
  },
};

export default migration;
