import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { ProductStoreService } from '../../../store/product-store.service';

@Component({
  selector: 'app-all-comment',
  imports: [CommonModule],
  templateUrl: './all-comment.component.html',
  styleUrl: './all-comment.component.css',
})
export class AllCommentComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  store = inject(ProductStoreService);

  comments = this.store.comments;
  isLoading = this.store.loading;
  error = this.store.error;

  productId: number = 0;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      if (this.productId) {
        this.store.loadCommentsByProductId(this.productId);
        console.log(this.productId);
      }
    });
  }

  refreshComments(): void {
    if (this.productId) {
      this.store.loadCommentsByProductId(this.productId);
    }
  }

  constructor() {}
}
