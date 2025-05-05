import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/authentication/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../service/product/product.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AuthService],
})
export class LoginComponent {
  router = inject(Router);
  authService = inject(AuthService);
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  // ถ้ามี Product List เเล้ว
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      const status = await this.authService.login(email, password);
      if (status) {
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/product';
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
