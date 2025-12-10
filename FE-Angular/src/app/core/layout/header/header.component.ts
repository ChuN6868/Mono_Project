import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  public currentUser: User | null = null;

  /** 親コンポーネント（app.ts）にイベントを通知 */
  /** TODO: 全くこの機能を理解していないのでいつか調べる */
  @Output() menuClick = new EventEmitter<void>();

  public ngOnInit(): void {
      this.currentUser = this.authService.getCurrentUser();
  }

  /** メニューボタンがクリックされたとき */
  public onMenuClick(): void {
    this.menuClick.emit(); // 親にイベントを通知するだけ
  }
}
