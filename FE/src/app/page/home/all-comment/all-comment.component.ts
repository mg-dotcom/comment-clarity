import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-comment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-comment.component.html',
  styleUrl: './all-comment.component.css',
})
export class AllCommentComponent {}
