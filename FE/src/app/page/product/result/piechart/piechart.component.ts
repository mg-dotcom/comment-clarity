import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import {
  ProductSentiment,
  DefaultSentiment,
  SentimentColors,
} from '../../../../model/product';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="w-full h-full mx-auto"
      [ngClass]="{
        'cursor-pointer': activeTab === 'category',
        'cursor-default': activeTab !== 'category'
      }"
    >
      <canvas #pieCanvas></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 350px;
        height: 350px;
        margin: 0 auto;
      }
    `,
  ],
})
export class PieChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() activeTab: 'category' | 'review' = 'category';
  @Input() data: ProductSentiment = DefaultSentiment;
  @Input() productId: number = 0;
  @Input() categoryName: string = '';

  router = inject(Router);
  sentimentColors: { [key: string]: string } = SentimentColors;
  chart: Chart | null = null;
  isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.isViewInitialized) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  createChart(): void {
    const ctx = this.pieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const labels = Object.keys(this.data).filter(
      (key) => this.data[key as keyof ProductSentiment] > 0
    );

    const displayLabels = labels.map((label) => {
      const mainLabel = label.split(' ')[0];
      return mainLabel.charAt(0).toUpperCase() + mainLabel.slice(1);
    });

    const chartData = labels.map(
      (key) => this.data[key as keyof ProductSentiment]
    );

    const chartColors = labels.map(
      (label) => this.sentimentColors[label] || '#ccc'
    );

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: displayLabels,
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
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const sentiment = labels[index].split(' ')[0].toLowerCase();
            this.navigateToComments(sentiment);
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const index = context.dataIndex;
                const value = Number(context.raw) || 0;
                return `${displayLabels[index]}: ${value.toFixed(1)}%`;
              },
            },
          },
        },
      },
    });
  }

  navigateToComments(sentiment: string): void {
    if (this.categoryName) {
      this.router.navigate(
        [`/product/${this.productId}/result/category-details/comments`],
        {
          queryParams: { name: `${this.categoryName}`, sentiment: sentiment },
        }
      );
    }
  }
}
