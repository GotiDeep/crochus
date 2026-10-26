import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { OrderForm } from '../../core/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <div class="page-header">
            <span class="section-label">Easy Ordering</span>
            <h1>Delivery Details</h1>
            <p class="header-subtitle">Provide your delivery address to send your order inquiry to our team on WhatsApp</p>
          </div>

          @if (cart.items().length === 0) {
            <div class="empty-state">
              <div class="empty-gem">✦</div>
              <h3>No Items in Shopping Bag</h3>
              <p>Please select items from our catalogue before checking out.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg" style="margin-top:14px;">Browse All Products</a>
            </div>
          } @else if (submitted()) {
            <!-- Success State -->
            <div class="success-state fade-in">
              <div class="success-gem">✦</div>
              <h2>Order Sent to WhatsApp!</h2>
              <p>Your order details have been shared with our team on WhatsApp. We will confirm your items, custom details, and delivery with you shortly.</p>
              <div class="success-actions">
                <a routerLink="/shop" class="btn btn-primary btn-lg">Browse More Products</a>
                <a routerLink="/profile" class="btn btn-outline btn-lg">View My Orders</a>
              </div>
            </div>
          } @else {
            <div class="order-layout">
              <!-- Form -->
              <div class="order-form-section card">
                <div class="form-header">
                  <span class="fh-eyebrow">Shipping Information</span>
                  <h3>Delivery Address</h3>
                </div>
                <div class="gold-hairline"></div>

                <div class="form-group floating-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="form.full_name"
                    placeholder="E.g. Priya Sharma" [class.error]="errors.full_name" />
                  @if (errors.full_name) { <span class="field-error">{{ errors.full_name }}</span> }
                </div>

                <div class="form-group floating-group">
                  <label class="form-label">WhatsApp Mobile Number *</label>
                  <input type="tel" class="form-control" [(ngModel)]="form.phone"
                    placeholder="10-digit mobile number for order confirmation" [class.error]="errors.phone" maxlength="10" />
                  @if (errors.phone) { <span class="field-error">{{ errors.phone }}</span> }
                </div>

                <div class="form-group floating-group">
                  <label class="form-label">Complete Delivery Address *</label>
                  <textarea class="form-control" [(ngModel)]="form.address"
                    placeholder="House/Flat no., Building, Street, City, State…" rows="3"
                    [class.error]="errors.address"></textarea>
                  @if (errors.address) { <span class="field-error">{{ errors.address }}</span> }
                </div>

                <div class="form-group floating-group">
                  <label class="form-label">Postal Pincode *</label>
                  <input type="text" class="form-control" [(ngModel)]="form.pincode"
                    placeholder="6-digit pincode" [class.error]="errors.pincode" maxlength="6" />
                  @if (errors.pincode) { <span class="field-error">{{ errors.pincode }}</span> }
                </div>

                <div class="form-group floating-group">
                  <label class="form-label">Notes or Custom Requests (Optional)</label>
                  <textarea class="form-control" [(ngModel)]="form.note"
                    placeholder="Color preference, custom request, gift note, or delivery instructions…" rows="3"></textarea>
                </div>
              </div>

              <!-- Summary -->
              <div class="order-summary-section">
                <div class="summary-card card">
                  <div class="summary-header">
                    <span class="summary-eyebrow">Order Summary</span>
                    <h3>Selected Items</h3>
                  </div>
                  <div class="gold-hairline"></div>

                  <div class="order-items">
                    @for (item of cart.items(); track item.product.id) {
                      <div class="order-item">
                        <img [src]="item.product.photos[0]" [alt]="item.product.name" />
                        <div class="oi-info">
                          <span class="oi-sku">Design #{{ item.product.id }}</span>
                          <p class="oi-name">{{ item.product.name }}</p>
                          <p class="oi-qty">Qty: {{ item.quantity }}</p>
                        </div>
                        <span class="oi-price">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                      </div>
                    }
                  </div>

                  <div class="gold-hairline"></div>

                  <div class="total-row">
                    <div class="tr-label">
                      <span>Total Price</span>
                      <small>All Taxes Included</small>
                    </div>
                    <span class="total-amt">₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                  </div>

                  <div class="wa-info">
                    <span class="wa-icon">💬</span>
                    <p>Your order details will open directly in WhatsApp so our team can confirm availability, ring size, and payment with you.</p>
                  </div>

                  <button
                    class="btn btn-primary btn-full btn-lg submit-order-btn"
                    style="margin-top:20px"
                    [disabled]="submitting()"
                    (click)="submitOrder()"
                  >
                    @if (submitting()) {
                      <span class="btn-spinner"></span>
                      <span>Connecting to WhatsApp…</span>
                    } @else {
                      <span>Send Order via WhatsApp →</span>
                    }
                  </button>

                  <a routerLink="/cart" class="btn btn-ghost btn-full" style="margin-top:12px; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase;">
                    ← Return to Shopping Bag
                  </a>
                </div>
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
      max-width: 640px;
      margin: 0 auto;

      h1 {
        margin-top: 8px;
        font-size: clamp(2rem, 3.5vw, 2.8rem);
      }

      .header-subtitle {
        color: var(--c-muted);
        font-size: 0.95rem;
        margin-top: 6px;
        line-height: 1.5;
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
      }
    }

    .order-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 36px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .order-form-section {
      padding: 36px 32px;
      border-color: rgba(200, 196, 154, 0.4);

      @media (max-width: 600px) {
        padding: 20px 14px;
      }

      .form-header {
        .fh-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--c-muted);
          display: block;
        }

        h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          margin-top: 2px;
          color: var(--c-text);
        }
      }
    }

    .gold-hairline {
      height: 1px;
      background: linear-gradient(90deg, var(--c-accent), rgba(200, 196, 154, 0.2));
      margin: 18px 0 24px;
    }

    .floating-group {
      margin-bottom: 22px;

      .form-label {
        display: block;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-muted);
        margin-bottom: 6px;
      }

      .form-control {
        border-color: rgba(200, 196, 154, 0.5);
        font-family: 'Jost', sans-serif;
        font-size: 0.95rem;

        &:focus {
          border-color: var(--c-primary);
          box-shadow: 0 0 0 3px rgba(74, 92, 47, 0.1);
        }
      }
    }

    .field-error {
      font-size: 0.75rem;
      color: #B23B3B;
      margin-top: 4px;
      font-weight: 500;
      display: block;
    }

    .submit-order-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      letter-spacing: 0.08em;
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-control.error {
      border-color: #B23B3B;
      &:focus { box-shadow: 0 0 0 3px rgba(178, 59, 59, 0.12); }
    }

    .summary-card {
      padding: 32px 28px;
      position: sticky;
      top: 100px;
      border-color: rgba(200, 196, 154, 0.5);
      background: var(--c-surface);

      @media (max-width: 600px) {
        padding: 20px 14px;
      }

      .summary-header {
        .summary-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--c-muted);
          display: block;
        }

        h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--c-text);
          margin-top: 2px;
        }
      }
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
      max-height: 320px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 14px;

      img {
        width: 58px;
        height: 64px;
        border-radius: 3px;
        object-fit: cover;
        border: 1px solid rgba(200, 196, 154, 0.4);
        flex-shrink: 0;
      }

      .oi-info {
        flex: 1;
        min-width: 0;

        .oi-sku {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: var(--c-primary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .oi-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          color: var(--c-text);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 1px 0 2px;
        }

        .oi-qty {
          font-size: 0.75rem;
          color: var(--c-muted);
          margin: 0;
        }
      }

      .oi-price {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--c-primary);
        flex-shrink: 0;
      }
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6px 0;

      .tr-label {
        span {
          display: block;
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          color: var(--c-text);
        }

        small {
          display: block;
          font-size: 0.7rem;
          color: var(--c-muted);
        }
      }

      .total-amt {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.85rem;
        font-weight: 700;
        color: var(--c-primary);
      }
    }

    .wa-info {
      display: flex;
      gap: 12px;
      background: rgba(74, 92, 47, 0.05);
      padding: 14px;
      border-radius: 4px;
      border: 1px solid rgba(200, 196, 154, 0.4);
      margin-top: 18px;

      .wa-icon {
        color: var(--c-accent);
        font-size: 0.85rem;
        flex-shrink: 0;
        margin-top: 2px;
      }

      p {
        margin: 0;
        color: var(--c-muted);
        font-size: 0.78rem;
        line-height: 1.5;
      }
    }

    .success-state {
      text-align: center;
      padding: 80px 24px;
      max-width: 600px;
      margin: 0 auto;

      .success-gem {
        font-size: 2.8rem;
        color: var(--c-accent);
        margin-bottom: 20px;
        display: block;
        animation: pulseGem 2s ease-in-out infinite;
      }

      @keyframes pulseGem {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      h2 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2.4rem;
        margin-bottom: 16px;
        color: var(--c-text);
      }

      p {
        color: var(--c-muted);
        font-size: 1rem;
        line-height: 1.7;
        margin-bottom: 36px;
      }

      .success-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  `]
})
export class OrderFormComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);

  menuOpen = signal(false);
  submitting = signal(false);
  submitted = signal(false);

  form: OrderForm = {
    full_name: this.auth.currentUser()?.full_name || '',
    phone: this.auth.currentUser()?.mobile || '',
    address: this.auth.currentUser()?.address || '',
    pincode: '',
    note: ''
  };

  errors: Partial<Record<keyof OrderForm, string>> = {};

  validate(): boolean {
    this.errors = {};
    if (!this.form.full_name.trim()) this.errors.full_name = 'Full name is required';
    if (!this.form.phone.trim() || !/^\d{10}$/.test(this.form.phone)) this.errors.phone = 'Enter a valid 10-digit number';
    if (!this.form.address.trim()) this.errors.address = 'Address is required';
    if (!this.form.pincode.trim() || !/^\d{6}$/.test(this.form.pincode)) this.errors.pincode = 'Enter a valid 6-digit pincode';
    return Object.keys(this.errors).length === 0;
  }

  submitOrder() {
    if (!this.validate()) return;
    this.submitting.set(true);
    this.orderService.submitOrder(this.form)
      .then((response) => {
        const message = this.orderService.generateWhatsAppMessage(response.order);
        const opened = this.orderService.openWhatsApp(message, response.whatsapp_number);

        this.cart.clearCart();
        this.submitted.set(true);

        if (!opened) {
          this.toast.error(`WhatsApp could not open. Please contact us manually at ${response.whatsapp_number}`);
        }
      })
      .catch((error) => {
        this.toast.error(error instanceof Error ? error.message : 'Could not place your order');
      })
      .finally(() => {
        this.submitting.set(false);
      });
  }
}
