import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../service/product/product.service';
import {
  ProductSentimentCommentsData,
  CommentCategorySentiment,
} from '../../../../model/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-comments.component.html',
  styleUrl: './category-comments.component.css',
})
export class CategoryCommentsComponent implements OnInit {
  productId: string = '';
  categoryName: string = '';
  sentiment: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  categoryComments: CommentCategorySentiment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.route.params.subscribe((params) => {
      this.productId = params['productId'];
    });

    this.route.queryParamMap.subscribe((queryParams) => {
      this.categoryName = queryParams.get('name') || '';
      this.sentiment = queryParams.get('sentiment') || '';
    });
  }

  ngOnInit() {
    this.loadProductCategoryCommentsSentiment();
  }

  async loadProductCategoryCommentsSentiment(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.categoryComments = [];

    if (!this.productId || !this.categoryName || !this.sentiment) {
      this.error = 'Missing required parameters';
      this.isLoading = false;
      return;
    }

    try {
      const response =
        await this.productService.getProductCategoryCommentsSentiment(
          this.productId,
          this.categoryName,
          this.sentiment
        );

      if (response.success && response.data) {
        const sentimentData = response.data as ProductSentimentCommentsData;
        const sentimentKey = this
          .sentiment as keyof ProductSentimentCommentsData;

        if (sentimentData[sentimentKey]) {
          this.categoryComments = sentimentData[sentimentKey].comments || [];
        } else {
          this.error = `No data available for ${this.sentiment} sentiment`;
        }
      } else {
        this.error = response.message || 'Failed to fetch comments';
      }
    } catch (error: any) {
      console.error('Error loading product category comments:', error);
      this.error = error.message || 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }
}
