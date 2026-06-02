/**
 * schema配下の全テーブルから「Domain型」と「mapper関数」だけを集約export。
 *
 * 【DDL定数（TABLE_NAME, CREATE_TABLE 等）は集約しない理由】
 * 各テーブルファイルで同名定数を export しているため、`export *` は名前衝突する。
 * またDDL定数は migrations 側から直接 `'../schema/users'` のように
 * 個別importされる用途しかなく、バレル経由で使う場面がないため集約不要。
 *
 * 新テーブルを追加したら、Domain型と mapper の export 行をここに追記する。
 */
export type { User } from './users';
export { toUser } from './users';

export type { Category } from './categoryMst';
export { toCategory } from './categoryMst';

export type { EmergencyFood } from './emergencyFoods';
export { toEmergencyFood } from './emergencyFoods';
