import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { BadgeComponent } from '../badge/badge.component';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule, BadgeComponent],
  template: `
    <article class="product-card card">
      <!-- Image Wrapper with Badges and Wishlist -->
      <div class="card-image-wrapper">
        <a [routerLink]="['/product', product.slug]" class="card-image" [attr.aria-label]="'View details for ' + product.name">
          <img
            [src]="product.photos[0]"
            [alt]="product.name"
            loading="lazy"
            decoding="async"
            width="400"
            height="533"
          />
          @if (product.badge) {
            <div class="badge-overlay">
              <app-badge [type]="product.badge" />
            </div>
          }
          @if (!product.in_stock) {
            <div class="oos-overlay">Out of Stock</div>
          }
        </a>

        <!-- Quick Wishlist Button -->
        <button
          class="wishlist-btn"
          (click)="toggleWishlist($event)"
          [title]="inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'"
          [attr.aria-label]="inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" [attr.fill]="inWishlist ? 'var(--primary)' : 'none'" [attr.stroke]="inWishlist ? 'var(--primary)' : '#5E5650'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- Info Body -->
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">{{ product.category_name || 'Handcrafted' }}</span>
          @if (product.in_stock) {
            <span class="stock-dot" title="In Stock"></span>
          }
        </div>

        <h3 class="card-title-wrap">
          <a [routerLink]="['/product', product.slug]" class="card-title" [title]="product.name">{{ product.name }}</a>
        </h3>

        <div class="price-row">
          <span class="price">₹{{ product.price | number:'1.0-0':'en-IN' }}</span>
          <span class="price-tag">Artisan Made</span>
        </div>

        <div class="card-actions">
          <!-- Primary Order / Add to Cart Button -->
          <button
            class="card-btn-primary"
            [class.in-cart]="inCart"
            [disabled]="!product.in_stock"
            (click)="toggleCart($event)"
            [attr.aria-label]="inCart ? 'Item in cart, click to remove' : 'Add ' + product.name + ' to cart'"
          >
            @if (inCart) {
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Added</span>
            } @else {
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>{{ product.in_stock ? 'Add to Cart' : 'Sold Out' }}</span>
            }
          </button>

          <!-- Direct WhatsApp Enquiry Button -->
          <a
            [href]="whatsappEnquiryUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="card-btn-whatsapp"
            title="Enquire / Custom order via WhatsApp"
            aria-label="Enquire via WhatsApp"
            (click)="$event.stopPropagation()"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
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
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 14px 34px rgba(44, 58, 26, 0.1);
        border-color: rgba(74, 92, 47, 0.3);

        .card-image img {
          transform: scale(1.06);
        }
      }
    }

    .card-image-wrapper {
      position: relative;
      display: block;
      width: 100%;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-warm);
    }

    .card-image {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 3 / 4;
      width: 100%;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .badge-overlay {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
    }

    .oos-overlay {
      position: absolute;
      inset: 0;
      background: rgba(36, 30, 28, 0.65);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      z-index: 3;
    }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(232, 224, 213, 0.8);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(36, 30, 28, 0.08);
      transition: all 0.2s ease;
      z-index: 4;

      &:hover {
        transform: scale(1.12);
        background: #FFFFFF;
        box-shadow: 0 4px 14px rgba(36, 30, 28, 0.15);
      }

      @media (max-width: 560px) {
        width: 34px;
        height: 34px;
        top: 8px;
        right: 8px;
      }
    }

    .card-body {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;

      @media (max-width: 560px) {
        padding: 12px 14px 14px;
      }
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .card-category {
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    .card-title-wrap {
      margin-bottom: 8px;
    }

    .card-title {
      font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
      font-size: 1.18rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
      transition: color 0.2s ease;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;

      &:hover {
        color: var(--primary);
      }

      @media (max-width: 560px) {
        font-size: 1.05rem;
      }
    }

    .price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      margin-top: auto;
    }

    .price {
      font-family: 'Playfair Display', 'Cormorant Garamond', serif;
      font-size: 1.32rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.01em;
    }

    .price-tag {
      font-size: 0.7rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .card-btn-primary {
      flex: 1;
      min-height: 42px;
      padding: 9px 14px;
      background: var(--primary);
      border: 1px solid var(--primary);
      border-radius: var(--radius-sm);
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover:not(:disabled) {
        background: var(--primary-hover);
        border-color: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(74, 92, 47, 0.25);
      }

      &.in-cart {
        background: var(--accent);
        border-color: var(--accent);
        color: #2C3A1A;
      }

      &:disabled {
        background: var(--bg-warm);
        border-color: var(--border);
        color: var(--text-muted);
        cursor: not-allowed;
      }

      @media (max-width: 560px) {
        min-height: 38px;
        font-size: 0.76rem;
        padding: 8px 10px;
      }
    }

    .card-btn-whatsapp {
      width: 42px;
      height: 42px;
      min-width: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #EAF7EE;
      border: 1px solid #C4E7CE;
      border-radius: var(--radius-sm);
      color: #25D366;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #25D366;
        color: #FFFFFF;
        border-color: #25D366;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
      }

      @media (max-width: 560px) {
        width: 38px;
        height: 38px;
        min-width: 38px;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  cart = inject(CartService);
  auth = inject(AuthService);
  settings = inject(SettingsService);
  router = inject(Router);
  toast = inject(ToastService);

  get inCart() { return this.cart.isInCart(this.product.id); }

  get inWishlist() {
    return localStorage.getItem(`wishlist_${this.product.id}`) === 'true';
  }

  get whatsappEnquiryUrl(): string {
    const phone = this.settings.whatsappNumber() || '918200502248';
    const text = `Hi Crochus! I am interested in handcrafted piece: ${this.product.name} (₹${this.product.price}). Is it available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.inWishlist) {
      localStorage.removeItem(`wishlist_${this.product.id}`);
      this.toast.success(`${this.product.name} removed from wishlist`);
    } else {
      localStorage.setItem(`wishlist_${this.product.id}`, 'true');
      this.toast.success(`${this.product.name} saved to wishlist`);
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
      this.toast.success(`${this.product.name} removed from cart`);
    } else {
      this.cart.addItem(this.product);
      this.toast.success(`${this.product.name} added to cart`);
    }
  }
}
