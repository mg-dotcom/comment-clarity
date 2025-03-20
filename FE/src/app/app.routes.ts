import { Routes } from '@angular/router';

export const routes: Routes = [
  // FIXME: Fix ' ' to 'home' after implementing the security feature
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./page/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./page/layout/base-layout/base-layout.component').then(
        (m) => m.BaseLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./page/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'home/comment',
        loadComponent: () =>
          import('./page/home/all-comment/all-comment.component').then(
            (m) => m.AllCommentComponent
          ),
      },
    ],
  },

  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  // { path: '**', redirectTo: '/home' }, // Handle unknown routes
];
