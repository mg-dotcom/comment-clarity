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

@Component({
  selector: 'app-category-average',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-average.component.html',
  styleUrl: './category-average.component.css',
})
export class CategoryAverageComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  productId: string = '';
  categoryName: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  categoryAverages: ProductSentiment | null = null;
  nonCategoryAverages: ProductSentiment = {
    'negative (%)': 0,
    'neutral (%)': 0,
    'none (%)': 0,
    'positive (%)': 0,
  };

  sentimentColors: Record<string, string> = {
    Negative: '#FF5252',
    Neutral: '#FFCA28',
    None: '#9E9E9E',
    Positive: '#4CAF50',
  };

  chart: Chart | null = null;

  private productService = inject(ProductService);

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe((params) => {
      this.productId = params['productId'];
      const encodedName = this.route.snapshot.queryParamMap.get('name');
      const decodedName = encodedName ? decodeURIComponent(encodedName) : null;
      this.categoryName = params['categoryName'] || decodedName || '';
    });
  }

  ngOnInit() {
    this.loadProductCategoryAverage(this.productId, this.categoryName);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createPieChart();
    }, 100);
  }

  async loadProductCategoryAverage(
    productId: string | number,
    categoryName?: string
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const response = await this.productService.getProductCategoryAverage(
        productId.toString(),
        categoryName
      );

      if (response && response.success && response.data) {
        const dataObject = response.data as Record<string, ProductSentiment>;
        const categoryKey = categoryName?.toLowerCase() || 'product';

        if (dataObject[categoryKey]) {
          this.categoryAverages = {
            'negative (%)': dataObject[categoryKey]['negative (%)'] || 0,
            'neutral (%)': dataObject[categoryKey]['neutral (%)'] || 0,
            'none (%)': dataObject[categoryKey]['none (%)'] || 0,
            'positive (%)': dataObject[categoryKey]['positive (%)'] || 0,
          };
        } else {
          this.categoryAverages = this.nonCategoryAverages;
        }

        console.log('Category Averages:', this.categoryAverages);
      } else {
        console.log('No data available, using defaults');
        this.categoryAverages = this.nonCategoryAverages;
      }

      setTimeout(() => {
        this.createPieChart();
      }, 100);
    } catch (error) {
      console.error('Error loading category averages:', error);
      this.error = 'Failed to load product category averages';
      this.categoryAverages = this.nonCategoryAverages;
    } finally {
      this.isLoading = false;
    }
  }

  createPieChart(): void {
    if (!this.categoryAverages || !this.pieChartCanvas) return;

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

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
      const value =
        this.categoryAverages &&
        key in this.categoryAverages &&
        typeof this.categoryAverages[key as keyof ProductSentiment] === 'number'
          ? (this.categoryAverages[key as keyof ProductSentiment] as number)
          : 0;

      if (value > 0) {
        chartLabels.push(label);
        chartData.push(value);
        chartColors.push(this.sentimentColors[label] || '#CCCCCC');
      }
    }

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
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const sentiment = chartLabels[index].toLowerCase();
            this.navigateToComments(sentiment);
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
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

  // Add this new method to handle navigation
  navigateToComments(sentiment: string): void {
    console.log('Navigating to comments for sentiment:', sentiment);
    this.router.navigate(
      [`/product/${this.productId}/result/category-details/comments`],
      {
        queryParams: { name: `${this.categoryName}`, sentiment: sentiment },
      }
    );
  }
  getSentimentValue(key: string): number {
    if (!this.categoryAverages) return 0;
    return typeof this.categoryAverages[key as keyof ProductSentiment] ===
      'number'
      ? (this.categoryAverages[key as keyof ProductSentiment] as number)
      : 0;
  }

  formatValue(value: number): string {
    return value.toFixed(1);
  }

  getTotalSentiment(): number {
    if (!this.categoryAverages) return 0;
    return (
      this.getSentimentValue('negative (%)') +
      this.getSentimentValue('neutral (%)') +
      this.getSentimentValue('none (%)') +
      this.getSentimentValue('positive (%)')
    );
  }
}
