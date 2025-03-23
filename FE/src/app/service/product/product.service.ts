import { Injectable } from '@angular/core';
import { CommentsResponse } from '../../model/comment';
import { environment } from '../../../environment/environment';
import { AuthService } from '../authentication/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductResponse } from '../../model/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router) {}

  async getProductWithAllComments(productId: string): Promise<CommentsResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `${this.apiUrl}/product/${productId}/with-comments`,
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

  async getUserFirstProduct(): Promise<any> {
    try {
      const userId = this.authService.getCurrentUserId();

      if (!userId) {
        throw new Error('User ID not found');
      }

      const accessToken = await this.authService.getToken();

      if (!accessToken) {
        this.router.navigate(['/login']);
        throw new Error('Access token not found');
      }

      const response = await fetch(`${this.apiUrl}/users/firstProducts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user products: ${response.statusText}`
        );
      }

      const responseData = await response.json();

      const firstProduct = responseData?.data[0] || null;

      return firstProduct;
    } catch (error) {
      console.error('Error in getUserFirstProduct:', error);
      throw error;
    }
  }

  async getProdutById(productId: string): Promise<ProductResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(`${this.apiUrl}/product/${productId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  }
}
