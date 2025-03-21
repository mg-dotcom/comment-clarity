import { Component } from '@angular/core';
import { AuthService } from '../../../service/authentication/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  providers: [AuthService],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  async onLogout(): Promise<void> {
    this.authService.logout();
  }
}
