import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ProductGalleryComponent } from '../../shared/components/product-gallery/product-gallery.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent,
    HamburgerMenuComponent, ProductGalleryComponent, BadgeComponent, ProductCardComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        @if (loading()) {
          <div class="container product-loading-state">
            <div class="loading-spinner">🧵</div>
            <p>Gathering handmade details…</p>
          </div>
        } @else if (!product()) {
          <div class="container empty-state card">
            <span class="empty-icon">🔍</span>
            <h3>Piece Not Found</h3>
            <p>The handcrafted treasure you are searching for might have found a new home or is currently unlisted.</p>
            <a routerLink="/shop" class="btn btn-primary" style="margin-top:16px">Browse Full Collection</a>
          </div>
        } @else {
          <div class="container">
            <!-- Breadcrumbs -->
            <nav class="breadcrumb" aria-label="Breadcrumbs">
              <a routerLink="/">Home</a>
              <span class="sep">/</span>
              <a routerLink="/shop">Collection</a>
              <span class="sep">/</span>
              <span class="current">{{ product()!.name }}</span>
            </nav>

            <!-- Main Product Details -->
            <div class="product-layout">
              <!-- Left: Gallery -->
              <div class="product-gallery-col">
                <app-product-gallery
                  [images]="product()!.photos"
                  [videoUrl]="product()!.video_url"
                />
              </div>

              <!-- Right: Info -->
              <div class="product-info-col">
                <div class="product-meta">
                  <span class="category-pill">{{ product()!.category_name || 'Handcrafted' }}</span>
                  @if (product()!.badge) {
                    <app-badge [type]="product()!.badge ?? null" />
                  }
                </div>

                <h1 class="product-name">{{ product()!.name }}</h1>
                <div class="product-price">₹{{ product()!.price | number:'1.0-0':'en-IN' }}</div>

                <!-- Stock Status -->
                <div class="stock-status-row">
                  @if (product()!.in_stock) {
                    <span class="stock-badge in-stock">
                      <span class="dot"></span> In Stock · Ready to Dispatch
                    </span>
                  } @else {
                    <span class="stock-badge out-of-stock">
                      <span class="dot"></span> Made to Order (7-10 Days)
                    </span>
                  }
                </div>

                <p class="product-desc">{{ product()!.description }}</p>

                @if (product()!.materials) {
                  <div class="materials-box card">
                    <span class="mat-label">Craft & Materials:</span>
                    <span class="mat-value">{{ product()!.materials }}</span>
                  </div>
                }

                <!-- Actions: Qty + Add to Cart -->
                <div class="actions">
                  <div class="qty-selector" aria-label="Quantity selector">
                    <button (click)="qty.set(Math.max(1, qty() - 1))" aria-label="Decrease quantity">−</button>
                    <span>{{ qty() }}</span>
                    <button type="button" (click)="increaseQty()" aria-label="Increase quantity">+</button>
                  </div>

                  <button
                    class="btn btn-primary btn-lg add-to-cart-btn"
                    [disabled]="!product()!.in_stock"
                    (click)="addToCart()"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <span>{{ product()!.in_stock ? 'Add to Shopping Cart' : 'Made to Order Only' }}</span>
                  </button>
                </div>

                <!-- Direct WhatsApp Order / Enquiry -->
                <button class="whatsapp-order-btn" (click)="shareOnWhatsApp()">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Order or Enquire via WhatsApp</span>
                </button>

                <!-- Trust Guarantees Grid -->
                <div class="trust-grid">
                  <div class="trust-pill">
                    <span class="tp-icon">🌿</span>
                    <div>
                      <strong>100% Handmade</strong>
                      <p>Crafted slowly with natural fibers</p>
                    </div>
                  </div>
                  <div class="trust-pill">
                    <span class="tp-icon">🎁</span>
                    <div>
                      <strong>Gift-Ready Packing</strong>
                      <p>Plastic-free artisanal wrap</p>
                    </div>
                  </div>
                  <div class="trust-pill">
                    <span class="tp-icon">🚚</span>
                    <div>
                      <strong>Fast Dispatch</strong>
                      <p>Ships safely across India</p>
                    </div>
                  </div>
                  <div class="trust-pill">
                    <span class="tp-icon">✨</span>
                    <div>
                      <strong>Customizable</strong>
                      <p>Custom colors on request</p>
                    </div>
                  </div>
                </div>

                <!-- Care Note -->
                <div class="handmade-note">
                  <span class="note-icon">🧶</span>
                  <div>
                    <strong>Artisan Care Note:</strong>
                    <p>Each piece is individually handcrafted — gentle hand washing in cool water and flat air drying will preserve its beauty for years.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Similar Products -->
            @if (similar().length > 0) {
              <section class="similar-section">
                <div class="section-header-row">
                  <div>
                    <span class="section-label">You might also like</span>
                    <h2 class="section-title">Similar Handcrafted Pieces</h2>
                  </div>
                  <a routerLink="/shop" class="btn btn-ghost hide-mobile">Explore All →</a>
                </div>
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
    .product-loading-state {
      padding: 100px 0;
      text-align: center;
      color: var(--text-secondary);

      .loading-spinner {
        font-size: 2.5rem;
        margin-bottom: 16px;
        animation: spinThread 2s infinite ease-in-out;
      }
    }

    @keyframes spinThread {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg); }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 24px 0 16px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      flex-wrap: wrap;

      a {
        color: var(--text-secondary);
        transition: color 0.2s;
        &:hover { color: var(--primary); }
      }
      .sep { color: var(--border); }
      .current {
        color: var(--text-primary);
        font-weight: 600;
      }
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 56px;
      align-items: start;
      padding-top: 12px;
      padding-bottom: 60px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 36px;
      }
    }

    .product-gallery-col {
      position: sticky;
      top: 96px;

      @media (max-width: 900px) { position: static; }
    }

    .product-info-col {
      display: flex;
      flex-direction: column;
    }

    .product-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .category-pill {
      font-size: 0.74rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }

    .product-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2rem, 3.5vw, 2.7rem);
      line-height: 1.2;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .product-price {
      font-family: 'Playfair Display', serif;
      font-size: 2.1rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 16px;
    }

    .stock-status-row {
      margin-bottom: 20px;
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      font-size: 0.8rem;
      font-weight: 600;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.in-stock {
        background: var(--success-bg);
        color: var(--success-text);
        .dot { background: var(--success-text); }
      }
      &.out-of-stock {
        background: #FDF4E6;
        color: #A36916;
        .dot { background: #A36916; }
      }
    }

    .product-desc {
      font-size: 1.02rem;
      line-height: 1.8;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .materials-box {
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 28px;
      display: flex;
      gap: 8px;
      font-size: 0.9rem;

      .mat-label {
        font-weight: 700;
        color: var(--text-primary);
        flex-shrink: 0;
      }
      .mat-value {
        color: var(--text-secondary);
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 14px;

      @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .add-to-cart-btn {
      flex: 1;
      gap: 10px;
    }

    .whatsapp-order-btn {
      width: 100%;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #25D366;
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      margin-bottom: 32px;

      &:hover {
        background: #1EBE5D;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(37, 211, 102, 0.3);
      }
    }

    .trust-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 28px;
      padding-top: 24px;
      border-top: 1px solid var(--border);

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .trust-pill {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: var(--surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 12px 14px;

      .tp-icon { font-size: 1.2rem; }

      strong {
        display: block;
        font-size: 0.84rem;
        color: var(--text-primary);
      }
      p {
        font-size: 0.76rem;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.4;
      }
    }

    .handmade-note {
      display: flex;
      gap: 12px;
      padding: 16px 18px;
      background: var(--bg-warm);
      border-radius: var(--radius-sm);
      border: 1px dashed var(--border);
      font-size: 0.88rem;

      .note-icon { font-size: 1.3rem; }

      strong {
        display: block;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
        font-size: 0.84rem;
      }
    }

    .similar-section {
      padding: 40px 0 80px;
      border-top: 1px solid var(--border);
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
  private toast = inject(ToastService);

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
    this.cartService.addItem(p, this.qty());
  }

  shareOnWhatsApp() {
    const p = this.product();
    if (!p) return;
    const msg = this.orderService.getWhatsAppShareMessage(p);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
