import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProductService } from '../../../service/product/product.service';
import { Product, ProductResponse } from '../../../model/product';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  private productService = inject(ProductService);
  products: Product[] = [];

  constructor(private router: Router) {}

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response: ProductResponse =
        await this.productService.getAllProducts();

      if (response?.status === 'success') {
        if (response.data?.length > 0) {
          this.products = response.data.map((item) => ({
            productId: item.productId,
            productName: item.productName,
          }));
        } else {
          this.products = [];
        }
      } else {
        this.error = 'API returned unsuccessful status';
        this.products = [];
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      this.error =
        err instanceof Error ? err.message : 'Failed to load products';
      this.products = [];
    } finally {
      this.isLoading = false;
    }
  }
}
