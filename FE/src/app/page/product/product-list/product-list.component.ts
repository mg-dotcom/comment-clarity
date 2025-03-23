import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  constructor() {}

  goToProductDetail(): void {
    console.log('goToProductDetail');
  }

  ngOnInit() {
    console.log('ProductListComponent');
  }
}
