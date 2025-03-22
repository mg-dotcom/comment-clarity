import { Component } from '@angular/core';
import { AuthService } from '../../../service/authentication/auth.service';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  providers: [AuthService],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  isSidebarOpen = false;

  async onLogout(): Promise<void> {
    this.authService.logout();
  }

  onToggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // สลับค่า true/false
  }
}
