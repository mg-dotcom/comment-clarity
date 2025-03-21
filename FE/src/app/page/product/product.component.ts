import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../model/comment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {}
}
