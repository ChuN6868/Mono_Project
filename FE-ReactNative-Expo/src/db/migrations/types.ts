import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * マイグレーション1件分の型定義
 *
 * 【各フィールドの役割】
 * - version : 連番。PRAGMA user_version と照合して未適用分を判定する
 * - name    : ログ・エラー表示用の人間向け説明
 * - up      : このバージョンに上げる時に実行する処理（DDLや初期データ等）
 *
 * 【なぜ down (ロールバック) を用意しないか】
 * モバイルアプリでは「古いバージョンへ巻き戻す」運用が現実的でないため。
 * ユーザー端末は常に前進方向にしか進まない前提で設計する。
 */
export type Migration = {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
};
