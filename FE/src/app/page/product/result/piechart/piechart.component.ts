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

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-[350px] h-[350px] mx-auto">
      <canvas #pieCanvas></canvas>
    </div>
  `,
})
export class PieChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: ProductSentiment = DefaultSentiment;
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
}
