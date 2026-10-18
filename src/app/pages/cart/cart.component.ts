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
          <header class="page-header">
            <span class="section-label">Your Selection</span>
            <h1>Shopping Cart</h1>
            @if (cart.items().length > 0) {
              <p class="header-count">{{ cart.totalItems() }} {{ cart.totalItems() === 1 ? 'piece' : 'pieces' }} ready to craft</p>
            }
          </header>

          @if (cart.items().length === 0) {
            <div class="empty-cart-state card fade-in">
              <div class="empty-icon-wrap">🛍️</div>
              <h2>Your basket is empty</h2>
              <p>Every piece at Crochus is crocheted with care and patience. Discover our bouquets, wearables, and decor.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg">Explore Collection</a>
            </div>
          } @else {
            <div class="cart-layout">
              <!-- Items List -->
              <div class="cart-items-col">
                <div class="packaging-perk">
                  <span class="perk-icon">🌿</span>
                  <span><strong>Artisan Packaging:</strong> All orders are thoughtfully packed in eco-friendly paper with a handwritten note.</span>
                </div>

                <div class="cart-list">
                  @for (item of cart.items(); track item.product.id) {
                    <article class="cart-item card">
                      <a [routerLink]="['/product', item.product.slug]" class="item-img-wrap">
                        <img
                          [src]="item.product.photos[0]"
                          [alt]="item.product.name"
                          loading="lazy"
                          width="96"
                          height="96"
                        />
                      </a>

                      <div class="item-details">
                        <span class="item-cat">{{ item.product.category_name }}</span>
                        <a [routerLink]="['/product', item.product.slug]" class="item-title">
                          {{ item.product.name }}
                        </a>
                        <p class="item-unit-price">₹{{ item.product.price | number:'1.0-0':'en-IN' }} each</p>

                        <div class="item-actions-mobile">
                          <div class="qty-pill">
                            <button
                              type="button"
                              (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                              aria-label="Decrease quantity"
                            >−</button>
                            <span class="qty-num">{{ item.quantity }}</span>
                            <button
                              type="button"
                              (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                              aria-label="Increase quantity"
                            >+</button>
                          </div>
                          <span class="item-subtotal-mobile">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                          <button
                            type="button"
                            class="delete-btn"
                            (click)="cart.removeItem(item.product.id)"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      <div class="item-controls-desktop">
                        <div class="qty-pill">
                          <button
                            type="button"
                            (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                            aria-label="Decrease quantity"
                          >−</button>
                          <span class="qty-num">{{ item.quantity }}</span>
                          <button
                            type="button"
                            (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                        <p class="item-subtotal">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</p>
                        <button
                          type="button"
                          class="delete-btn"
                          (click)="cart.removeItem(item.product.id)"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </article>
                  }
                </div>

                <div class="cart-actions-row">
                  <a routerLink="/shop" class="btn btn-ghost">← Continue Browsing</a>
                  <button type="button" class="btn btn-ghost text-danger" (click)="cart.clearCart()">
                    Clear Cart
                  </button>
                </div>
              </div>

              <!-- Order Summary Column -->
              <aside class="order-summary card">
                <h3>Order Summary</h3>
                <div class="divider"></div>

                <div class="summary-lines">
                  @for (item of cart.items(); track item.product.id) {
                    <div class="summary-row">
                      <span class="item-name-cell">{{ item.product.name }} <span class="qty-tag">× {{ item.quantity }}</span></span>
                      <span class="item-price-cell">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                    </div>
                  }
                </div>

                <div class="summary-breakdown">
                  <div class="breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                  </div>
                  <div class="breakdown-row highlight">
                    <span>Shipping</span>
                    <span class="free-pill">Calculated at checkout</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="summary-total-row">
                  <div>
                    <span class="total-label">Estimated Total</span>
                    <span class="total-subtext">Taxes included</span>
                  </div>
                  <span class="total-amount">₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                </div>

                <a routerLink="/order" class="btn btn-primary btn-full btn-lg checkout-btn">
                  Proceed to Checkout →
                </a>

                <div class="trust-guarantees">
                  <div class="tg-item">
                    <span>🧶</span>
                    <span>100% Hand-crocheted in Gujarat</span>
                  </div>
                  <div class="tg-item">
                    <span>💬</span>
                    <span>Direct WhatsApp order confirmation</span>
                  </div>
                  <div class="tg-item">
                    <span>📦</span>
                    <span>All-India secure tracked shipping</span>
                  </div>
                </div>
              </aside>
            </div>
          }
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .page-header {
      padding: clamp(32px, 5vw, 48px) 0 clamp(20px, 3vw, 32px);

      h1 {
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        margin: 8px 0 4px;
      }

      .header-count {
        font-size: 0.95rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .empty-cart-state {
      text-align: center;
      padding: clamp(48px, 8vw, 80px) 24px;
      max-width: 520px;
      margin: 0 auto clamp(48px, 6vw, 80px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .empty-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--surface-warm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.8rem;
      }

      h2 {
        font-size: 1.75rem;
        margin: 0;
        color: var(--text-primary);
      }

      p {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: clamp(24px, 4vw, 40px);
      align-items: start;
      padding-bottom: clamp(48px, 6vw, 80px);

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .cart-items-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .packaging-perk {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface-warm);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;

      .perk-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      strong {
        color: var(--text-primary);
      }
    }

    .cart-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 96px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 18px 20px;
      border-radius: var(--radius-md);
      transition: box-shadow var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-hover);
      }

      @media (max-width: 640px) {
        grid-template-columns: 80px 1fr;
        gap: 14px;
        padding: 14px;

        .item-controls-desktop {
          display: none;
        }

        .item-actions-mobile {
          display: flex;
        }
      }
    }

    .item-img-wrap {
      display: block;
      width: 96px;
      height: 96px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg);
      border: 1px solid var(--border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      @media (max-width: 640px) {
        width: 80px;
        height: 80px;
      }
    }

    .item-details {
      min-width: 0;

      .item-cat {
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent);
        font-weight: 600;
        display: block;
        margin-bottom: 2px;
      }

      .item-title {
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 500;
        color: var(--text-primary);
        text-decoration: none;
        line-height: 1.25;
        display: inline-block;
        transition: color var(--transition-fast);

        &:hover {
          color: var(--primary);
        }
      }

      .item-unit-price {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin: 4px 0 0;
      }
    }

    .item-actions-mobile {
      display: none;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;

      .item-subtotal-mobile {
        font-family: var(--font-heading);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-left: auto;
      }
    }

    .item-controls-desktop {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;

      .item-subtotal {
        font-family: var(--font-heading);
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .qty-pill {
      display: inline-flex;
      align-items: center;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 2px;

      button {
        width: 32px;
        height: 32px;
        min-height: 32px;
        border: none;
        background: transparent;
        color: var(--text-primary);
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background var(--transition-fast);

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      .qty-num {
        min-width: 28px;
        text-align: center;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .delete-btn {
      background: transparent;
      border: none;
      font-size: 0.82rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--primary);
      }
    }

    .cart-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      flex-wrap: wrap;
      gap: 12px;

      .text-danger {
        color: var(--error-text);
        &:hover {
          background: var(--error-bg);
        }
      }
    }

    .order-summary {
      padding: clamp(24px, 4vw, 32px);
      position: sticky;
      top: 96px;
      border-radius: var(--radius-md);

      h3 {
        font-size: 1.3rem;
        margin: 0 0 16px;
      }

      .summary-lines {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
        max-height: 220px;
        overflow-y: auto;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.88rem;
        color: var(--text-secondary);
        gap: 12px;

        .item-name-cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;

          .qty-tag {
            color: var(--text-muted);
            font-size: 0.8rem;
          }
        }

        .item-price-cell {
          font-weight: 500;
          color: var(--text-primary);
          flex-shrink: 0;
        }
      }

      .summary-breakdown {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: var(--text-secondary);

          .free-pill {
            font-size: 0.76rem;
            color: var(--accent);
            font-weight: 600;
          }
        }
      }

      .summary-total-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 8px 0 20px;

        .total-label {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .total-subtext {
          display: block;
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .total-amount {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 600;
          color: var(--primary);
        }
      }

      .checkout-btn {
        margin-bottom: 20px;
      }

      .trust-guarantees {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 16px;
        border-top: 1px solid var(--border);

        .tg-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  menuOpen = signal(false);
}
