import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';

/** サイドバー項目のインターフェース */
interface MenuItem {
  menuId: string;
  iconId: string;
  menuName: string;
  path: string;
  expanded: boolean;
  children: MenuItem[];
}

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('FE-Angular');

  /** サイドバーの開閉状態（初期はtrue） */
  public isSidebarOpen = true;

  /** メニュー項目の定義（階層構造対応） */
  public menuItems: MenuItem[] = [
    {
      menuId: 'home',
      iconId: 'home',
      menuName: 'ホーム',
      path: '/home',
      expanded: false,
      children: [],
    },
    {
      menuId: 'authority',
      iconId: 'security',
      menuName: 'ほげほげ親',
      path: '/authority',
      expanded: false,
      children: [],
    },
    {
      menuId: 'users',
      iconId: 'people',
      menuName: 'ユーザー管理',
      path: '',
      expanded: false,
      children: [
        {
          menuId: 'user-list',
          iconId: 'list',
          menuName: 'ユーザー情報一覧',
          path: '',
          expanded: false,
          children: [
            {
              menuId: 'authority',
              iconId: 'security',
              menuName: 'ほげほげ',
              path: '/authority',
              expanded: false,
              children: [],
            },
            {
              menuId: 'authority',
              iconId: 'security',
              menuName: 'ほげほげ',
              path: '/authority',
              expanded: false,
              children: [],
            },
          ],
        },
        {
          menuId: 'user-create',
          iconId: 'person_add',
          menuName: 'ユーザー作成',
          path: '/users/create',
          expanded: false,
          children: [],
        },
      ],
    },
  ];

  /** 各メニュー項目の展開状態を管理 */
  public expandedItems: { [key: string]: boolean } = {
    設定: false,
  };

  /**
   * サイドバーの開閉を切り替える
   */
  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar toggled:', this.isSidebarOpen ? 'Open' : 'Closed');
  }

  /**
   * サイドバーのアコーディオンメニューの開閉を切り替える
   * @param item メニュー項目
   */
  public toggleMenu(item: MenuItem): void {
    /** 子メニューがある場合のみトグル */
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  }
}
