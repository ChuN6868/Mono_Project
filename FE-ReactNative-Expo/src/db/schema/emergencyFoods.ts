/**
 * emergency_foods テーブルのスキーマ定義（非常食）
 *
 * カテゴリマスタ（category_mst）への外部キーを持つ。
 */

export const TABLE_NAME = 'emergency_foods';

/**
 * CREATE TABLE 文
 *
 * 【データ型選定理由】
 * - emergency_food_id   : INTEGER + AUTOINCREMENT で自動採番
 * - category_id         : INTEGER + 外部キー（category_mst.category_id）
 *                         ON DELETE RESTRICT で「使われているカテゴリは削除不可」とする
 * - emergency_food_name : TEXT（食品名は可変長）
 * - expiration_date     : TEXT に 'YYYY-MM-DD' 形式で格納
 *                         SQLiteにDATE型はないがISO 8601なら辞書順=時系列順で比較可能
 *                         タイムゾーン問題を回避するため日付のみで保持
 * - storage_location    : TEXT、NULL許容（保管場所未指定のケースを許す）
 * - created_at / updated_at : ISO 8601文字列。DEFAULTで挿入時刻を自動生成
 *
 * 【DEFAULT 値の仕組み】
 * SQLite組み込み関数 strftime() で挿入時刻をISO 8601形式で自動生成。
 * 例: '2026-06-02T10:30:45.123Z'
 * これは `new Date().toISOString()` と全く同じフォーマットなので、
 * mapper側の `new Date(row.created_at)` がそのまま動く（UTC基準）。
 */
export const CREATE_TABLE = `
CREATE TABLE ${TABLE_NAME} (
  emergency_food_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id         INTEGER NOT NULL,
  emergency_food_name TEXT NOT NULL,
  expiration_date     TEXT NOT NULL,
  storage_location    TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (category_id) REFERENCES category_mst(category_id) ON DELETE RESTRICT
);
`;

/**
 * インデックス
 *
 * 【作成理由】
 * - idx_emergency_foods_expiration_date :
 *     「期限が近い順に並べる」「期限切れを抽出」のクエリが頻発する想定
 * - idx_emergency_foods_category_id :
 *     カテゴリ別表示・絞り込みクエリの高速化
 */
export const CREATE_INDEX_EXPIRATION = `
CREATE INDEX IF NOT EXISTS idx_emergency_foods_expiration_date
ON ${TABLE_NAME}(expiration_date);
`;

export const CREATE_INDEX_CATEGORY = `
CREATE INDEX IF NOT EXISTS idx_emergency_foods_category_id
ON ${TABLE_NAME}(category_id);
`;

/**
 * Row型：DBから取得した生の行
 */
export type EmergencyFoodRow = {
  emergency_food_id: number;
  category_id: number;
  emergency_food_name: string;
  expiration_date: string;
  storage_location: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Domain型：アプリ層で扱う非常食
 *
 * 【設計ポイント】
 * - id, name は短縮（前段で議論済み）
 * - expirationDate は string のまま保持
 *   （new Date('2026-12-31') がUTC解釈されて1日ズレるバグを回避）
 * - createdAt/updatedAt は時刻も意味があるため Date 型で保持
 */
export type EmergencyFood = {
  id: number;
  categoryId: number;
  name: string;
  expirationDate: string; // 'YYYY-MM-DD'
  storageLocation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toEmergencyFood(row: EmergencyFoodRow): EmergencyFood {
  return {
    id: row.emergency_food_id,
    categoryId: row.category_id,
    name: row.emergency_food_name,
    expirationDate: row.expiration_date,
    storageLocation: row.storage_location,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
