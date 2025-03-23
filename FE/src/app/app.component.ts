import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ProductAddComponent } from './page/product/function/product-add/product-add.component';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ProductAddComponent],
  template: `
    <main>
      <app-product-add-modal></app-product-add-modal>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  title = 'FE';
}
