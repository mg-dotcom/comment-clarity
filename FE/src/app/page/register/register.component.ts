import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private router: Router
  ) { }
  
  onLogin() {
    this.router.navigate(['/home']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

}
