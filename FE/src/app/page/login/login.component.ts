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
  private authService = inject(AuthService);
  private productService = inject(ProductService);
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
      if (status === 'success') {
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

  // ถ้ามียังไม่มี Product List ให้ redirect ไปที่ firstProduct ของ User
  // async onSubmit(): Promise<void> {
  //   if (this.loginForm.invalid) {
  //     this.error = 'Please fill in all required fields correctly.';
  //     return;
  //   }

  //   this.loading = true;
  //   const { email, password } = this.loginForm.value;

  //   try {
  //     const status = await this.authService.login(email, password);
  //     if (status === 'success') {
  //       if (this.route.snapshot.queryParams['returnUrl']) {
  //         this.router.navigateByUrl(
  //           this.route.snapshot.queryParams['returnUrl']
  //         );
  //         return;
  //       }

  //       try {
  //         const firstProduct = await this.productService.getUserFirstProduct();

  //         if (firstProduct && firstProduct.productId) {
  //           // ถ้ามีสินค้า ให้ redirect ไปที่หน้ารายละเอียดของสินค้าแรก
  //           this.router.navigate(['/product', firstProduct.productId]);
  //         } else {
  //           this.router.navigate(['/product']);
  //         }
  //       } catch (productErr) {
  //         console.error('Error fetching user products:', productErr);
  //         this.router.navigate(['/product']);
  //       }
  //     } else {
  //       this.error = 'Invalid email or password';
  //     }
  //   } catch (err: any) {
  //     this.error = err?.message || 'An error occurred during login';
  //   } finally {
  //     this.loading = false;
  //   }
  // }
}
