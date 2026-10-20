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
    <div class="product-card card">
      <!-- Image Wrapper for Wishlist positioning -->
      <div class="card-image-wrapper">
        <a [routerLink]="['/product', product.slug]" class="card-image">
          <img [src]="product.photos[0]" [alt]="product.name" loading="lazy" />
          @if (product.badge) {
            <div class="badge-overlay">
              <app-badge [type]="product.badge" />
            </div>
          }
          @if (!product.in_stock) {
            <div class="oos-overlay">Out of Stock</div>
          }
        </a>
        <button class="wishlist-btn" (click)="toggleWishlist($event)" [title]="inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'">
          <svg viewBox="0 0 24 24" width="20" height="20" [attr.fill]="inWishlist ? 'var(--primary)' : 'none'" [attr.stroke]="'var(--primary)'" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- Info -->
      <div class="card-body">
        <p class="card-category">{{ product.category_name || 'Handmade' }}</p>
        <div class="card-title-row">
          <a [routerLink]="['/product', product.slug]" class="card-title" [title]="product.name">{{ product.name }}</a>
          <span class="price">₹{{ product.price | number:'1.0-0':'en-IN' }}</span>
        </div>

        <div class="card-divider"></div>

        <div class="card-actions">
          <button
            class="card-action-btn cart-btn"
            [class.in-cart]="inCart"
            [disabled]="!product.in_stock"
            (click)="toggleCart($event)"
            [title]="!product.in_stock ? 'Out of Stock' : (inCart ? 'In Cart (Click to Remove)' : 'Add to Cart')"
          >
            @if (inCart) {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1.5"></circle>
                <circle cx="20" cy="21" r="1.5"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            }
          </button>
        </div>
      </div>
    </div>
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
    }

    .card-image-wrapper {
      position: relative;
      display: block;
      width: 100%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .card-image {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/4;
      width: 100%;
      background: var(--bg);

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.5s ease;
      }

      &:hover img { transform: scale(1.06); }
    }

    .badge-overlay {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 1;
    }

    .oos-overlay {
      position: absolute;
      inset: 0;
      background: var(--overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      z-index: 1;
    }

    .card-body {
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;

      @media (max-width: 560px) {
        padding: 10px 12px 12px;
      }
    }

    .card-category {
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #9E9687;
      font-weight: 500;
      margin-bottom: 4px;
      height: 1.2em;
      line-height: 1.2em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 560px) {
        font-size: 0.65rem;
      }
    }

    .card-title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      height: 1.6em;
      line-height: 1.6em;
    }

    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1A1A1A;
      line-height: 1.25;
      transition: color 0.2s;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;

      &:hover { color: var(--primary); }

      @media (max-width: 560px) {
        font-size: 1.05rem;
      }
    }

    .price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.35rem;
      font-weight: 600;
      color: #2F3E1E;
      white-space: nowrap;
      line-height: 1;
      flex-shrink: 0;

      @media (max-width: 560px) {
        font-size: 1.15rem;
      }
    }

    .card-divider {
      height: 1px;
      background: #E8E2D5;
      margin: 12px 0 12px;
      margin-top: auto;
      width: 100%;

      @media (max-width: 560px) {
        margin: 8px 0 10px;
        margin-top: auto;
      }
    }

    .card-actions {
      display: flex;
      width: 100%;
    }

    .card-image-wrapper {
      position: relative;
      display: block;
    }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-card);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 2;

      @media (max-width: 560px) {
        top: 8px;
        right: 8px;
        width: 26px;
        height: 26px;
        svg { width: 16px; height: 16px; }
      }
    }

    .wishlist-btn:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-hover);
    }

    .card-action-btn {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;

      @media (max-width: 560px) {
        height: 38px;
        border-radius: 6px;
        svg { width: 17px; height: 17px; }
      }
    }

    .cart-btn {
      background: #FAF7F2;
      border: 1.5px solid #435427;
      color: #435427;

      &:hover:not(:disabled) {
        background: #435427;
        color: #FFFFFF;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(67, 84, 39, 0.2);
      }

      &.in-cart {
        background: #435427;
        color: #FFFFFF;
      }

      &:disabled {
        border-color: var(--border);
        color: var(--text-muted, #888);
        background: var(--bg);
        cursor: not-allowed;
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

  get inCart() { return this.cart.isInCart(this.product.id); }

  // TODO: Use a proper WishlistService if implementing backend
  get inWishlist() {
    return localStorage.getItem(`wishlist_${this.product.id}`) === 'true';
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.inWishlist) {
      localStorage.removeItem(`wishlist_${this.product.id}`);
      this.toast.success(`${this.product.name} removed from wishlist`);
    } else {
      localStorage.setItem(`wishlist_${this.product.id}`, 'true');
      this.toast.success(`${this.product.name} added to wishlist`);
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
    } else {
      this.cart.addItem(this.product);
    }
  }
}
