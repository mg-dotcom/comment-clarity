import { Injectable } from '@angular/core';
import { CommentsResponse } from '../../model/comment';
import { environment } from '../../../environment/environment';
import { AuthService } from '../authentication/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ProductResponse,
  ProductRatingResponse,
  ProductSentimentResponse,
} from '../../model/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router) {}

  async getAllProducts(): Promise<ProductResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(`${this.apiUrl}/product`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  async getProductWithAllComments(
    productId: string
  ): Promise<CommentsResponse> {
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

    console.log('response:', response);
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

  async getProdutById(productId: number): Promise<ProductResponse> {
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

  async getProductCommentRating(
    productId: string
  ): Promise<ProductRatingResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `${this.apiUrl}/product/${productId}/ratings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch product ratings');
    }

    return response.json();
  }

  async getProductCategoryAverage(
    productId: string,
    categoryName?: string
  ): Promise<ProductSentimentResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    let url = `${this.apiUrl}/product/${productId}/result/category-average`;
    if (categoryName) {
      url += `?name=${encodeURIComponent(categoryName)}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product category average');
    }

    return response.json();
  }

  async getProductCategoryCommentsSentiment(
    productId: string,
    categoryName: string,
    sentiment: string
  ): Promise<ProductSentimentResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    let url = `${this.apiUrl}/product/${productId}/result/category-comments`;
    if (categoryName) {
      url += `?name=${encodeURIComponent(categoryName)}`;
    }
    if (sentiment) {
      url += `&sentiment=${encodeURIComponent(sentiment)}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product category comments sentiment');
    }

    return response.json();
  }
}
