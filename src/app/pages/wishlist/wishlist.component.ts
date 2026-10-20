import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductCardSkeletonComponent, NavbarComponent, FooterComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar />
      <main class="main-content">
        <div class="container">
          <div class="shop-header">
            <div>
              <span class="section-label">Your Favorites</span>
              <h1 style="font-size: 2.5rem; margin:8px 0">My Wishlist</h1>
              <p>{{ wishlistedProducts().length }} items saved</p>
            </div>
          </div>

          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="10" />
            </div>
          } @else if (wishlistedProducts().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">♡</span>
              <h3>Your wishlist is empty</h3>
              <p>Explore our shop and tap the heart icon to save your favorite items here.</p>
              <a href="/shop" class="btn btn-primary" style="margin-top: 16px;">Browse Shop</a>
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
      padding: 48px 0 24px;
    }
    .empty-state {
      padding-bottom: 80px;
    }
  `]
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);
  
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
