import { db } from './database';
import { USER_TABLE } from './schema';
import { seedUsers } from './seed';

export function migrate() {
  // テーブル作成
  db.execSync(USER_TABLE);

  // 初期データ投入
  seedUsers();
}