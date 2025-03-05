import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
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
