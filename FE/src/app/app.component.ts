import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
  template: `
   <main>
      <router-outlet></router-outlet>
   </main>
  `
})
export class AppComponent {
  title = 'FE';
}
