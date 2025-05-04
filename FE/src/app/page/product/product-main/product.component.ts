import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../service/product/product.service';
import { inject } from '@angular/core';
import { Product } from '../../../model/product';
import { ProductStoreService } from '../../../store/product-store.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  productService = inject(ProductService);
  router = inject(Router);
  store = inject(ProductStoreService);

  product = this.store.product;
  isLoading = this.store.loading;
  error = this.store.error;

  isSidebarOpen = false;
  productId: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      if (this.productId) {
        this.store.loadProductById(this.productId);
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
}
