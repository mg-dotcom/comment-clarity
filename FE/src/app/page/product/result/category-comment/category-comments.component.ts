import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ProductStoreService } from '../../../../store/product-store.service';
@Component({
  selector: 'app-category-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-comments.component.html',
  styleUrl: './category-comments.component.css',
})
export class CategoryCommentsComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  store = inject(ProductStoreService);
  router = inject(Router);

  productId: number = 0;
  categoryName: string = '';
  sentiment: string = '';

  isLoading = this.store.loading;
  error = this.store.error;
  commentsSentiment = this.store.commentsSentiment;

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      this.activatedRoute.queryParams.subscribe((queryParams) => {
        this.categoryName = queryParams['name'] || '';
        this.sentiment = queryParams['sentiment'] || '';
        if (this.productId) {
          this.store.loadProductCategoryCommentsSentiment(
            this.productId,
            this.categoryName,
            this.sentiment
          );
        }
      });
    });
  }

  refreshLoadProductCategoryCommentsSentiment() {
    console.log(this.commentsSentiment());
    this.store.loadProductCategoryCommentsSentiment(
      this.productId,
      this.categoryName,
      this.sentiment
    );
  }
}
