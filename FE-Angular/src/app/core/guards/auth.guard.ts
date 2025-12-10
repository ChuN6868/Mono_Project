import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 認証Guard (CanActivate)
 * ログイン済みかどうかをチェック
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ログインチェック
  if (authService.isLoggedIn()) {
    console.log('✅ 認証OK: アクセス許可');
    return true;
  }

  // 未認証の場合はログインページにリダイレクト
  console.warn('❌ 未認証: ログインページにリダイレクトします');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * 認証Guard (CanActivateChild)
 * 子ルート全体に適用する認証チェック
 */
export const authGuardChild: CanActivateChildFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    console.log('✅ 認証OK (子ルート): アクセス許可');
    return true;
  }

  console.warn('❌ 未認証 (子ルート): ログインページにリダイレクトします');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * 管理者Guard (CanActivate)
 * 管理者権限があるかチェック
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // まずログインチェック
  if (!authService.isLoggedIn()) {
    console.warn('❌ 未認証: ログインページにリダイレクトします');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // 管理者権限チェック
  if (authService.isAdmin()) {
    console.log('✅ 管理者権限OK: アクセス許可');
    return true;
  }

  console.warn('❌ 管理者権限なし: アクセス拒否ページにリダイレクトします');
  router.navigate(['/access-denied']);
  return false;
};

/**
 * 管理者Guard (CanActivateChild)
 * 子ルート全体に適用する管理者権限チェック
 */
export const adminGuardChild: CanActivateChildFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('❌ 未認証 (子ルート): ログインページにリダイレクトします');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authService.isAdmin()) {
    console.log('✅ 管理者権限OK (子ルート): アクセス許可');
    return true;
  }

  console.warn('❌ 管理者権限なし (子ルート): アクセス拒否ページにリダイレクトします');
  router.navigate(['/access-denied']);
  return false;
};

/**
 * 最高管理者Guard (CanActivate)
 * 最高管理者権限があるかチェック
 */
export const superAdminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('❌ 未認証: ログインページにリダイレクトします');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authService.isSuperAdmin()) {
    console.log('✅ 最高管理者権限OK: アクセス許可');
    return true;
  }

  console.warn('❌ 最高管理者権限なし: アクセス拒否ページにリダイレクトします');
  router.navigate(['/access-denied']);
  return false;
};
