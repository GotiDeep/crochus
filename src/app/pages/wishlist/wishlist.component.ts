import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    ProductCardSkeletonComponent,
    NavbarComponent,
    FooterComponent,
    HamburgerMenuComponent
  ],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <header class="wishlist-header">
            <span class="section-label">Your Favorites</span>
            <h1>Saved Pieces</h1>
            <p class="wishlist-count">
              {{ wishlistedProducts().length }} {{ wishlistedProducts().length === 1 ? 'item' : 'items' }} kept close to heart
            </p>
          </header>

          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="8" />
            </div>
          } @else if (wishlistedProducts().length === 0) {
            <div class="empty-state card fade-in">
              <div class="empty-icon-wrap">♡</div>
              <h2>Your wishlist is empty</h2>
              <p>Explore our handmade creations and tap the heart icon on any piece to save it here for later.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg">Explore Shop</a>
            </div>
          } @else {
            <div class="product-grid fade-in">
              @for (product of paginatedProducts(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <nav class="pagination" aria-label="Wishlist pagination">
                <button
                  type="button"
                  class="page-btn"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)"
                  aria-label="Previous page"
                >‹</button>

                @for (p of pageNumbers(); track p) {
                  <button
                    type="button"
                    class="page-btn"
                    [class.active]="p === currentPage()"
                    (click)="goToPage(p)"
                  >{{ p }}</button>
                }

                <button
                  type="button"
                  class="page-btn"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)"
                  aria-label="Next page"
                >›</button>
              </nav>
            }
          }
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .wishlist-header {
      padding: clamp(32px, 5vw, 48px) 0 clamp(20px, 3vw, 32px);

      h1 {
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        margin: 8px 0 4px;
      }

      .wishlist-count {
        font-size: 0.95rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .empty-state {
      text-align: center;
      padding: clamp(48px, 8vw, 80px) 24px;
      max-width: 500px;
      margin: 0 auto clamp(48px, 6vw, 80px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .empty-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--surface-warm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: var(--primary);
      }

      h2 {
        font-size: 1.75rem;
        margin: 0;
      }

      p {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: clamp(32px, 5vw, 48px) 0 clamp(48px, 6vw, 80px);

      .page-btn {
        width: 44px;
        height: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }

        &.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);

  menuOpen = signal(false);
  loading = signal(true);
  wishlistedProducts = signal<Product[]>([]);
  currentPage = signal(1);
  limit = 12;

  totalPages = () => Math.ceil(this.wishlistedProducts().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedProducts = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.wishlistedProducts().slice(start, start + this.limit);
  };

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading.set(true);
    this.productService.getProducts({ limit: 1000 }).subscribe((res) => {
      const allProducts = res.data;
      const wishlistIds = Object.keys(localStorage)
        .filter((key) => key.startsWith('wishlist_') && localStorage.getItem(key) === 'true')
        .map((key) => String(key.replace('wishlist_', '')));

      this.wishlistedProducts.set(allProducts.filter((p) => wishlistIds.includes(String(p.id))));
      this.currentPage.set(1);
      this.loading.set(false);
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
