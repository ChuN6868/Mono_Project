import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// AG Grid Community モジュールを全コンポネントで使用できるようにmain.tsで登録
// これによりアプリケーション起動時に登録できる
ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
