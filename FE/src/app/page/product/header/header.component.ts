import { Component } from '@angular/core';
import { AuthService } from '../../../service/authentication/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  providers: [AuthService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);

  currentUser = {
    firstName:
      (this.authService.getUser() as { firstName?: string; lastName?: string })
        ?.firstName || '',
    lastName:
      (this.authService.getUser() as { firstName?: string; lastName?: string })
        ?.lastName || '',
  };
}
