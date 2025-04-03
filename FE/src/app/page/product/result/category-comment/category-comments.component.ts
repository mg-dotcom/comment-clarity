import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-comments',
  imports: [],
  templateUrl: './category-comments.component.html',
  styleUrl: './category-comments.component.css',
})
export class CategoryCommentsComponent implements OnInit {
  productId: string = '';
  categoryName: string = '';
  sentiment: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe((params) => {
      this.productId = params['productId'];
    });

    this.route.queryParamMap.subscribe((queryParams) => {
      this.categoryName = queryParams.get('name') || '';
      this.sentiment = queryParams.get('sentiment') || '';
    });
  }

  ngOnInit() {
    this.loadProductCategoryCommentsSentiment(
      this.productId,
      this.categoryName,
      this.sentiment
    );
  }

  loadProductCategoryCommentsSentiment(
    productId: string,
    categoryName: string,
    sentiment: string
  ) {}
}
