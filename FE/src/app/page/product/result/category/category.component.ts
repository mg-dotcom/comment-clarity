import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../service/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ProductRatings } from '../../../../model/product';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);

  activeTab: 'category' | 'review' = 'category';
  categories = [
    { name: 'Product', image: '/result-pic/product.png' },
    { name: 'Delivery', image: '/result-pic/delivery.png' },
    { name: 'Service', image: '/result-pic/service.png' },
    { name: 'Other', image: '/result-pic/other.png' },
  ];

  ratings: { score: number; comments: number }[] = [];
  productId: number = 0;
  isLoading = false;
  error: string | null = null;

  setActiveTab(tab: 'category' | 'review'): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    try {
      this.activatedRoute.params.subscribe((params) => {
        this.productId = Number(params['productId']);
        this.loadProductRatings(this.productId);
      });
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.error = 'Failed to initialize component';
    }
  }

  async loadProductRatings(productId: string | number): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.productService.getProductCommentRating(
        productId.toString()
      );

      if (response && response.success) {
        const ratingData = response.data.ratings;

        this.ratings = [
          { score: 5.0, comments: ratingData['5-star'] },
          { score: 4.0, comments: ratingData['4-star'] },
          { score: 3.0, comments: ratingData['3-star'] },
          { score: 2.0, comments: ratingData['2-star'] },
          { score: 1.0, comments: ratingData['1-star'] },
        ];
      }
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      this.error = 'Failed to load product ratings';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToCategory(category: string): void {
    this.router.navigate(
      [`/product/${this.productId}/result/category-details`],
      {
        queryParams: { name: category },
      }
    );
  }
}
