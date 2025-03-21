import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../product/sidebar/sidebar.component';
import { HeaderComponent } from '../../product/header/header.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.css',
})
export class BaseLayoutComponent implements OnInit {
  hasProducts = false;
  isLoading = false;
  error: string | null = null;

  constructor() {}

  ngOnInit() {
    this.checkForProducts();
  }

  private async checkForProducts(): Promise<void> {
    // You can implement this to check if there are products
    // For now, let's just set it to true to hide the alert
    this.hasProducts = false;
  }
}
