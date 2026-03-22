import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

/* ========================================
   ユーザー情報の型定義
   ======================================== */

export interface User {
  displayName: string;  // 表示名（例: 山田太郎）
  email: string;        // メールアドレス
  role: string;         // ロール（Entra ID: アプリロールから取得 / Google: 常に 'user'）
  provider: string;     // 認証プロバイダー（'google' | 'aad' | 'dummy'）
}

/* ========================================
   App Service EasyAuth の /.auth/me レスポンス型
   ======================================== */
// App Service の組み込み認証（EasyAuth）は、認証済みユーザーの情報を
// /.auth/me エンドポイントから JSON で返す。
// 各情報は { typ: 'クレーム名', val: '値' } の配列で格納されている。

interface AuthMeClaim {
  typ: string;  // クレーム名（例: 'name', 'email', 'roles'）
  val: string;  // クレームの値（例: '山田太郎', 'taro@example.com'）
}

interface AuthMeResponse {
  provider_name: string;       // 認証プロバイダー名（'google' or 'aad'）
  user_claims: AuthMeClaim[];  // ユーザーのクレーム（属性情報）の配列
}

/* ========================================
   AuthService
   ======================================== */

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // BehaviorSubject: 最新の値を保持し、購読者に即座に配信する Observable
  // null はまだユーザー情報を取得していない状態を表す
  private readonly currentUser$ = new BehaviorSubject<User | null>(null);

  // ローカル開発用のダミーユーザー
  // ローカル環境では App Service の /.auth/me が存在しないため、
  // このダミーユーザーをフォールバックとして使用する
  private readonly DUMMY_USER: User = {
    displayName: '山田太郎（ローカル）',
    email: 'testuser@example.com',
    role: 'admin',
    provider: 'dummy',
  };

  /**
   * App Service の /.auth/me を呼び出してユーザー情報を取得する。
   *
   * - 成功時: レスポンスを解析して User オブジェクトを生成
   * - 失敗時: ローカル開発環境と判断し、ダミーユーザーにフォールバック
   *
   * ※ このメソッドはアプリ起動時に1回だけ呼び出す想定
   */
  fetchCurrentUser(): Observable<User | null> {
    this.http.get<AuthMeResponse[]>('/.auth/me').subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          // /.auth/me は配列で返ってくる。最初の要素がログイン中のプロバイダー情報
          const user = this.parseAuthMeResponse(res[0]);
          this.currentUser$.next(user);
        } else {
          this.currentUser$.next(this.DUMMY_USER);
        }
      },
      error: () => {
        // ローカル開発時は /.auth/me が存在しないため 404 エラーになる
        // → ダミーユーザーを返してアプリが正常に動作するようにする
        this.currentUser$.next(this.DUMMY_USER);
      },
    });
    return this.currentUser$.asObservable();
  }

  /**
   * /.auth/me のレスポンスを解析して User オブジェクトを生成する。
   * Google 認証と Entra ID 認証の両方に対応。
   *
   * 各プロバイダーでクレーム名が異なるため、それぞれのパターンを処理する:
   *   - 表示名: Google / Entra ID ともに 'name'
   *   - メール: Google は 'email'、Entra ID は長いクレーム名 or 'preferred_username'
   *   - ロール: Google にはロール情報がない、Entra ID は 'roles' クレームに格納
   */
  private parseAuthMeResponse(response: AuthMeResponse): User {
    const claims = response.user_claims;
    const provider = response.provider_name; // 'google' or 'aad'

    // クレーム配列から指定した型名の値を検索するヘルパー関数
    const getClaim = (type: string): string =>
      claims.find((c) => c.typ === type)?.val ?? '';

    // --- 表示名 ---
    // Google / Entra ID どちらも 'name' クレームに格納されている
    const displayName = getClaim('name');

    // --- メールアドレス ---
    // Entra ID: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' または 'preferred_username'
    // Google:   'email'
    // 優先順位をつけて最初に見つかった値を使用する
    const email =
      getClaim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress') ||
      getClaim('preferred_username') ||
      getClaim('email');

    // --- ロール ---
    // Entra ID: Azure ポータルの「アプリの登録」で定義したアプリロールが 'roles' クレームに入る
    //           （例: 'admin', 'user' など。未設定の場合はデフォルト 'user'）
    // Google:   ロールの仕組みがないため、常にデフォルト 'user' を設定
    const role = provider === 'aad' ? (getClaim('roles') || 'user') : 'user';

    return { displayName, email, role, provider };
  }

  /**
   * 現在のユーザー情報を Observable として返す。
   * コンポーネントはこれを subscribe してユーザー情報を取得する。
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * ログイン済みかどうかを返す。
   * fetchCurrentUser() でユーザー情報が取得済みであれば true。
   */
  isLoggedIn(): boolean {
    return this.currentUser$.value !== null;
  }
}
