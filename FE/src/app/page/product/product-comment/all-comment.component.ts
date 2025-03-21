import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../../../model/comment';
import { ProductService } from '../../../service/product/product.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-all-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-comment.component.html',
  styleUrl: './all-comment.component.css',
})
export class AllCommentComponent implements OnInit {
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  productId: string = '';

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = params['productId'];
      this.loadComments()
    });
  }

  constructor() {}

  async loadComments(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.productService.getAllComments(this.productId);
      if (response && response.data) {
        this.comments = response.data;
      } else {
        this.error = 'No comments found';
        this.comments = [];
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      this.error =
        err instanceof Error ? err.message : 'Failed to load comments';
      this.comments = [];
    } finally {
      this.isLoading = false;
    }
  }
}
