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
        path: 'separation-criteria',
        loadComponent: () =>
          import(
            './page/product/separation-criteria/separation-criteria.component'
          ).then((m) => m.SeparationCriteriaComponent),
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
        path: ':productId/result/category',
        loadComponent: () =>
          import('./page/product/result/category/category.component').then(
            (m) => m.CategoryComponent
          ),
      },
      {
        path: ':productId/result/category-details',
        loadComponent: () =>
          import(
            './page/product/result/category-average/category-average.component'
          ).then((m) => m.CategoryAverageComponent),
      },
      {
        path: ':productId/result/category-details/comments',
        loadComponent: () =>
          import(
            './page/product/result/category-comment/category-comments.component'
          ).then((m) => m.CategoryCommentsComponent),
      },
    ],
  },
];
