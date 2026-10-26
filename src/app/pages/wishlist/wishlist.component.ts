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
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <div class="shop-header">
            <span class="section-label">Your Favorites</span>
            <h1>Saved Handmade Items</h1>
            <p class="vault-subtitle">
              @if (wishlistedProducts().length > 0) {
                {{ wishlistedProducts().length }} {{ wishlistedProducts().length === 1 ? 'item' : 'items' }} saved to your favorites
              } @else {
                Save your favorite handmade creations here to easily view them anytime
              }
            </p>
          </div>

          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="8" />
            </div>
          } @else if (wishlistedProducts().length === 0) {
            <div class="empty-state">
              <div class="empty-gem">✦</div>
              <h3>Your Wishlist is Empty</h3>
              <p>Click the heart icon on any bag, bouquet, keychain, or handmade creation to save it here for easy viewing later.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg" style="margin-top: 14px;">Browse All Products</a>
            </div>
          } @else {
            <div class="product-grid fade-in">
              @for (product of paginatedProducts(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">‹</button>
                @for (p of pageNumbers(); track p) {
                  <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p }}</button>
                }
                <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">›</button>
              </div>
            }
          }
        </div>
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    .shop-header {
      padding: 48px 0 32px;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;

      h1 {
        margin-top: 8px;
        font-size: clamp(2rem, 3.5vw, 2.8rem);
      }

      .vault-subtitle {
        color: var(--c-muted);
        font-size: 0.95rem;
        margin-top: 6px;
      }
    }

    .empty-state {
      padding: 80px 24px;
      text-align: center;
      max-width: 500px;
      margin: 0 auto 80px;
      border: 1px dashed var(--c-accent);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.4);

      .empty-gem {
        font-size: 2rem;
        color: var(--c-accent);
        margin-bottom: 16px;
      }

      h3 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.8rem;
        color: var(--c-text);
        margin-bottom: 8px;
      }

      p {
        color: var(--c-muted);
        font-size: 0.92rem;
        line-height: 1.6;
        margin-bottom: 20px;
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
      margin-bottom: 60px;

      @media (max-width: 1100px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      @media (max-width: 480px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      @media (max-width: 320px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-bottom: 70px;

      .page-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(200, 196, 154, 0.5);
        background: var(--c-surface);
        color: var(--c-text);
        font-family: 'Jost', sans-serif;
        font-size: 0.88rem;
        font-weight: 500;
        cursor: pointer;
        border-radius: 2px;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          border-color: var(--c-primary);
          color: var(--c-primary);
        }

        &.active {
          background: var(--c-primary);
          border-color: var(--c-primary);
          color: var(--c-bg);
          font-weight: 600;
        }

        &:disabled {
          opacity: 0.35;
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
  limit = 10;

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
    this.productService.getProducts({ limit: 1000 }).subscribe(res => {
      const allProducts = res.data;
      const wishlistIds = Object.keys(localStorage)
        .filter(key => key.startsWith('wishlist_') && localStorage.getItem(key) === 'true')
        .map(key => String(key.replace('wishlist_', '')));

      this.wishlistedProducts.set(allProducts.filter(p => wishlistIds.includes(String(p.id))));
      this.currentPage.set(1);
      this.loading.set(false);
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
