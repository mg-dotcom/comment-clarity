import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../service/product/product.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { inject } from '@angular/core';
import { CategorySentiment, ProductSentiment } from '../../../../model/product';
import { Chart } from 'chart.js/auto'; // ✅ Chart.js

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);

  chart: Chart | null = null;

  activeTab: 'category' | 'review' = 'category';
  sentimentData: any = null; // Using any to accommodate potentially flattened structure
  categories = [
    { name: 'Product', image: '/result-pic/product.png' },
    { name: 'Delivery', image: '/result-pic/delivery.png' },
    { name: 'Service', image: '/result-pic/service.png' },
    { name: 'Other', image: '/result-pic/other.png' },
  ];
  sentimentColors: Record<string, string> = {
    Negative: '#FF5252',
    Neutral: '#FFCA28',
    None: '#9E9E9E',
    Positive: '#4CAF50',
  };

  ratings: { score: number; comments: number }[] = [];
  productId: number = 0;
  isLoading = false;
  error: string | null = null;

  setActiveTab(tab: 'category' | 'review'): void {
    this.activeTab = tab;

    if (this.activeTab === 'review') {
      setTimeout(() => {
        this.createPieChart();
      }, 100);
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = Number(params['productId']);
      this.loadProductRatings(this.productId);
      this.loadProductAverageSentiment(this.productId);
    });
  }

  ngAfterViewInit() {}

  async loadProductRatings(productId: string | number): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.productService.getProductCommentRating(
        productId.toString()
      );

      if (response && response.success) {
        const ratingData = response.data.ratings;
        this.ratings = [
          { score: 5.0, comments: ratingData['5-star'] },
          { score: 4.0, comments: ratingData['4-star'] },
          { score: 3.0, comments: ratingData['3-star'] },
          { score: 2.0, comments: ratingData['2-star'] },
          { score: 1.0, comments: ratingData['1-star'] },
        ];
      }
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      this.error = 'Failed to load product ratings';
    } finally {
      this.isLoading = false;
    }
  }

  async loadProductAverageSentiment(productId: string | number): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.productService.getProductCategoryAverage(
        productId.toString()
      );

      if (response && response.success && response.data) {
        console.log('Sentiment data received:', response.data);
        this.sentimentData = response.data;
        setTimeout(() => this.createPieChart(), 100);
      } else {
        this.sentimentData = {};
      }
    } catch (error) {
      console.error('Error fetching product sentiment:', error);
      this.error = 'Failed to load product sentiment';
    } finally {
      this.isLoading = false;
    }
  }

  createPieChart(): void {
    console.log('Creating pie chart. Data:', this.sentimentData);
    if (!this.sentimentData || !this.pieChartCanvas) {
      console.log('Missing data or canvas element');
      return;
    }

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Could not get 2D context from canvas');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const sentimentMapping: Record<string, string> = {
      'negative (%)': 'Negative',
      'neutral (%)': 'Neutral',
      'none (%)': 'None',
      'positive (%)': 'Positive',
    };

    const chartData: number[] = [];
    const chartLabels: string[] = [];
    const chartColors: string[] = [];

    for (const [key, label] of Object.entries(sentimentMapping)) {
      const value = this.getSentimentValue(key);

      if (value > 0) {
        chartLabels.push(label);
        chartData.push(value);
        chartColors.push(this.sentimentColors[label] || '#CCCCCC');
      }
    }

    console.log('Chart data:', { chartData, chartLabels, chartColors });

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartData,
            backgroundColor: chartColors,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                return `${label}: ${value.toFixed(1)}%`;
              },
            },
          },
        },
      },
    });
  }

  getSentimentValue(key: string): number {
    if (!this.sentimentData) return 0;

    // First, check if the key exists directly in sentimentData (flattened structure)
    if (key in this.sentimentData) {
      const value = this.sentimentData[key];
      return typeof value === 'number' ? value : 0;
    }

    // If not found directly, it might be nested in a structure
    // For example, check if the data is organized by categories
    for (const category of Object.keys(this.sentimentData)) {
      const categoryData = this.sentimentData[category];
      if (
        categoryData &&
        typeof categoryData === 'object' &&
        key in categoryData
      ) {
        const value = categoryData[key];
        return typeof value === 'number' ? value : 0;
      }
    }

    return 0;
  }

  formatValue(value: number): string {
    return value.toFixed(1);
  }

  getTotalSentiment(): number {
    if (!this.sentimentData) return 0;
    return (
      this.getSentimentValue('negative (%)') +
      this.getSentimentValue('neutral (%)') +
      this.getSentimentValue('none (%)') +
      this.getSentimentValue('positive (%)')
    );
  }

  navigateToCategory(category: string): void {
    this.router.navigate(
      [`/product/${this.productId}/result/category-details`],
      { queryParams: { name: category } }
    );
  }
}
