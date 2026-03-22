import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatToolbarModule],
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
    // fetchCurrentUser() で /.auth/me を呼び出し、
    // 返ってきた Observable を subscribe してユーザー情報を受け取る
    this.authService.fetchCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  /** メニューボタンがクリックされたとき */
  public onMenuClick(): void {
    this.menuClick.emit(); // 親にイベントを通知するだけ
  }
}
