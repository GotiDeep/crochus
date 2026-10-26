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
      <aside class="slide-menu" aria-label="Mobile Boutique Menu">
        <div class="menu-header">
          <a routerLink="/" (click)="close.emit()" class="mobile-logo-link">
            <img src="assets/logo.svg" alt="Crochus" class="menu-logo-img" />
          </a>
          <button class="close-btn" (click)="close.emit()" aria-label="Close Menu">✕</button>
        </div>

        <div class="menu-scroll-area">
          <div class="menu-section-tag">✦ Handmade & Crochet</div>

          <ul class="menu-links">
            <li><a routerLink="/" (click)="close.emit()">Home</a></li>
            <li><a routerLink="/shop" (click)="close.emit()">All Handmade Products</a></li>

            <!-- Categories Collapsible Submenu -->
            <li class="filter-menu-item">
              <button class="filter-toggle-btn" (click)="toggleFilters()">
                <span>Browse by Category</span>
                <span class="chevron" [class.open]="filtersOpen()">▾</span>
              </button>
              @if (filtersOpen()) {
                <ul class="filter-submenu">
                  <li>
                    <a (click)="selectCategory(null)" class="sub-link">
                      <span>All Products</span>
                    </a>
                  </li>
                  @for (cat of categories(); track cat.id) {
                    <li>
                      <a (click)="selectCategory(cat.id)" class="sub-link">
                        <span>{{ formatCategoryName(cat.name) }}</span>
                        @if (cat.product_count) {
                          <span class="cat-count">{{ cat.product_count }}</span>
                        }
                      </a>
                    </li>
                  }
                </ul>
              }
            </li>

            <li><a routerLink="/wishlist" (click)="close.emit()">Saved Items</a></li>
            <li><a routerLink="/cart" (click)="close.emit()">Shopping Bag ({{ cart.totalItems() }})</a></li>
            <li><a routerLink="/about" (click)="close.emit()">About Us</a></li>
            <li><a routerLink="/contact" (click)="close.emit()">Contact Us</a></li>
          </ul>

          <div class="menu-concierge-card">
            <span class="mc-tag">Need Help or Custom Orders?</span>
            <p>Chat directly with our team on WhatsApp for custom colors, sizes, or gift questions.</p>
          </div>
        </div>

        <div class="menu-footer">
          @if (auth.isLoggedIn()) {
            <a routerLink="/profile" class="btn btn-outline btn-full" (click)="close.emit()">My Account</a>
            <button class="btn btn-ghost btn-full" style="margin-top:10px" (click)="logout()">Sign Out</button>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-full" (click)="close.emit()">Sign In</a>
            <a routerLink="/register" class="btn btn-outline btn-full" style="margin-top:10px" (click)="close.emit()">Create Account</a>
          }
        </div>
      </aside>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(44, 58, 26, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 900;
      animation: fadeOverlay 0.25s ease;
    }

    .slide-menu {
      position: fixed;
      top: 0; right: 0;
      width: min(340px, 86vw);
      height: 100vh;
      background: var(--c-surface);
      z-index: 950;
      display: flex;
      flex-direction: column;
      animation: slideRight 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -12px 0 48px rgba(0, 0, 0, 0.2);
      border-left: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
    }

    .menu-scroll-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;
    }

    .menu-section-tag {
      font-size: 0.65rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--c-primary);
      padding: 0 24px 12px;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
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
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--c-bg) 40%, var(--c-surface));

      @media (max-width: 480px) {
        padding: 14px 16px;
      }
    }

    .mobile-logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      user-select: none;
      min-width: 0;
    }

    .menu-logo-img {
      height: var(--logo-height-menu, 38px);
      width: auto;
      max-width: 140px;
      object-fit: contain;
      display: block;
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
      filter: var(--logo-filter, none);

      @media (max-width: 360px) {
        max-width: 115px;
      }
    }

    .close-btn {
      width: 36px; height: 36px;
      background: var(--c-surface);
      border: 1px solid var(--border);
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.88rem;
      color: var(--c-text);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;

      @media (max-width: 360px) {
        width: 32px; height: 32px;
      }

      &:hover { border-color: var(--c-primary); color: var(--c-primary); transform: rotate(90deg); }
      &:active { transform: scale(0.92); }
    }

    .menu-links {
      list-style: none;
      padding: 10px 0;

      li a {
        display: flex;
        align-items: center;
        padding: 13px 24px;
        min-height: 44px;
        font-family: 'Jost', sans-serif;
        font-size: 0.92rem;
        font-weight: 500;
        color: var(--c-text);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border-left: 2.5px solid transparent;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;

        &:hover {
          background: color-mix(in srgb, var(--c-accent) 18%, transparent);
          border-left-color: var(--c-primary);
          color: var(--c-primary);
          padding-left: 28px;
        }
      }
    }

    .filter-menu-item {
      border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      margin: 4px 0;
    }

    .filter-toggle-btn {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 24px;
      background: none;
      border: none;
      font-family: 'Jost', sans-serif;
      font-size: 0.92rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--c-primary);
      cursor: pointer;
      text-align: left;
      transition: background 0.2s;

      &:hover { background: color-mix(in srgb, var(--c-bg) 60%, transparent); }
    }

    .chevron {
      font-size: 1rem;
      transition: transform 0.25s ease;
      display: inline-block;
      color: var(--c-accent);

      &.open { transform: rotate(180deg); }
    }

    .filter-submenu {
      list-style: none;
      background: color-mix(in srgb, var(--c-bg) 50%, var(--c-surface));
      padding: 6px 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 40%, transparent);

      li a.sub-link {
        padding: 9px 24px 9px 34px;
        font-size: 0.85rem;
        text-transform: capitalize;
        letter-spacing: 0.04em;
        color: var(--c-text);
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:hover {
          color: var(--c-primary);
          background: color-mix(in srgb, var(--c-accent) 25%, transparent);
        }
      }

      .cat-count {
        font-size: 0.72rem;
        background: color-mix(in srgb, var(--c-accent) 40%, #FFFFFF);
        color: var(--c-text);
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 600;
      }
    }

    .menu-concierge-card {
      margin: 20px 20px 10px;
      padding: 16px;
      background: color-mix(in srgb, var(--c-bg) 70%, var(--c-surface));
      border: 1px dashed var(--border);
      border-radius: 8px;

      .mc-tag {
        display: block;
        font-size: 0.68rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--c-primary);
        font-weight: 600;
        margin-bottom: 6px;
      }

      p {
        font-size: 0.78rem;
        color: var(--c-muted);
        line-height: 1.5;
        margin: 0;
      }
    }

    .menu-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      background: #FFFFFF;
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

  formatCategoryName(name: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags & Purses';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains & Charms';
    return name;
  }

  logout() {
    this.auth.logout();
    this.close.emit();
  }
}
