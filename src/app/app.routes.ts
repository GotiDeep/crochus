import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // =========================================================================
  // 1. PUBLIC WEBSITE ROUTES (Shares BeforeLoginLayout with Common Header & Footer)
  // =========================================================================
  {
    path: '',
    loadComponent: () =>
      import('./layout/before-login-layout/before-login-layout').then(m => m.BeforeLoginLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop').then(m => m.ShopComponent)
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
        canActivate: [authGuard]
      },
      {
        path: 'order',
        loadComponent: () => import('./pages/order-form/order-form').then(m => m.OrderFormComponent),
        canActivate: [authGuard]
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.WishlistComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
      },
      {
        path: 'about-us',
        redirectTo: 'about',
        pathMatch: 'full'
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
      },
      {
        path: 'contact-us',
        redirectTo: 'contact',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // =========================================================================
  // 2. AUTHENTICATION PAGES (Standalone Layout - No Global Navbar)
  // =========================================================================
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'sign-in',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    redirectTo: 'register',
    pathMatch: 'full'
  },

  // =========================================================================
  // 3. ADMIN PORTAL ROUTES (Shares AfterLoginLayout with Sidebar & Header)
  // =========================================================================
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/dashboard/admin-login').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/after-login-layout/after-login-layout').then(m => m.AfterLoginLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/products/admin-products').then(m => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/categories/admin-categories').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/admin/orders/admin-orders').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/admin-settings').then(m => m.AdminSettingsComponent)
      }
    ]
  },

  // =========================================================================
  // 4. WILDCARD FALLBACK
  // =========================================================================
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];
