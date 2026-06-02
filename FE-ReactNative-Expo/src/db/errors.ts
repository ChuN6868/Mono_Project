/**
 * DB層で発生したエラーを表現する型付きエラークラス
 *
 * 【なぜ独自エラークラスが必要か】
 * - 生のError throwだと、UI側でDBエラーと他のエラーを区別できない
 * - ErrorBoundary や catch側で `instanceof DatabaseError` で分岐できる
 * - 業務アプリでは「DB初期化失敗時はリトライ画面に飛ばす」等の制御が必須
 */

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * マイグレーション実行中に発生したエラー
 * どのバージョンの何のマイグレーションで失敗したか追跡可能にする
 */
export class MigrationError extends DatabaseError {
  constructor(
    public readonly version: number,
    public readonly migrationName: string,
    cause?: unknown
  ) {
    super(`Migration v${version} (${migrationName}) failed`, cause);
    this.name = 'MigrationError';
  }
}
