import { Component, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { HeaderComponent } from './core/layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule, // sidebar分離後もこれは必要
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('FE-Angular');

  /** サイドバーの開閉状態（初期はtrue） */
  public isSidebarOpen = true;

  /**
   * サイドバーの開閉を切り替える
   */
  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar toggled:', this.isSidebarOpen ? 'Open' : 'Closed');
  }
}
