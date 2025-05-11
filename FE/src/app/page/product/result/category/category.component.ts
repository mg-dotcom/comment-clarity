import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../service/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PieChartComponent } from '../piechart/piechart.component';
import { ProductStoreService } from '../../../../store/product-store.service';
import { ProductSentiment } from '../../../../model/product';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, PieChartComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  activatedRoute = inject(ActivatedRoute);
  productService = inject(ProductService);
  store = inject(ProductStoreService);
  router = inject(Router);

  sentimentData = this.store.sentimentData;
  ratings = this.store.ratings;
  isLoading = this.store.loading;
  error = this.store.error;

  activeTab: 'category' | 'review' = 'category';
  categories = [
    { name: 'Product', image: '/result-pic/product.png' },
    { name: 'Delivery', image: '/result-pic/delivery.png' },
    { name: 'Service', image: '/result-pic/service.png' },
    { name: 'Other', image: '/result-pic/other.png' },
  ];
  productId: number = 0;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      console.log('Product ID:', this.productId);
      if (this.productId) {
        this.store.loadProductRatings(this.productId);
        this.store.loadProductAverageSentiment(this.productId);
      }
    });
  }

  ngAfterViewInit() {}

  navigateToCategory(category: string): void {
    this.router.navigate(
      [`/product/${this.productId}/result/category-details`],
      { queryParams: { name: category } }
    );
  }

  refreshProductRatings(): void {
    this.store.loadProductRatings(this.productId);
  }

  setActiveTab(tab: 'category' | 'review'): void {
    this.activeTab = tab;
  }

  getSentimentValue(type: keyof ProductSentiment): number {
    const data = this.sentimentData() as ProductSentiment;
    return data[type] || 0;
  }

  formatValue(value: number): string {
    return value.toFixed(1);
  }

  getTotalSentiment(): number {
    const data = this.sentimentData();
    if (!data) return 0;

    return (
      (data['negative (%)'] || 0) +
      (data['positive (%)'] || 0) +
      (data['neutral (%)'] || 0)
    );
  }
}
