import { Routes } from '@angular/router';
import { CsvImport } from './features/csv-import/csv-import';
import { GuardLessonComponent } from './features/guard-lesson/guard-lesson.component';
import { authGuard, authGuardChild, adminGuard } from './core/guards/auth.guard';
import { AdminPageComponent } from './features/guard-lesson/pages/admin-page/admin-page.component';
import { HomeComponent } from './features/home/home.component';
import { PokeApiComponent } from './features/poke-api/poke-api.component';

export const routes: Routes = [
  /************************
   * ホーム画面（認証不要）
   ************************/
  { path: '', component: HomeComponent },

  /************************
   * CSVインポート用（認証不要）
   ************************/
  { path: 'csv-import', component: CsvImport },

  /************************
   * guard-lesson用（認証必須）
   ************************/
  {
    path: 'guard-lesson',
    canActivate: [authGuard], // 親ルート自体に認証ガード
    canActivateChild: [authGuardChild], // すべての子ルートに認証ガード
    children: [
      /**
       * 大元のメニュー
       * /guard-lesson
       */
      {
        path: '',
        pathMatch: 'full',
        component: GuardLessonComponent,
      },
      /**
       * 管理者専用ページの例
       * /guard-lesson/admin-only
       */
      {
        path: 'admin-only',
        component: AdminPageComponent, // 実際には別のコンポーネントを指定
        canActivate: [adminGuard], // 管理者のみアクセス可能
      },
    ],
  },

  /************************
   * ポケモン用（認証不要）
   ************************/
  { path: 'pokemon', component: PokeApiComponent },
];
