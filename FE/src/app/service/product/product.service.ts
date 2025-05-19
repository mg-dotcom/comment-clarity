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
  ProductResponseWithComments,
} from '../../model/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  router = inject(Router);
  authService = inject(AuthService);
  apiUrl = environment.apiUrl;

  constructor() {}

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
      this.router.navigate(['/product']);
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  async getProductWithAllComments(
    productId: number
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
      this.router.navigate(['/product']);
      throw new Error('Failed to fetch comments');
    }

    console.log('response:', response);
    return response.json();
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
      this.router.navigate(['/product']);
      throw new Error('Failed to fetch product');
    }

    return response.json();
  }

  async getProductCommentRating(
    productId: number
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
      this.router.navigate(['/product']);
      throw new Error('Failed to fetch product ratings');
    }

    return response.json();
  }

  async getProductCategoryAverage(
    productId: number,
    categoryName?: string
  ): Promise<ProductSentimentResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    let url = `${this.apiUrl}/product/${productId}/result/category-average`;
    if (categoryName && categoryName.trim() !== '') {
      url += `?name=${encodeURIComponent(categoryName.trim())}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.router.navigate(['/product']);
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to fetch product sentiment (${response.status})`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getProductCategoryCommentsSentiment(
    productId: number,
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
      this.router.navigate(['/product']);
      throw new Error('Failed to fetch product category comments sentiment');
    }

    return response.json();
  }

  async deleteProduct(productId: number): Promise<ProductResponse> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(`${this.apiUrl}/product/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      this.router.navigate(['/product']);
      throw new Error('Failed to delete product');
    }

    return response.json();
  }

  async addProduct(
    productName: string,
    productLink: string,
    startDate: string,
    endDate: string,
    signal?: AbortSignal
  ): Promise<ProductResponseWithComments> {
    const accessToken = await this.authService.getToken();

    if (!accessToken) {
      this.router.navigate(['/login']);
      throw new Error('Access token not found');
    }

    const response = await fetch(`${this.apiUrl}/product/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: productName,
        productLink: productLink,
        startDate: startDate,
        endDate: endDate,
      }),
      signal, // Pass the signal to fetch
    });

    if (!response.ok) {
      throw new Error('Failed to add product');
    }

    return response.json();
  }
}
