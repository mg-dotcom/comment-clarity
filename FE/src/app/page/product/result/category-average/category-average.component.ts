import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { ProductService } from '../../../../service/product/product.service';
import { ProductSentiment } from '../../../../model/product';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { PieChartComponent } from '../piechart/piechart.component';
import { ProductStoreService } from '../../../../store/product-store.service';

@Component({
  selector: 'app-category-average',
  standalone: true,
  imports: [CommonModule, PieChartComponent],
  templateUrl: './category-average.component.html',
  styleUrl: './category-average.component.css',
})
export class CategoryAverageComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  activatedRoute = inject(ActivatedRoute);
  store = inject(ProductStoreService);
  router = inject(Router);
  productService = inject(ProductService);

  productId: number = 0;
  categoryName: string = '';

  sentimentData = this.store.sentimentData;
  isLoading = this.store.loading;
  error = this.store.error;

  sentimentColors: Record<string, string> = {
    Negative: '#FF5252',
    Neutral: '#FFCA28',
    Positive: '#4CAF50'
  };

  chart: Chart | null = null;
  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      this.activatedRoute.queryParams.subscribe((queryParams) => {
        this.categoryName = queryParams['name'] || '';
        if (this.productId) {
          this.store.loadProductAverageSentiment(
            this.productId,
            this.categoryName
          );
        }
      });
    });
  }
  ngAfterViewInit() {}

  refreshProductCategoryAverage(): void {
    this.store.loadProductAverageSentiment(this.productId, this.categoryName);
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
