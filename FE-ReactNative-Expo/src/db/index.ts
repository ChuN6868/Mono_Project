/**
 * DB層の公開API（ファサード）
 *
 * 【最重要ルール】
 * db/ の外からは必ずこのファイル経由でimportすること：
 *   ✗ import { useUserRepository } from '@/src/db/repositories/userRepository';
 *   ○ import { useUserRepository } from '@/src/db';
 *
 * このルールを守ることで、db/ 内部のファイル分割やライブラリ差し替え時に
 * 利用側のimport文を一切壊さずに済む。
 */

// Provider & DB取得フック
export { DatabaseProvider, useDatabase } from './client';

// Repository（Reactフックも含む）
export * from './repositories';

// Domain型（Row型は内部実装なのでexportしない）
export type { User } from './schema/users';
export type { Category } from './schema/categoryMst';
export type { EmergencyFood } from './schema/emergencyFoods';

// 型付きエラー（ErrorBoundary側で instanceof 判定するため）
export { DatabaseError, MigrationError } from './errors';

// 複数Repository横断のトランザクションが必要な時用
export { withTransaction } from './transactions';
