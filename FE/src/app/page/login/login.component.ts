import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  constructor(private router: Router) {}
  onLogin() {
    this.router.navigate(['/home']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
