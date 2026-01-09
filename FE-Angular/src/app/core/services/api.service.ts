import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * API通信サービス
 *
 * 全てのHTTP通信の基盤となるサービス
 * 各feature配下のサービスは、このサービスを使ってAPI通信を行う
 *
 * 責務:
 * - HTTP通信の共通処理
 * - エラーハンドリングの一元化
 * - APIのベースURL管理
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // APIのベースURL（本番環境では適切なURLに変更してください）
  private readonly API_URL = 'http://localhost:3000/api';

  /**
   * GET リクエスト
   *
   * @param endpoint - APIエンドポイント（例: '/users', '/users/123'）
   * @param params - クエリパラメータ（オプション）
   * @returns Observable<T>
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.API_URL}${endpoint}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * エラーハンドリング
   *
   * すべてのHTTPエラーをここで一元的に処理
   *
   * @param error - HTTPエラーレスポンス
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '予期しないエラーが発生しました';

    if (error.error instanceof ErrorEvent) {
      // クライアント側のエラー
      errorMessage = `クライアントエラー: ${error.error.message}`;
      console.error('クライアント側エラー:', error.error.message);
    } else {
      // サーバー側のエラー
      console.error(
        `サーバーエラー: ステータスコード ${error.status}, ` +
          `エラー内容: ${JSON.stringify(error.error)}`
      );

      // ステータスコードごとのエラーメッセージ
      switch (error.status) {
        case 400:
          errorMessage = '不正なリクエストです';
          break;
        case 401:
          errorMessage = '認証が必要です。ログインしてください';
          break;
        case 403:
          errorMessage = 'アクセス権限がありません';
          break;
        case 404:
          errorMessage = 'リソースが見つかりません';
          break;
        case 500:
          errorMessage = 'サーバーエラーが発生しました';
          break;
        case 503:
          errorMessage = 'サービスが一時的に利用できません';
          break;
        default:
          errorMessage = `エラーが発生しました（ステータスコード: ${error.status}）`;
      }

      // サーバーから返されたエラーメッセージがあれば使用
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    // コンソールにエラーを出力
    console.error('APIエラー:', errorMessage);

    // エラーをthrow
    return throwError(() => new Error(errorMessage));
  }
}
