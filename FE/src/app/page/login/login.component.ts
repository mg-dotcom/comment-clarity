import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/authentication/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AuthService],
})
export class LoginComponent {
  private authService = inject(AuthService);
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      const response = await this.authService.login(email, password);
      if (response === 'success') {
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.error = 'Invalid email or password';
      }
    } catch (err: any) {
      this.error = err?.message || 'An error occurred during login';
    } finally {
      this.loading = false;
    }
  }
}
