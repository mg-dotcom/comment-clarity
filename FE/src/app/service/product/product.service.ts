import { Injectable } from '@angular/core';
import { CommentsResponse } from '../../model/comment';
import { environment } from '../../../environment/environment';
import { AuthService } from '../authentication/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router) {}

  async getAllComments(productId: string): Promise<CommentsResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `${this.apiUrl}/product/${productId}/comments`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  }
}
