import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../service/product/product.service';
import { inject } from '@angular/core';
import { Product } from '../../../model/product';

@Component({
  selector: 'app-product',
  standalone: true, // Add this if using standalone components
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  currentProduct: Product = {
    productId: 0,
    productName: '',
    startDate: '',
    endDate: '',
    createdAt: '',
  };
  isLoading = false;
  error: string | null = null;
  isSidebarOpen = false;
  productId: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      if (this.productId) {
        this.loadProductById(this.productId);
      }
    });
  }

  onToggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateToComments(): void {
    this.router.navigate(['/product', this.productId, 'comments']);
  }

  navigateToResult(): void {
    this.router.navigate(['/product', this.productId, 'result', 'category']);
  }

  async loadProductById(productId: number): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.productService.getProdutById(productId);

      if (response && response.data) {
        console.log('Raw response data:', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.currentProduct = response.data[0] as Product;
        } else if (typeof response.data === 'object') {
          this.currentProduct = response.data as unknown as Product;
          this.currentProduct = {
            productId: this.currentProduct.productId,
            productName: this.currentProduct.productName,
            startDate: this.currentProduct.startDate,
            endDate: this.currentProduct.endDate,
            createdAt: this.currentProduct.createdAt,
          };
        } else {
          this.error = 'Invalid data format';
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      this.error =
        err instanceof Error ? err.message : 'Failed to load product';
      this.currentProduct = {
        productId: 0,
        productName: '',
        startDate: '',
        endDate: '',
        createdAt: '',
      };
    } finally {
      this.isLoading = false;
    }
  }
}
