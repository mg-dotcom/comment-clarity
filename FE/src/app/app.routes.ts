import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'product',
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
    path: 'product',
    loadComponent: () =>
      import('./page/layout/base-layout/base-layout.component').then(
        (m) => m.BaseLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./page/product/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: ':productId',
        loadComponent: () =>
          import('./page/product/product-main/product.component').then(
            (m) => m.ProductComponent
          ),
      },
      {
        path: ':productId/comments',
        loadComponent: () =>
          import('./page/product/product-comment/all-comment.component').then(
            (m) => m.AllCommentComponent
          ),
      },
      {
        path: 'analytics/top-comment',
        loadComponent: () =>
          import(
            './page/product/result/product-top-comment/product-top-comment.component'
          ).then((m) => m.ProductTopCommentComponent),
      },
    ],
  },
];
