import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../../../service/authentication/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  providers: [AuthService],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  isSidebarOpen = false;
  private resizeListener!: () => void;

  constructor() {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.resizeListener = () => this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  private checkScreenSize(): void {
    if (window.innerWidth >= 1024) {
      this.isSidebarOpen = false;
    }
  }

  onToggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
  }
}
