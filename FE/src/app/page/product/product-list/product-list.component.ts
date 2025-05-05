import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProductService } from '../../../service/product/product.service';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductStoreService } from '../../../store/product-store.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  store = inject(ProductStoreService);
  router = inject(Router);

  products = this.store.products;
  isLoading = this.store.loading;
  error = this.store.error;

  constructor() {}

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnInit() {
    this.store.loadProducts();
  }

  refreshProducts(): void {
    this.store.loadProducts();
  }

  deleteProduct(productId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      this.store.deleteProduct(productId);
    }
  }
}
