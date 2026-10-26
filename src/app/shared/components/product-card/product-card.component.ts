import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeComponent } from '../badge/badge.component';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule, BadgeComponent],
  template: `
    <article class="product-card card">
      <!-- Image Showcase with Secondary Crossfade & Wishlist -->
      <div class="card-image-wrapper">
        <a [routerLink]="['/product', product.slug]" class="card-image" [class.has-secondary]="product.photos.length > 1">
          <!-- Primary Image -->
          <img
            [src]="product.photos[0]"
            [alt]="product.name"
            class="main-img"
            loading="lazy"
          />

          <!-- Secondary Alternate Angle Image for Hover Preview -->
          @if (product.photos.length > 1) {
            <img
              [src]="product.photos[1]"
              [alt]="product.name + ' alternate view'"
              class="hover-img"
              loading="lazy"
            />
          }

          <!-- Subtle Luxury Image Vignette/Glow -->
          <div class="image-inner-border"></div>

          <!-- Top Badge Overlay -->
          @if (product.badge) {
            <div class="badge-overlay">
              <app-badge [type]="product.badge" />
            </div>
          } @else {
            <div class="badge-overlay">
              <span class="style-tag">{{ styleCode }}</span>
            </div>
          }

          <!-- Out of Stock Overlay -->
          @if (!product.in_stock) {
            <div class="oos-overlay">
              <span>Made to Order</span>
            </div>
          }
        </a>

        <!-- Floating Wishlist Button -->
        <button
          class="wishlist-btn"
          (click)="toggleWishlist($event)"
          [class.active]="inWishlist"
          [title]="inWishlist ? 'Remove from Saved' : 'Save Item'"
          aria-label="Save Item"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" [attr.fill]="inWishlist ? 'var(--c-primary)' : 'none'" [attr.stroke]="inWishlist ? 'var(--c-primary)' : 'var(--c-text)'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- Product Card Body -->
      <div class="card-body">
        <!-- Category & Item Code Header -->
        <div class="card-meta">
          <span class="card-category">{{ displayCategory }}</span>
          <span class="card-sku">{{ styleCode }}</span>
        </div>

        <!-- Product Name -->
        <h3 class="card-title-wrap">
          <a [routerLink]="['/product', product.slug]" class="card-title" [title]="product.name">
            {{ product.name }}
          </a>
        </h3>

        <!-- Materials Hallmark Tag if provided -->
        @if (product.materials) {
          <p class="materials-hallmark" [title]="product.materials">
            ✦ {{ product.materials }}
          </p>
        }

        <!-- Price and Quick Action Row -->
        <div class="card-footer-row">
          <div class="price-container">
            <span class="price-currency">₹</span>
            <span class="price-val">{{ product.price | number:'1.0-0':'en-IN' }}</span>
          </div>

          <button
            class="card-action-btn"
            [class.in-cart]="inCart"
            [disabled]="!product.in_stock"
            (click)="toggleCart($event)"
            [title]="!product.in_stock ? 'Made to Order' : (inCart ? 'In Shopping Bag (Click to Remove)' : 'Add to Bag')"
            aria-label="Add to Bag"
          >
            @if (inCart) {
              <span class="action-label in-cart-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                In Bag
              </span>
            } @else {
              <span class="action-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Add to Bag
              </span>
            }
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      width: 100%;
    }

    .product-card {
      background: var(--c-surface);
      border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: color-mix(in srgb, var(--c-accent) 70%, var(--border));
        box-shadow: 0 16px 36px rgba(44, 58, 26, 0.08);
        transform: translateY(-4px);
      }
    }

    .card-image-wrapper {
      position: relative;
      display: block;
      width: 100%;
      overflow: hidden;
      background: color-mix(in srgb, var(--c-bg) 60%, var(--c-surface));
    }

    .card-image {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/4;
      width: 100%;

      img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
        will-change: transform, opacity;
      }

      .main-img {
        opacity: 1;
        z-index: 1;
      }

      .hover-img {
        opacity: 0;
        z-index: 2;
      }

      &:hover {
        .main-img {
          transform: scale(1.05);
        }

        &.has-secondary {
          .main-img { opacity: 0; }
          .hover-img {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      }
    }

    .image-inner-border {
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      pointer-events: none;
      z-index: 3;
      border-radius: 4px;
      transition: border-color 0.3s ease;
    }

    .card-image:hover .image-inner-border {
      border-color: color-mix(in srgb, var(--c-accent) 60%, rgba(255, 255, 255, 0.7));
    }

    .badge-overlay {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 4;

      @media (max-width: 480px) {
        top: 8px;
        left: 8px;
      }
    }

    .style-tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      color: var(--c-text);
      text-transform: uppercase;

      @media (max-width: 480px) {
        font-size: 0.58rem;
        padding: 2px 5px;
        letter-spacing: 0.08em;
      }
    }

    .oos-overlay {
      position: absolute;
      inset: 0;
      background: rgba(44, 58, 26, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-bg);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      z-index: 4;
      text-align: center;
      padding: 12px;

      span {
        border: 1px solid var(--c-accent);
        padding: 6px 14px;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.2);
      }
    }

    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 34px;
      height: 34px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 480px) {
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;

        svg {
          width: 14px;
          height: 14px;
        }
      }

      &:hover {
        background: #FFFFFF;
        transform: scale(1.12);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        border-color: var(--c-primary);
      }

      &.active {
        background: #FFFFFF;
        border-color: var(--c-primary);
      }
    }

    .card-body {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;

      @media (max-width: 560px) {
        padding: 10px 10px 12px;
      }
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      @media (max-width: 560px) {
        margin-bottom: 3px;
        gap: 4px;
      }
    }

    .card-category {
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--c-muted);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 560px) {
        font-size: 0.64rem;
        letter-spacing: 0.08em;
      }
    }

    .card-sku {
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      color: color-mix(in srgb, var(--c-muted) 80%, transparent);
      font-weight: 600;
      font-family: monospace;

      @media (max-width: 560px) {
        font-size: 0.62rem;
      }
    }

    .card-title-wrap {
      margin: 0 0 6px;
      font-size: 1.22rem;
      line-height: 1.25;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 500;

      @media (max-width: 560px) {
        font-size: 1.05rem;
        margin-bottom: 4px;
      }
    }

    .card-title {
      color: var(--c-text);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s ease;

      &:hover {
        color: var(--c-primary);
      }
    }

    .materials-hallmark {
      font-size: 0.74rem;
      color: var(--c-muted);
      line-height: 1.4;
      margin: 0 0 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 560px) {
        font-size: 0.68rem;
        margin-bottom: 6px;
      }
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid color-mix(in srgb, var(--border) 45%, transparent);

      @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding-top: 8px;
      }
    }

    .price-container {
      display: flex;
      align-items: baseline;
      gap: 2px;
      color: var(--c-primary);
      font-family: 'Cormorant Garamond', serif;

      .price-currency {
        font-size: 0.95rem;
        font-weight: 500;
      }

      .price-val {
        font-size: 1.35rem;
        font-weight: 600;
        letter-spacing: -0.01em;

        @media (max-width: 560px) {
          font-size: 1.2rem;
        }
      }
    }

    .card-action-btn {
      min-height: 36px;
      padding: 0 14px;
      border-radius: 4px;
      background: transparent;
      border: 1px solid var(--c-primary);
      color: var(--c-primary);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.22s ease;
      box-sizing: border-box;

      .action-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      &:hover:not(:disabled) {
        background: var(--c-primary);
        color: #FFFFFF;
        box-shadow: 0 4px 12px rgba(74, 92, 47, 0.22);
      }

      &.in-cart {
        background: var(--c-primary);
        color: #FFFFFF;
        border-color: var(--c-primary);

        &:hover {
          background: color-mix(in srgb, var(--c-primary) 85%, #000000);
        }
      }

      &:disabled {
        border-color: var(--border);
        color: var(--c-muted);
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 560px) {
        width: 100%;
        min-height: 32px;
        padding: 5px 8px;
        font-size: 0.68rem;
        letter-spacing: 0.08em;

        .action-label {
          gap: 4px;
          svg {
            width: 14px;
            height: 14px;
          }
        }
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  cart = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);

  get inCart() {
    return this.cart.isInCart(this.product.id);
  }

  get inWishlist() {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(`wishlist_${this.product.id}`) === 'true';
  }

  get displayCategory(): string {
    const raw = this.product.category_name;
    if (!raw) return 'Handmade';
    const lower = raw.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    return raw;
  }

  get styleCode(): string {
    if (this.product.product_code) {
      return this.product.product_code;
    }
    return `CR-${this.product.id.toString().padStart(4, '0')}`;
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (typeof localStorage === 'undefined') return;

    if (this.inWishlist) {
      localStorage.removeItem(`wishlist_${this.product.id}`);
      this.toast.success(`${this.product.name} removed from saved items`);
    } else {
      localStorage.setItem(`wishlist_${this.product.id}`, 'true');
      this.toast.success(`${this.product.name} added to saved items`);
    }
  }

  toggleCart(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = '/cart';
      this.router.navigate(['/login']);
      return;
    }
    if (!this.product.in_stock) return;

    if (this.inCart) {
      this.cart.removeItem(this.product.id);
      this.toast.success(`${this.product.name} removed from your bag`);
    } else {
      this.cart.addItem(this.product);
      this.toast.success(`${this.product.name} added to your bag`);
    }
  }
}
