import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ImageSliderComponent } from '../../shared/components/image-slider/image-slider.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent,
    HamburgerMenuComponent, ImageSliderComponent, BadgeComponent, ProductCardComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        @if (loading()) {
          <div class="container" style="padding:80px 0; text-align:center; color: var(--text-secondary)">
            <div style="font-size:2rem; margin-bottom:16px">🌿</div>
            Loading product…
          </div>
        } @else if (!product()) {
          <div class="container empty-state">
            <span class="empty-icon">🔍</span>
            <h3>Product not found</h3>
            <a routerLink="/shop" class="btn btn-primary">Back to Shop</a>
          </div>
        } @else {
          <div class="container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
              <a routerLink="/">Home</a>
              <span>›</span>
              <a routerLink="/shop">Shop</a>
              <span>›</span>
              <span>{{ product()!.name }}</span>
            </nav>

            <!-- Main Product -->
            <div class="product-layout">
              <!-- Left: Slider -->
              <div class="product-gallery">
                <app-image-slider [images]="product()!.photos" />

                <!-- Video (only if exists) -->
                @if (product()!.video_url) {
                  <div class="video-section">
                    <video
                      [src]="product()!.video_url"
                      autoplay muted loop playsinline
                      class="product-video"
                    ></video>
                  </div>
                }
              </div>

              <!-- Right: Info -->
              <div class="product-info">
                <div class="product-meta">
                  <span class="category-label">{{ product()!.category_name }}</span>
                  @if (product()!.badge) {
                    <app-badge [type]="product()!.badge ?? null" />
                  }
                </div>

                <h1 class="product-name">{{ product()!.name }}</h1>
                <div class="product-price">₹{{ product()!.price | number }}</div>

                <!-- Stock Status -->
                @if (product()!.in_stock) {
                  <span class="stock-badge in-stock">✓ In Stock</span>
                } @else {
                  <span class="stock-badge out-of-stock">✕ Out of Stock</span>
                }

                <div class="divider"></div>

                <p class="product-desc">{{ product()!.description }}</p>

                @if (product()!.materials) {
                  <div class="materials">
                    <span class="mat-label">Materials:</span>
                    <span class="mat-value">{{ product()!.materials }}</span>
                  </div>
                }

                <div class="divider"></div>

                <!-- Quantity + Add to Cart -->
                <div class="actions">
                  <div class="qty-selector">
                    <button (click)="qty.set(Math.max(1, qty() - 1))">−</button>
                    <span>{{ qty() }}</span>
                    <button type="button" (click)="increaseQty()">+</button>
                  </div>

                  <button
                    class="btn btn-primary btn-lg"
                    style="flex:1"
                    [disabled]="!product()!.in_stock"
                    (click)="addToCart()"
                  >
                    {{ product()!.in_stock ? 'Add to Cart' : 'Out of Stock' }}
                  </button>
                </div>

                <!-- WhatsApp Share -->
                <button class="share-btn" (click)="shareOnWhatsApp()">
                  💬 Share on WhatsApp
                </button>

                <!-- Handmade Note -->
                <div class="handmade-note">
                  <span>🌿</span>
                  <p>This is a handmade item — slight variations in colour, texture, or size make it uniquely yours.</p>
                </div>
              </div>
            </div>

            <!-- Similar Products -->
            @if (similar().length > 0) {
              <section style="padding: 64px 0">
                <span class="section-label">You might also like</span>
                <h2 class="section-title" style="margin: 8px 0 32px">Similar Pieces</h2>
                <div class="product-grid">
                  @for (p of similar(); track p.id) {
                    <app-product-card [product]="p" />
                  }
                </div>
              </section>
            }
          </div>
        }
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 24px 0 0;
      font-size: 0.82rem;
      color: var(--text-secondary);

      a { transition: color 0.2s; &:hover { color: var(--primary); } }
      span { opacity: 0.5; }
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: start;
      padding: 32px 0 0;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 40px;
      }
    }

    .product-gallery {
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: sticky;
      top: 96px;

      @media (max-width: 900px) { position: static; }
    }

    .video-section {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .product-video {
      width: 100%;
      display: block;
      max-height: 280px;
      object-fit: cover;
    }

    .product-info {
      padding-bottom: 48px;
    }

    .product-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .category-label {
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 500;
    }

    .product-name {
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      line-height: 1.2;
      margin-bottom: 16px;
    }

    .product-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 12px;
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;

      &.in-stock { background: var(--success-bg); color: var(--success-text); }
      &.out-of-stock { background: var(--error-bg); color: var(--error-text); }
    }

    .product-desc {
      font-size: 0.97rem;
      line-height: 1.8;
      color: var(--text-secondary);
    }

    .materials {
      margin-top: 12px;
      font-size: 0.88rem;
      display: flex;
      gap: 8px;

      .mat-label {
        font-weight: 600;
        color: var(--text-primary);
        flex-shrink: 0;
      }

      .mat-value { color: var(--text-secondary); }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .share-btn {
      width: 100%;
      padding: 12px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: filter 0.2s;
      margin-bottom: 20px;
      letter-spacing: 0.04em;

      &:hover { filter: brightness(1.1); }
    }

    .handmade-note {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: var(--bg);
      border-radius: 6px;
      border: 1px solid var(--border);
      font-size: 0.85rem;

      p { margin: 0; line-height: 1.6; font-size: 0.85rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  menuOpen = signal(false);
  loading = signal(true);
  product = signal<Product | null>(null);
  similar = signal<Product[]>([]);
  qty = signal(1);
  Math = Math;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.qty.set(1);
      this.productService.getProductBySlug(params['slug']).subscribe(p => {
        this.product.set(p || null);
        this.loading.set(false);
        if (p) {
          this.productService.getSimilarProducts(p.category_id, p.id).subscribe(s => this.similar.set(s));
        }
      });
    });
  }

  increaseQty() {
    this.qty.set(this.qty() + 1);
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = `/product/${p.slug}`;
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addItem(p, this.qty());
  }

  shareOnWhatsApp() {
    const p = this.product();
    if (!p) return;
    const msg = this.orderService.getWhatsAppShareMessage(p);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
