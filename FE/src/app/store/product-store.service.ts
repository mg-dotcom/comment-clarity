import { Injectable, signal, computed } from '@angular/core';
import { ProductService } from '../service/product/product.service';
import { Product, ProductSentiment, DefaultSentiment } from '../model/product';
import {
  Comment,
  CommentCategorySentiment,
  CommentsSentimentData,
} from '../model/comment';

@Injectable({ providedIn: 'root' })
export class ProductStoreService {
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _product = signal<Product | null>(null);
  private _comments = signal<Comment[]>([]);
  private _commentsSentiment = signal<CommentCategorySentiment[]>([]);
  private _ratings = signal<{ score: number; comments: number }[]>([]);
  private _sentimentData = signal<ProductSentiment | null>(null);

  products = computed(() => this._products());
  product = computed(() => this._product());
  comments = computed(() => this._comments());
  commentsSentiment = computed(() => this._commentsSentiment());
  ratings = computed(() => this._ratings());
  sentimentData = computed(() => this._sentimentData() ?? DefaultSentiment);
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  constructor(private productService: ProductService) {}

  async loadProducts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await this.productService.getAllProducts();
      if (response.status === 'success' && response.data) {
        this._products.set(response.data);
      } else {
        this._products.set([]);
        this._error.set('No products found');
      }
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
      this._products.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  async loadProductById(productId: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await this.productService.getProdutById(productId);
      if (response.status === 'success' && response.data) {
        const productData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        this._product.set(productData as Product);
      } else {
        this._product.set(null);
        this._error.set('No product found');
      }
    } catch (err: unknown) {
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
      this._product.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async loadCommentsByProductId(productId: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await this.productService.getProductWithAllComments(
        productId
      );
      if (response.status === 'success' && response.data) {
        const productData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        this._comments.set(productData.comments || []);
      } else {
        this._comments.set([]);
        this._error.set('No product found');
      }
    } catch (err: unknown) {
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
      this._comments.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  async loadProductRatings(productId: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await this.productService.getProductCommentRating(
        productId
      );
      if (response && response.success) {
        const ratingData = response.data.ratings;
        this._ratings.set([
          { score: 5.0, comments: ratingData['5-star'] },
          { score: 4.0, comments: ratingData['4-star'] },
          { score: 3.0, comments: ratingData['3-star'] },
          { score: 2.0, comments: ratingData['2-star'] },
          { score: 1.0, comments: ratingData['1-star'] },
        ]);
      } else {
        this._ratings.set([]);
        this._error.set('No product found');
      }
    } catch (err) {
      this._ratings.set([]);
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      this._loading.set(false);
    }
  }

  async loadProductAverageSentiment(
    productId: number,
    categoryName?: string
  ): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const response = await this.productService.getProductCategoryAverage(
        productId,
        categoryName
      );
      if (response && response.success) {
        const data = response.data;

        // ตรวจสอบรูปแบบข้อมูลที่ได้รับ
        if (categoryName && typeof data === 'object' && data !== null) {
          // กรณีมี categoryName จะได้รับข้อมูลในรูปแบบ { "product": { ... } }
          const categoryData = data[categoryName];
          if (
            categoryData &&
            typeof categoryData === 'object' &&
            'positive (%)' in categoryData
          ) {
            this._sentimentData.set(categoryData);
            console.log(
              'Sentiment data for category:',
              categoryName,
              categoryData
            );
          } else {
            this._sentimentData.set(null);
            this._error.set(
              `Invalid data format for category: ${categoryName}`
            );
          }
        } else {
          // กรณีไม่มี categoryName จะได้รับข้อมูลในรูปแบบ { "negative (%)": 0, ... }
          if (
            typeof data === 'object' &&
            data !== null &&
            'positive (%)' in data
          ) {
            this._sentimentData.set(data as ProductSentiment);
            console.log('Sentiment data:', data);
          } else {
            this._sentimentData.set(null);
            this._error.set('Invalid data format');
          }
        }
      } else {
        this._sentimentData.set(null);
        this._error.set('No product found');
      }
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Unknown error');
      this._sentimentData.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async loadProductCategoryCommentsSentiment(
    productId: number,
    categoryName: string,
    sentiment: string
  ): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    this._commentsSentiment.set([]);
    if (!productId || !categoryName || !sentiment) {
      this._error.set('Missing required parameters');
      this._loading.set(false);
      return;
    }
    try {
      const response =
        await this.productService.getProductCategoryCommentsSentiment(
          productId,
          categoryName,
          sentiment
        );
      if (response && response.success) {
        const data = response.data;

        const rawSentimentData = data[sentiment];
        const sentimentEntry =
          typeof rawSentimentData === 'object' && rawSentimentData !== null
            ? (rawSentimentData as CommentsSentimentData)
            : undefined;

        if (sentimentEntry && Array.isArray(sentimentEntry.comments)) {
          this._commentsSentiment.set(sentimentEntry.comments);
        } else {
          this._error.set(`No data available for ${sentiment} sentiment`);
          this._commentsSentiment.set([]);
        }
      } else {
        this._error.set(response.message || 'Failed to fetch comments');
      }
    } catch (err) {
      this._error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      this._loading.set(false);
    }
  }
  clear() {
    this._products.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
