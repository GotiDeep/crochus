import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ProductGalleryComponent } from '../../shared/components/product-gallery/product-gallery.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
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
    HamburgerMenuComponent, ProductGalleryComponent, BadgeComponent, ProductCardComponent, ScrollRevealDirective],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        @if (loading()) {
          <div class="container loading-container">
            <div class="loading-gem">✦</div>
            <p>Loading product details…</p>
          </div>
        } @else if (!product()) {
          <div class="container empty-state">
            <span class="empty-icon">✦</span>
            <h3>Handmade Creation Not Found</h3>
            <p>The item you are looking for might no longer be available in our catalogue.</p>
            <a routerLink="/shop" class="btn btn-primary">Browse All Products</a>
          </div>
        } @else {
          <div class="container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb" aria-label="Breadcrumb">
              <a routerLink="/">Home</a>
              <span class="sep">›</span>
              <a routerLink="/shop">All Products</a>
              @if (product()!.category_name) {
                <span class="sep">›</span>
                <a routerLink="/shop" [queryParams]="{category: product()!.category_id}">{{ formatCategoryName(product()!.category_name) }}</a>
              }
              <span class="sep">›</span>
              <span class="current">{{ product()!.name }}</span>
            </nav>

            <!-- Main Product Layout -->
            <div class="product-layout">
              <!-- Left Gallery Column -->
              <div class="product-gallery">
                <app-product-gallery
                  [images]="product()!.photos"
                  [videoUrl]="product()!.video_url"
                />

                <div class="atelier-hallmark-strip hide-mobile">
                  <div class="hm-badge">
                    <span class="hm-icon">🧶</span>
                    <div>
                      <strong>100% Handcrafted</strong>
                      <p>Made with care and quality materials</p>
                    </div>
                  </div>
                  <div class="hm-badge">
                    <span class="hm-icon">✿</span>
                    <div>
                      <strong>Thoughtful Packaging</strong>
                      <p>Carefully packed for gifting & delivery</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Product Details Column -->
              <div class="product-info">
                <!-- Meta Row: Category & Item Code -->
                <div class="dossier-meta">
                  <span class="dossier-category">{{ formatCategoryName(product()!.category_name) }}</span>
                  <span class="dossier-sku">Item {{ styleCode }}</span>
                  @if (product()!.badge) {
                    <app-badge [type]="product()!.badge ?? null" />
                  }
                </div>

                <!-- Product Title -->
                <h1 class="dossier-title">{{ product()!.name }}</h1>

                <!-- Price & Stock Status -->
                <div class="dossier-price-row">
                  <div class="dossier-price">
                    <span class="currency">₹</span>
                    <span class="val">{{ product()!.price | number:'1.0-0':'en-IN' }}</span>
                  </div>

                  @if (product()!.in_stock) {
                    <span class="stock-badge in-stock">✓ In Stock</span>
                  } @else {
                    <span class="stock-badge out-of-stock">✦ Made to Order on Request</span>
                  }
                </div>

                <div class="dossier-divider"></div>

                <!-- Product Description -->
                <div class="dossier-desc">
                  <h4 class="sub-heading">About This Item</h4>
                  <p>{{ product()!.description }}</p>
                </div>

                <!-- Materials & Craft Details -->
                @if (product()!.materials) {
                  <div class="dossier-materials">
                    <h4 class="sub-heading">Materials & Craft Details</h4>
                    <div class="mat-box">
                      <span class="mat-gem">✦</span>
                      <span class="mat-details">{{ product()!.materials }}</span>
                    </div>
                  </div>
                }

                <div class="dossier-divider"></div>

                <!-- Quantity & Add to Bag -->
                <div class="dossier-actions">
                  <div class="qty-selector">
                    <button (click)="qty.set(Math.max(1, qty() - 1))" aria-label="Decrease quantity">−</button>
                    <span>{{ qty() }}</span>
                    <button type="button" (click)="increaseQty()" aria-label="Increase quantity">+</button>
                  </div>

                  <button
                    class="btn btn-primary btn-lg acquire-btn"
                    [disabled]="!product()!.in_stock"
                    (click)="addToCart()"
                  >
                    {{ product()!.in_stock ? 'Add to Bag' : 'Order on WhatsApp' }}
                  </button>
                </div>

                <!-- WhatsApp Concierge Inquiry Button -->
                <button class="concierge-inquiry-btn" (click)="shareOnWhatsApp()">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Ask About This Item on WhatsApp</span>
                </button>

                <!-- Handcrafted Quality Card -->
                <div class="heirloom-card">
                  <span class="hc-icon">🧶</span>
                  <div class="hc-text">
                    <strong>Handcrafted Quality Guarantee</strong>
                    <p>Every piece is individually handcrafted with care. Subtle handmade touches make each creation special and one-of-a-kind.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Similar Creations Carousel/Grid -->
            @if (similar().length > 0) {
              <section class="similar-section">
                <span class="section-label">More to Love</span>
                <h2 class="section-title">Similar Creations You May Like</h2>
                <div class="product-grid">
                  @for (p of similar(); track p.id; let i = $index) {
                    <app-product-card [product]="p" appScrollReveal [revealDelay]="(i % 4) * 60" />
                  }
                </div>
              </section>
            }

            <!-- Sticky Mobile Quick-Order Bar -->
            <aside class="mobile-sticky-action-bar" aria-label="Quick Actions">
              <div class="sticky-bar-content">
                <div class="sticky-info">
                  <span class="sticky-sku">{{ styleCode }}</span>
                  <span class="sticky-price">₹{{ product()!.price | number:'1.0-0':'en-IN' }}</span>
                </div>
                <div class="sticky-buttons">
                  <button class="btn btn-outline btn-sticky-action" (click)="shareOnWhatsApp()" title="Ask on WhatsApp">
                    💬 WhatsApp
                  </button>
                  <button class="btn btn-primary btn-sticky-action" [disabled]="!product()!.in_stock" (click)="addToCart()">
                    {{ product()!.in_stock ? 'Add to Bag' : 'Order' }}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        }
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .loading-container {
      padding: 100px 0;
      text-align: center;
      color: var(--c-muted);

      .loading-gem {
        font-size: 2.2rem;
        color: var(--c-accent);
        margin-bottom: 16px;
        animation: spinGem 3s linear infinite;
      }
    }

    @keyframes spinGem {
      0% { transform: rotate(0deg) scale(0.95); opacity: 0.7; }
      50% { transform: rotate(180deg) scale(1.1); opacity: 1; }
      100% { transform: rotate(360deg) scale(0.95); opacity: 0.7; }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 24px 0 0;
      font-size: 0.8rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--c-muted);

      a {
        transition: color 0.2s;
        &:hover { color: var(--c-primary); }
      }
      .sep { opacity: 0.4; }
      .current { color: var(--c-text); font-weight: 500; }
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: start;
      padding: 32px 0 60px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 28px;
        padding-top: 16px;
        padding-bottom: calc(88px + env(safe-area-inset-bottom, 12px));
      }
    }

    .product-gallery {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: sticky;
      top: 96px;

      @media (max-width: 900px) { position: static; }
    }

    .atelier-hallmark-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px;
      background: color-mix(in srgb, var(--c-bg) 60%, var(--c-surface));
      border: 1px solid color-mix(in srgb, var(--c-accent) 40%, var(--border));
      border-radius: 8px;

      .hm-badge {
        display: flex;
        gap: 10px;
        align-items: flex-start;

        .hm-icon {
          color: var(--c-accent);
          font-size: 0.95rem;
          margin-top: 1px;
        }

        strong {
          display: block;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--c-text);
        }

        p {
          margin: 0;
          font-size: 0.74rem;
          color: var(--c-muted);
        }
      }
    }

    .product-info {
      padding-bottom: 24px;
    }

    .dossier-meta {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .dossier-category {
        font-size: 0.74rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--c-primary);
        font-weight: 600;
      }

      .dossier-sku {
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        color: var(--c-muted);
        font-family: monospace;
      }
    }

    .dossier-title {
      font-size: clamp(2.2rem, 3.8vw, 3.2rem);
      line-height: 1.15;
      margin-bottom: 16px;
      color: var(--c-text);
    }

    .dossier-price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      .dossier-price {
        font-family: 'Cormorant Garamond', serif;
        color: var(--c-primary);
        display: flex;
        align-items: baseline;
        gap: 4px;

        .currency {
          font-size: 1.4rem;
          font-weight: 500;
        }

        .val {
          font-size: 2.2rem;
          font-weight: 600;
        }
      }
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      &.in-stock {
        background: color-mix(in srgb, var(--c-primary) 12%, var(--c-surface));
        color: var(--c-primary);
        border: 1px solid color-mix(in srgb, var(--c-primary) 30%, transparent);
      }

      &.out-of-stock {
        background: color-mix(in srgb, var(--c-accent) 25%, var(--c-surface));
        color: var(--c-text);
        border: 1px solid var(--c-accent);
      }
    }

    .dossier-divider {
      height: 1px;
      background: color-mix(in srgb, var(--border) 60%, transparent);
      margin: 24px 0;
    }

    .sub-heading {
      font-size: 0.78rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--c-muted);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dossier-desc p {
      font-size: 1rem;
      line-height: 1.8;
      color: var(--c-text);
      margin: 0;
    }

    .dossier-materials {
      margin-top: 16px;

      .mat-box {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: color-mix(in srgb, var(--c-bg) 60%, var(--c-surface));
        border: 1px solid var(--border);
        border-radius: 6px;
        font-size: 0.88rem;
        color: var(--c-text);

        .mat-gem {
          color: var(--c-accent);
        }
      }
    }

    .dossier-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .qty-selector {
        align-self: flex-start;
        width: fit-content;
        max-width: 140px;
        flex-shrink: 0;
      }

      .acquire-btn {
        flex: 1;
        min-width: 0;
      }

      @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .qty-selector {
          align-self: flex-start;
        }

        .acquire-btn {
          width: 100%;
        }
      }
    }

    .concierge-inquiry-btn {
      width: 100%;
      min-height: 44px;
      padding: 10px 14px;
      background: color-mix(in srgb, var(--c-primary) 8%, var(--c-surface));
      border: 1.5px solid var(--c-primary);
      border-radius: 6px;
      color: var(--c-primary);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 1.35;
      gap: 8px;
      margin-bottom: 24px;
      transition: all 0.22s ease;
      box-sizing: border-box;

      @media (max-width: 480px) {
        font-size: 0.76rem;
        padding: 8px 10px;
        gap: 6px;
      }

      &:hover {
        background: var(--c-primary);
        color: #FFFFFF;
        box-shadow: 0 4px 14px rgba(74, 92, 47, 0.2);
      }
    }

    .heirloom-card {
      display: flex;
      gap: 12px;
      padding: 18px;
      background: var(--c-surface);
      border: 1px dashed color-mix(in srgb, var(--c-accent) 70%, var(--border));
      border-radius: 8px;

      .hc-icon {
        color: var(--c-accent);
        font-size: 1.1rem;
        margin-top: 2px;
      }

      strong {
        display: block;
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--c-text);
        margin-bottom: 4px;
      }

      p {
        margin: 0;
        line-height: 1.6;
        font-size: 0.82rem;
        color: var(--c-muted);
      }
    }

    .similar-section {
      padding: 60px 0 80px;
      border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);

      @media (max-width: 768px) {
        padding: 40px 0 calc(90px + env(safe-area-inset-bottom, 12px));
      }
    }

    /* ── Sticky Mobile Order/Enquire Bar ── */
    .mobile-sticky-action-bar {
      display: none;

      @media (max-width: 768px) {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-top: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
        padding: 8px 12px;
        padding-bottom: max(8px, env(safe-area-inset-bottom, 8px));
        box-shadow: 0 -4px 16px rgba(44, 58, 26, 0.08);
        z-index: 100;
        box-sizing: border-box;
      }
    }

    .sticky-bar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .sticky-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex-shrink: 0;
    }

    .sticky-sku {
      font-size: 0.62rem;
      letter-spacing: 0.08em;
      color: var(--c-muted);
      font-family: monospace;
      white-space: nowrap;
    }

    .sticky-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--c-primary);
      line-height: 1.1;
      white-space: nowrap;

      @media (max-width: 360px) {
        font-size: 1.1rem;
      }
    }

    .sticky-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .btn-sticky-action {
        min-height: 38px;
        padding: 6px 12px;
        font-size: 0.74rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        border-radius: 4px;
        white-space: nowrap;
        box-sizing: border-box;

        @media (max-width: 360px) {
          padding: 6px 8px;
          font-size: 0.68rem;
          min-height: 34px;
        }
      }
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

  get styleCode(): string {
    const p = this.product();
    if (!p) return '';
    return p.product_code || `CR-${p.id.toString().padStart(4, '0')}`;
  }

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

  formatCategoryName(name?: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    return name;
  }

  shareOnWhatsApp() {
    const p = this.product();
    if (!p) return;
    const msg = this.orderService.getWhatsAppShareMessage(p);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
