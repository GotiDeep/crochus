import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    @if (isOpen) {
      <div class="overlay" (click)="close.emit()"></div>
      <nav class="slide-menu">
        <div class="menu-header">
          <a routerLink="/" (click)="close.emit()" class="mobile-logo-link">
            <img src="assets/logo.svg" alt="Crochus" class="menu-logo-img" />
          </a>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <ul class="menu-links">
          <li><a routerLink="/" (click)="close.emit()">Home</a></li>
          <li><a routerLink="/shop" (click)="close.emit()">Collection</a></li>

          <!-- Filters Collapsible Submenu -->
          <li class="filter-menu-item">
            <button class="filter-toggle-btn" (click)="toggleFilters()" aria-label="Toggle Category Filter">
              <span>🏷 Filter by Category</span>
              <span class="chevron" [class.open]="filtersOpen()">▾</span>
            </button>
            @if (filtersOpen()) {
              <ul class="filter-submenu">
                <li>
                  <a (click)="selectCategory(null)" class="sub-link">
                    ✨ All Pieces
                  </a>
                </li>
                @for (cat of categories(); track cat.id) {
                  <li>
                    <a (click)="selectCategory(cat.id)" class="sub-link">
                      {{ cat.name }}
                      @if (cat.product_count) {
                        <span class="cat-count">({{ cat.product_count }})</span>
                      }
                    </a>
                  </li>
                }
              </ul>
            }
          </li>

          <li><a routerLink="/wishlist" (click)="close.emit()">My Wishlist</a></li>
          <li><a routerLink="/about" (click)="close.emit()">Our Story</a></li>
          <li><a routerLink="/contact" (click)="close.emit()">Contact Us</a></li>
          <li>
            <a routerLink="/cart" (click)="close.emit()" class="cart-menu-link">
              <span>Shopping Cart</span>
              @if (cart.totalItems() > 0) {
                <span class="menu-cart-badge">{{ cart.totalItems() }}</span>
              }
            </a>
          </li>
        </ul>

        <div class="menu-footer">
          @if (auth.isLoggedIn()) {
            <a routerLink="/profile" class="btn btn-outline btn-full" (click)="close.emit()">My Profile & Orders</a>
            <button class="btn btn-ghost btn-full" style="margin-top:10px" (click)="logout()">Sign Out</button>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-full" (click)="close.emit()">Sign In</a>
            <a routerLink="/register" class="btn btn-outline btn-full" style="margin-top:10px" (click)="close.emit()">Create Account</a>
          }
        </div>
      </nav>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: var(--overlay);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 900;
      animation: fadeOverlay 0.25s ease;
    }

    .slide-menu {
      position: fixed;
      top: 0; right: 0;
      width: min(340px, 86vw);
      height: 100vh;
      background: var(--surface);
      z-index: 950;
      display: flex;
      flex-direction: column;
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 16px);
      animation: slideRight 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -8px 0 40px rgba(36, 30, 28, 0.16);
      overflow-y: auto;
    }

    @keyframes slideRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    @keyframes fadeOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-light);
    }

    .mobile-logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      user-select: none;
    }

    .menu-logo-img {
      height: var(--logo-height-menu, 38px);
      width: auto;
      display: block;
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
      filter: var(--logo-filter, none);
    }

    .close-btn {
      width: 44px; height: 44px; /* Touch target */
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    .menu-links {
      list-style: none;
      padding: 12px 0;
      flex: 1;

      li a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        padding: 12px 24px;
        font-size: 0.96rem;
        font-weight: 500;
        color: var(--text-primary);
        letter-spacing: 0.02em;
        border-left: 3px solid transparent;
        transition: all 0.15s ease;
        cursor: pointer;

        &:hover, &:active {
          background: var(--bg);
          border-left-color: var(--primary);
          color: var(--primary);
        }
      }
    }

    .menu-cart-badge {
      background: var(--primary);
      color: white;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
    }

    .filter-menu-item {
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
      margin: 4px 0;
    }

    .filter-toggle-btn {
      width: 100%;
      min-height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: none;
      border: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;

      &:hover { background: var(--bg); }
    }

    .chevron {
      font-size: 1.1rem;
      transition: transform 0.25s ease;
      display: inline-block;

      &.open { transform: rotate(180deg); }
    }

    .filter-submenu {
      list-style: none;
      background: var(--bg-warm);
      padding: 4px 0;

      li a.sub-link {
        padding: 10px 24px 10px 36px;
        font-size: 0.88rem;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 40px;

        &:hover {
          color: var(--primary);
          background: rgba(74, 92, 47, 0.08);
        }
      }

      .cat-count {
        font-size: 0.75rem;
        color: var(--accent);
        font-weight: 600;
      }
    }

    .menu-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border-light);
      background: var(--surface);
    }
  `]
})
export class HamburgerMenuComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  auth = inject(AuthService);
  cart = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  filtersOpen = signal(true);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  toggleFilters() {
    this.filtersOpen.update((v) => !v);
  }

  selectCategory(categoryId: number | null) {
    this.close.emit();
    if (categoryId === null) {
      this.router.navigate(['/shop'], { queryParams: {} });
    } else {
      this.router.navigate(['/shop'], { queryParams: { category: categoryId } });
    }
  }

  logout() {
    this.auth.logout();
    this.close.emit();
  }
}
