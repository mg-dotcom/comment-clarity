import { Component } from '@angular/core';
import { SidebarComponent } from '../../home/sidebar/sidebar.component';
import { HeaderComponent } from '../../home/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-base-layout',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.css',
})
export class BaseLayoutComponent {}
