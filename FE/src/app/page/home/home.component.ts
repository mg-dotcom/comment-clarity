import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../service/comment/comment.service';
import { Comment } from '../../model/comment';
import { AuthService } from '../../service/authentication/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [AuthService],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;
  currentUser = {
    firstName:
      (this.authService.getUser() as { firstName?: string; lastName?: string })
        ?.firstName || '',
    lastName:
      (this.authService.getUser() as { firstName?: string; lastName?: string })
        ?.lastName || '',
  };

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
  }

  async loadComments(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await this.commentService.getAllComments();
      this.comments = response.data;
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
