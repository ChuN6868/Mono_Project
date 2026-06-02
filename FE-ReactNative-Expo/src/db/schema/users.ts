/**
 * users テーブルのスキーマ定義
 *
 * 【この1ファイルに集約しているもの】
 *   1. テーブル名・DDL（CREATE TABLE文）
 *   2. インデックス定義
 *   3. Row型（DBの生の行データ。snake_case）
 *   4. Domain型（アプリ層で使うドメインモデル。camelCase）
 *   5. Row → Domain の変換関数（mapper）
 *
 * 【なぜRow型とDomain型を分けるか】
 * - DBはsnake_case、TypeScriptはcamelCaseが慣習。混ぜると一貫性が壊れる
 * - DBのTEXT型で保存した日時を、アプリ層ではDateオブジェクトとして扱いたい
 * - テーブル変更時、影響範囲をこの1ファイルに閉じ込められる
 */

export const TABLE_NAME = 'users';

/**
 * CREATE TABLE 文
 * ※IF NOT EXISTS は付けない（マイグレーション側でバージョン管理するため）
 */
export const CREATE_TABLE = `
CREATE TABLE ${TABLE_NAME} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
`;

/**
 * Row型：DBから取得した生の行の型
 * カラム名はDBに合わせてsnake_case
 */
export type UserRow = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

/**
 * Domain型：アプリ層で扱うユーザー
 * - キーはcamelCase
 * - 日時はDateオブジェクト（文字列のまま扱うとフォーマットバグの温床）
 */
export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

/**
 * Row → Domain への変換
 * Repositoryから返す前に必ずこの関数を通すことで、
 * アプリ層がDB構造（snake_case, TEXT型日時）を意識しなくて済む
 */
export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: new Date(row.created_at),
  };
}
