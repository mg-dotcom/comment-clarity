import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../product/sidebar/sidebar.component';
import { HeaderComponent } from '../../product/header/header.component';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { inject } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.css',
})
export class BaseLayoutComponent {
  router = inject(Router);
  hasProducts = false;
  isLoading = false;
  error: string | null = null;

  showAddProductModal = false;

  constructor() {}

  // base-layout.component.ts
  ngOnInit() {
    // ติดตามการเปลี่ยนแปลง URL
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        // เช็คว่า URL ปัจจุบันเป็น product/add หรือไม่
        this.showAddProductModal =
          event.urlAfterRedirects.includes('/product/add');
      });
  }

  hideAddProductModal() {
    this.showAddProductModal = false;
    // นำทางกลับไปยังหน้า product หลัก
    this.router.navigate(['/product']);
  }
}
