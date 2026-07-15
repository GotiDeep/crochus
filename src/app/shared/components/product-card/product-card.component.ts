import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeComponent } from '../badge/badge.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule, BadgeComponent],
  template: `
    <div class="product-card card">
      <!-- Image -->
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

      <!-- Info -->
      <div class="card-body">
        <p class="card-category">{{ product.category_name }}</p>
        <a [routerLink]="['/product', product.slug]" class="card-title">{{ product.name }}</a>
        <div class="card-footer">
          <span class="price">₹{{ product.price | number }}</span>
          <button
            class="btn btn-primary btn-sm add-btn"
            [disabled]="!product.in_stock"
            (click)="addToCart()"
          >
            {{ product.in_stock ? (inCart ? '✓ Added' : 'Add to Cart') : 'Out of Stock' }}
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

  get inCart() { return this.cart.isInCart(this.product.id); }

  addToCart() {
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = '/cart';
      this.router.navigate(['/login']);
      return;
    }
    if (!this.product.in_stock) return;
    this.cart.addItem(this.product);
  }
}
