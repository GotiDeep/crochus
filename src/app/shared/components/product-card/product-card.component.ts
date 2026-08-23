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
        <p class="card-category">{{ product.category_name }}</p>
        <a [routerLink]="['/product', product.slug]" class="card-title">{{ product.name }}</a>
        <div class="card-footer">
          <span class="price">₹{{ product.price | number:'1.0-0':'en-IN' }}</span>
          <button
            class="btn btn-primary btn-sm add-btn"
            [disabled]="!product.in_stock"
            (click)="toggleCart()"
          >
            {{ product.in_stock ? (inCart ? 'Remove' : 'Add to Cart') : 'Out of Stock' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .card-image {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/4;
      background: var(--bg);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      &:hover img { transform: scale(1.06); }
    }

    .badge-overlay {
      position: absolute;
      top: 12px;
      left: 12px;
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
    }

    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .card-category {
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 500;
    }

    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.3;
      transition: color 0.2s;
      &:hover { color: var(--primary); }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      gap: 10px;
    }

    .card-image-wrapper {
      position: relative;
      display: block;
    }

    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-card);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 2;
    }

    .wishlist-btn:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-hover);
    }

    .add-btn {
      flex-shrink: 0;
      padding: 8px 14px;
      font-size: 0.75rem;
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

  toggleCart() {
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
