import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <div class="page-header">
            <span class="section-label">Your selection</span>
            <h1>Shopping Cart</h1>
          </div>

          @if (cart.items().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🛍</span>
              <h3>Your cart is empty</h3>
              <p>Add handmade pieces to your cart and they'll appear here.</p>
              <a routerLink="/shop" class="btn btn-primary">Continue Shopping</a>
            </div>
          } @else {
            <div class="cart-layout">
              <!-- Items List -->
              <div class="cart-items">
                @for (item of cart.items(); track item.product.id) {
                  <div class="cart-row card">
                    <a [routerLink]="['/product', item.product.slug]" class="item-img">
                      <img [src]="item.product.photos[0]" [alt]="item.product.name" />
                    </a>
                    <div class="item-info">
                      <p class="item-category">{{ item.product.category_name }}</p>
                      <a [routerLink]="['/product', item.product.slug]" class="item-name">{{ item.product.name }}</a>
                      <p class="item-price">₹{{ item.product.price | number }}</p>
                    </div>
                    <div class="item-controls">
                      <div class="qty-selector">
                        <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">−</button>
                        <span>{{ item.quantity }}</span>
                        <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                      </div>
                      <p class="item-subtotal">₹{{ item.product.price * item.quantity | number }}</p>
                      <button class="remove-btn" (click)="cart.removeItem(item.product.id)" title="Remove">🗑</button>
                    </div>
                  </div>
                }

                <div class="cart-actions-bar">
                  <a routerLink="/shop" class="btn btn-ghost">← Continue Shopping</a>
                  <button class="btn btn-ghost" (click)="cart.clearCart()">Clear Cart</button>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="order-summary card">
                <h3>Order Summary</h3>
                <div class="divider"></div>

                <div class="summary-lines">
                  @for (item of cart.items(); track item.product.id) {
                    <div class="summary-line">
                      <span>{{ item.product.name }} × {{ item.quantity }}</span>
                      <span>₹{{ item.product.price * item.quantity | number }}</span>
                    </div>
                  }
                </div>

                <div class="divider"></div>

                <div class="summary-total">
                  <span>Total</span>
                  <span class="total-price">₹{{ cart.totalPrice() | number }}</span>
                </div>

                <p class="summary-note">🌿 Shipping & taxes calculated at checkout via WhatsApp</p>

                <a routerLink="/order" class="btn btn-primary btn-full btn-lg" style="margin-top:20px">
                  Proceed to Order →
                </a>
              </div>
            </div>
          }
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .page-header {
      padding: 48px 0 32px;
      h1 { margin-top: 8px; }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 32px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-row {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 16px;

      @media (max-width: 600px) {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto;

        .item-controls {
          grid-column: 1 / -1;
          justify-content: flex-start;
        }
      }
    }

    .item-img {
      display: block;
      width: 100px; height: 100px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg);

      img { width: 100%; height: 100%; object-fit: cover; }

      @media (max-width: 600px) { width: 80px; height: 80px; }
    }

    .item-info {
      .item-category {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 4px;
      }
      .item-name {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.05rem;
        color: var(--text-primary);
        line-height: 1.3;
        &:hover { color: var(--primary); }
      }
      .item-price {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-top: 6px;
      }
    }

    .item-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;

      .item-subtotal {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .remove-btn {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
      padding: 4px;
      &:hover { opacity: 1; }
    }

    .cart-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .order-summary {
      padding: 28px;
      position: sticky;
      top: 96px;

      h3 { font-size: 1.2rem; margin-bottom: 16px; }

      .summary-lines {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }

      .summary-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.88rem;
        color: var(--text-secondary);
        gap: 12px;

        span:first-child {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
        color: var(--text-primary);

        .total-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--accent);
        }
      }

      .summary-note {
        font-size: 0.78rem;
        color: var(--text-secondary);
        margin-top: 12px;
        line-height: 1.5;
        text-align: center;
      }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  menuOpen = signal(false);
}
