import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../model/comment';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../service/product/product.service';
import { inject } from '@angular/core';
import { Product } from '../../../model/product';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  product: Product[] = [];
  isLoading = false;
  error: string | null = null;
  isSidebarOpen = false;
  productId: string = '';

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = params['productId'];
    });
    // this.loadProductById(this.productId);
  }

  onToggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // สลับค่า true/false
  }

  constructor() {}

  navigateToComments(): void {
    this.router.navigate(['/product', this.productId, 'comments']);
  }

  // async loadProductById(productId: string): Promise<void> {
  //   this.isLoading = true;
  //   this.error = null;

  //   try {
  //     const response = await this.productService.getProdutById(productId);
  //     if (response && response.data) {
  //       this.product = response.data;
  //     } else {
  //       this.error = 'No product found';
  //       this.product = [];
  //     }
  //   } catch (err) {
  //     console.error('Error fetching product:', err);
  //     this.error =
  //       err instanceof Error ? err.message : 'Failed to load product';
  //     this.product = [];
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }
}
