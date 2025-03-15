import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../service/comment/comment.service';
import { Comment } from '../../model/comment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading = true;

    this.commentService.getAllComments().subscribe({
      next: (response) => {
        this.comments = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
        this.isLoading = false;
      },
    });
  }
}
