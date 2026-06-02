/**
 * category_mst テーブルのスキーマ定義（カテゴリマスタ）
 *
 * 非常食をカテゴリ分類するためのマスタテーブル。
 * 非常食側（emergency_foods.category_id）から参照される。
 */

export const TABLE_NAME = 'category_mst';

/**
 * CREATE TABLE 文
 *
 * 【データ型選定理由】
 * - category_id   : INTEGER + AUTOINCREMENT で自動採番。SQLiteのPK慣例
 * - category_name : TEXT + UNIQUE でカテゴリ名の重複を防止
 *
 * 【監査列なしの方針】
 * マスタテーブルは更新頻度が極めて低く、変更履歴も別管理されることが多いため、
 * created_at / updated_at は持たない。
 */
export const CREATE_TABLE = `
CREATE TABLE ${TABLE_NAME} (
  category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE
);
`;

/**
 * Row型：DBから取得した生の行
 */
export type CategoryMstRow = {
  category_id: number;
  category_name: string;
};

/**
 * Domain型：アプリ層で扱うカテゴリ
 *
 * 【命名方針】
 * DBは `category_id` / `category_name` という明示派命名だが、
 * Domain層では `Category` エンティティ前提なので `id` / `name` に短縮する。
 * （オブジェクト名で文脈が伝わるため冗長な接頭辞は不要）
 */
export type Category = {
  id: number;
  name: string;
};

export function toCategory(row: CategoryMstRow): Category {
  return {
    id: row.category_id,
    name: row.category_name,
  };
}
