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
            <span class="section-label">Your Selection</span>
            <h1>Shopping Bag</h1>
            <p class="header-subtitle">
              @if (cart.items().length > 0) {
                {{ cart.totalItems() }} {{ cart.totalItems() === 1 ? 'item' : 'items' }} selected
              } @else {
                Your shopping bag is currently empty
              }
            </p>
          </div>

          @if (cart.items().length === 0) {
            <div class="empty-state">
              <div class="empty-gem">✦</div>
              <h3>Your Shopping Bag is Empty</h3>
              <p>Explore our catalogue to find bags, bouquets, keychains, and handmade gifts you love.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg" style="margin-top:12px;">Browse All Products</a>
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
                      <div class="item-meta">
                        <span class="style-sku">{{ getStyleCode(item.product) }}</span>
                        <span class="item-category">{{ formatCategoryName(item.product.category_name) }}</span>
                      </div>
                      <a [routerLink]="['/product', item.product.slug]" class="item-name">{{ item.product.name }}</a>
                      @if (item.product.materials) {
                        <p class="item-mat">✦ {{ item.product.materials }}</p>
                      }
                      <p class="item-price">Unit Price: ₹{{ item.product.price | number:'1.0-0':'en-IN' }}</p>
                    </div>

                    <div class="item-controls">
                      <div class="qty-selector">
                        <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)" aria-label="Decrease quantity">−</button>
                        <span>{{ item.quantity }}</span>
                        <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)" aria-label="Increase quantity">+</button>
                      </div>

                      <div class="subtotal-box">
                        <span class="subtotal-label">Subtotal</span>
                        <p class="item-subtotal">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</p>
                      </div>

                      <button class="remove-btn" (click)="cart.removeItem(item.product.id)" title="Remove item">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                }

                <div class="cart-actions-bar">
                  <a routerLink="/shop" class="btn btn-ghost continue-link">
                    ← Browse More Products
                  </a>
                  <button class="btn btn-ghost clear-btn" (click)="cart.clearCart()">
                    Clear Shopping Bag
                  </button>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="order-summary card">
                <div class="summary-header">
                  <span class="summary-eyebrow">CROCHUS Handmade</span>
                  <h3>Order Summary</h3>
                </div>
                <div class="gold-hairline"></div>

                <div class="summary-lines">
                  @for (item of cart.items(); track item.product.id) {
                    <div class="summary-line">
                      <div class="line-title">
                        <span class="prod-name">{{ item.product.name }}</span>
                        <span class="prod-qty">× {{ item.quantity }}</span>
                      </div>
                      <span class="prod-amount">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                    </div>
                  }
                </div>

                <div class="gold-hairline"></div>

                <div class="perks-list">
                  <div class="perk-item">
                    <span class="perk-icon">✦</span>
                    <span class="perk-desc">Complimentary gift box packaging with every order</span>
                  </div>
                  <div class="perk-item">
                    <span class="perk-icon">✦</span>
                    <span class="perk-desc">Easy WhatsApp order confirmation & tracking</span>
                  </div>
                  <div class="perk-item">
                    <span class="perk-icon">✦</span>
                    <span class="perk-desc">Quality checked and safely packed before shipping</span>
                  </div>
                </div>

                <div class="gold-hairline"></div>

                <div class="summary-total">
                  <div class="total-label-box">
                    <span class="total-title">Total Price</span>
                    <span class="total-subtitle">All Taxes Included</span>
                  </div>
                  <span class="total-price">₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                </div>

                <a routerLink="/order" class="btn btn-primary btn-full btn-lg checkout-btn">
                  Proceed to Order on WhatsApp →
                </a>

                <p class="summary-note">
                  💬 When you proceed, we'll format your selected designs for WhatsApp so our team can confirm availability and shipping with you directly.
                </p>
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
      padding: 48px 0 28px;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;

      h1 {
        margin-top: 8px;
        font-size: clamp(2rem, 3.5vw, 2.8rem);
      }

      .header-subtitle {
        color: var(--c-muted);
        font-size: 0.95rem;
        margin-top: 6px;
        letter-spacing: 0.02em;
      }
    }

    .empty-state {
      padding: 80px 24px;
      text-align: center;
      max-width: 500px;
      margin: 0 auto 60px;
      border: 1px dashed var(--c-accent);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.4);

      .empty-gem {
        font-size: 2rem;
        color: var(--c-accent);
        margin-bottom: 16px;
      }

      h3 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.8rem;
        color: var(--c-text);
        margin-bottom: 8px;
      }

      p {
        color: var(--c-muted);
        font-size: 0.92rem;
        line-height: 1.6;
        margin-bottom: 24px;
      }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 36px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 960px) {
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
      grid-template-columns: 110px 1fr auto;
      gap: 24px;
      align-items: center;
      padding: 20px;
      border-color: rgba(200, 196, 154, 0.35);
      transition: border-color 0.25s, box-shadow 0.25s;

      &:hover {
        border-color: var(--c-accent);
      }

      @media (max-width: 640px) {
        padding: 14px 12px;
        gap: 12px;
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto;

        .item-controls {
          grid-column: 1 / -1;
          justify-content: space-between;
          flex-direction: row;
          border-top: 1px dashed rgba(200, 196, 154, 0.4);
          padding-top: 12px;
          margin-top: 6px;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
    }

    .item-img {
      display: block;
      width: 110px;
      height: 120px;
      border-radius: 3px;
      border: 1px solid rgba(200, 196, 154, 0.45);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--c-bg);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      &:hover img {
        transform: scale(1.06);
      }

      @media (max-width: 640px) {
        width: 90px;
        height: 100px;
      }
    }

    .item-info {
      .item-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
      }

      .style-sku {
        font-family: 'Jost', sans-serif;
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--c-primary);
        font-weight: 600;
        background: rgba(74, 92, 47, 0.08);
        padding: 2px 7px;
        border-radius: 2px;
      }

      .item-category {
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-muted);
      }

      .item-name {
        display: block;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--c-text);
        line-height: 1.25;
        margin-bottom: 4px;
        transition: color 0.2s;

        &:hover {
          color: var(--c-primary);
        }
      }

      .item-mat {
        font-size: 0.78rem;
        color: var(--c-muted);
        margin-bottom: 6px;
      }

      .item-price {
        font-size: 0.85rem;
        color: var(--c-muted);
      }
    }

    .item-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;

      .subtotal-box {
        text-align: right;

        .subtotal-label {
          display: block;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--c-muted);
        }

        .item-subtotal {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--c-primary);
          margin: 0;
          line-height: 1.1;
        }
      }
    }

    .remove-btn {
      background: none;
      border: 1px solid rgba(200, 196, 154, 0.4);
      color: var(--c-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 3px;
      transition: all 0.2s;

      &:hover {
        border-color: #B23B3B;
        color: #B23B3B;
        background: rgba(178, 59, 59, 0.05);
      }
    }

    .cart-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      gap: 16px;
      flex-wrap: wrap;

      .continue-link {
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--c-primary);
        font-weight: 500;
      }

      .clear-btn {
        font-size: 0.78rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--c-muted);

        &:hover {
          color: #B23B3B;
        }
      }
    }

    .order-summary {
      padding: 32px 28px;
      position: sticky;
      top: 100px;
      border-color: rgba(200, 196, 154, 0.5);
      background: var(--c-surface);

      @media (max-width: 600px) {
        padding: 20px 16px;
      }

      .summary-header {
        .summary-eyebrow {
          display: block;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--c-muted);
          margin-bottom: 2px;
        }

        h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--c-text);
          margin: 0;
        }
      }

      .gold-hairline {
        height: 1px;
        background: linear-gradient(90deg, var(--c-accent), rgba(200, 196, 154, 0.2));
        margin: 18px 0;
      }

      .summary-lines {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .summary-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          color: var(--c-text);
          gap: 14px;

          .line-title {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;

            .prod-name {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 170px;
            }

            .prod-qty {
              font-size: 0.78rem;
              color: var(--c-muted);
              flex-shrink: 0;
            }
          }

          .prod-amount {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--c-text);
            flex-shrink: 0;
          }
        }
      }

      .perks-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--c-muted);
          line-height: 1.4;

          .perk-icon {
            color: var(--c-accent);
            font-size: 0.7rem;
            margin-top: 2px;
            flex-shrink: 0;
          }
        }
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding-top: 4px;
        margin-bottom: 22px;

        .total-title {
          display: block;
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          color: var(--c-text);
        }

        .total-subtitle {
          display: block;
          font-size: 0.72rem;
          color: var(--c-muted);
          letter-spacing: 0.04em;
        }

        .total-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--c-primary);
          line-height: 1;
        }
      }

      .checkout-btn {
        margin-top: 8px;
        letter-spacing: 0.08em;
      }

      .summary-note {
        font-size: 0.74rem;
        color: var(--c-muted);
        margin-top: 16px;
        line-height: 1.5;
        text-align: center;
      }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  menuOpen = signal(false);

  getStyleCode(product: any): string {
    return product.product_code || `CR-${product.id.toString().padStart(4, '0')}`;
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
}
