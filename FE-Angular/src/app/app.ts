import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';

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

  /** サイドバーの開閉状態 */
  public isSidebarOpen = true;

  /** メニュー項目の定義 */
  public menuItems = [
    { label: 'ホーム', route: '/home', icon: 'home' },
    { label: '決済権限管理', route: '/authority', icon: 'security' },
    { label: 'ユーザー管理', route: '/users', icon: 'people' },
    { label: '設定', route: '/settings', icon: 'settings' },
  ]

  /**
   * サイドバーの開閉を切り替える
   */
  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar toggled:', this.isSidebarOpen ? 'Open' : 'Closed');
  }
}
