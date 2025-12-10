import { Injectable } from '@angular/core';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  displayName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // 常時ログイン済みのダミーユーザー
  private readonly DUMMY_USER: User = {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    role: 'admin',
    displayName: '山田太郎',
  };

  /**
   * 常にログイン済み
   */
  isLoggedIn(): boolean {
    return true;
  }

  /**
   * ダミーユーザーを返す
   */
  getCurrentUser(): User {
    return this.DUMMY_USER;
  }

  /**
   * 管理者チェック
   */
  isAdmin(): boolean {
    return this.DUMMY_USER.role === 'admin';
  }

  /**
   * 常に最高管理者ではない
   */
  isSuperAdmin(): boolean {
    return this.DUMMY_USER.role === 'superadmin';
  }

  /**
   * 何もしない（ログアウト機能なし）
   */
  logout(): void {
    console.log('ログアウト機能は無効です');
  }
}
