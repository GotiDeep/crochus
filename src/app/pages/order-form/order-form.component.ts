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
          <header class="page-header">
            <span class="section-label">Almost Ready</span>
            <h1>Complete Your Order</h1>
            <p class="header-desc">
              Provide your delivery details below. We'll generate a WhatsApp order summary so you can confirm
              colors, customizations, and payment directly with the maker.
            </p>
          </header>

          @if (cart.items().length === 0 && !submitted()) {
            <div class="empty-state card fade-in">
              <span class="empty-icon">🛍️</span>
              <h2>Your basket is empty</h2>
              <p>Please add some handmade items before proceeding to checkout.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg">Browse Collection</a>
            </div>
          } @else if (submitted()) {
            <!-- Success State -->
            <div class="success-card card fade-in" role="status">
              <div class="success-badge">✅</div>
              <h2>Order Shared via WhatsApp!</h2>
              <p>
                Your order details have been prepared and WhatsApp opened. If your chat didn't launch automatically,
                don't worry — our artisan team is available at <strong>+{{ whatsappNumber }}</strong>.
              </p>
              <div class="success-actions">
                <a routerLink="/shop" class="btn btn-primary">Continue Shopping</a>
                <a routerLink="/profile" class="btn btn-outline">My Account</a>
              </div>
            </div>
          } @else {
            <div class="order-layout">
              <!-- Form Section -->
              <section class="order-form-card card">
                <div class="card-header">
                  <h3>1. Delivery Address & Contact</h3>
                  <span class="badge-step">Required</span>
                </div>
                <div class="divider"></div>

                <form (ngSubmit)="submitOrder()" novalidate>
                  <div class="form-group">
                    <label class="form-label" for="full_name">Full Name *</label>
                    <input
                      id="full_name"
                      type="text"
                      class="form-control"
                      [(ngModel)]="form.full_name"
                      name="full_name"
                      placeholder="Receiver's full name"
                      [class.error]="errors.full_name"
                      required
                    />
                    @if (errors.full_name) {
                      <span class="field-error">{{ errors.full_name }}</span>
                    }
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="phone">Phone Number (WhatsApp) *</label>
                      <input
                        id="phone"
                        type="tel"
                        class="form-control"
                        [(ngModel)]="form.phone"
                        name="phone"
                        placeholder="10-digit mobile number"
                        [class.error]="errors.phone"
                        maxlength="10"
                        required
                      />
                      @if (errors.phone) {
                        <span class="field-error">{{ errors.phone }}</span>
                      }
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="pincode">Postal Pincode *</label>
                      <input
                        id="pincode"
                        type="text"
                        class="form-control"
                        [(ngModel)]="form.pincode"
                        name="pincode"
                        placeholder="6-digit pincode"
                        [class.error]="errors.pincode"
                        maxlength="6"
                        required
                      />
                      @if (errors.pincode) {
                        <span class="field-error">{{ errors.pincode }}</span>
                      }
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="address">Full Delivery Address *</label>
                    <textarea
                      id="address"
                      class="form-control"
                      [(ngModel)]="form.address"
                      name="address"
                      placeholder="House / Flat no., Apartment, Street, Landmark, City, State"
                      rows="3"
                      [class.error]="errors.address"
                      required
                    ></textarea>
                    @if (errors.address) {
                      <span class="field-error">{{ errors.address }}</span>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="note">Gift Note or Custom Request (Optional)</label>
                    <textarea
                      id="note"
                      class="form-control"
                      [(ngModel)]="form.note"
                      name="note"
                      placeholder="e.g. Please wrap with birthday card, specific flower color, etc."
                      rows="2"
                    ></textarea>
                  </div>
                </form>
              </section>

              <!-- Order Summary Section -->
              <aside class="order-summary-card card">
                <h3>2. Order Summary</h3>
                <div class="divider"></div>

                <div class="items-list">
                  @for (item of cart.items(); track item.product.id) {
                    <div class="order-item">
                      <img [src]="item.product.photos[0]" [alt]="item.product.name" width="48" height="48" loading="lazy" />
                      <div class="oi-info">
                        <p class="oi-name">{{ item.product.name }}</p>
                        <p class="oi-qty">Qty: {{ item.quantity }} × ₹{{ item.product.price | number:'1.0-0':'en-IN' }}</p>
                      </div>
                      <span class="oi-price">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                    </div>
                  }
                </div>

                <div class="divider"></div>

                <div class="total-row">
                  <div>
                    <span class="total-label">Total Amount</span>
                    <span class="shipping-pill">🌿 Delivery coordinated on WhatsApp</span>
                  </div>
                  <span class="total-amt">₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                </div>

                <div class="wa-banner">
                  <span class="wa-icon">💬</span>
                  <p>
                    Clicking below creates your order and opens WhatsApp with your pre-filled items and address.
                  </p>
                </div>

                <button
                  type="button"
                  class="btn btn-primary btn-full btn-lg submit-order-btn"
                  [disabled]="submitting()"
                  (click)="submitOrder()"
                >
                  @if (submitting()) {
                    Preparing your order…
                  } @else {
                    💬 Confirm & Order on WhatsApp
                  }
                </button>

                <a routerLink="/cart" class="btn btn-ghost btn-full" style="margin-top: 10px;">
                  ← Modify Cart Items
                </a>
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
      max-width: 680px;

      h1 {
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        margin: 8px 0 6px;
      }

      .header-desc {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }

    .empty-state {
      text-align: center;
      padding: clamp(48px, 8vw, 80px) 24px;
      max-width: 480px;
      margin: 0 auto 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .empty-icon {
        font-size: 3rem;
      }

      h2 {
        font-size: 1.6rem;
        margin: 0;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.95rem;
        margin: 0;
      }
    }

    .order-layout {
      display: grid;
      grid-template-columns: 1fr 390px;
      gap: clamp(24px, 4vw, 40px);
      align-items: start;
      padding-bottom: clamp(48px, 6vw, 80px);

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .order-form-card {
      padding: clamp(24px, 4vw, 36px);
      border-radius: var(--radius-md);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;

        h3 {
          font-size: 1.25rem;
          margin: 0;
        }

        .badge-step {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--primary);
          background: rgba(74, 92, 47, 0.12);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 16px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .form-control.error {
      border-color: var(--error-text);
      &:focus {
        box-shadow: 0 0 0 3px rgba(138, 47, 47, 0.15);
      }
    }

    .field-error {
      display: block;
      font-size: 0.78rem;
      color: var(--error-text);
      margin-top: 4px;
      font-weight: 500;
    }

    .order-summary-card {
      padding: clamp(24px, 4vw, 32px);
      position: sticky;
      top: 96px;
      border-radius: var(--radius-md);

      h3 {
        font-size: 1.25rem;
        margin: 0 0 14px;
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 240px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 12px;

      img {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-sm);
        object-fit: cover;
        border: 1px solid var(--border);
        flex-shrink: 0;
      }

      .oi-info {
        flex: 1;
        min-width: 0;

        .oi-name {
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 500;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .oi-qty {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin: 2px 0 0;
        }
      }

      .oi-price {
        font-family: var(--font-heading);
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
        flex-shrink: 0;
      }
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6px 0 16px;

      .total-label {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .shipping-pill {
        display: block;
        font-size: 0.76rem;
        color: var(--accent);
        margin-top: 2px;
      }

      .total-amt {
        font-family: var(--font-heading);
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--primary);
      }
    }

    .wa-banner {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      background: rgba(37, 211, 102, 0.08);
      border: 1px solid rgba(37, 211, 102, 0.25);
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;

      .wa-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.45;
      }
    }

    .submit-order-btn {
      background: #25D366;
      border-color: #25D366;
      color: #FFFFFF;

      &:hover:not(:disabled) {
        background: #1EBE5D;
        border-color: #1EBE5D;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
      }
    }

    .success-card {
      text-align: center;
      padding: clamp(48px, 8vw, 80px) 24px;
      max-width: 540px;
      margin: 0 auto clamp(48px, 6vw, 80px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .success-badge {
        font-size: 3.5rem;
      }

      h2 {
        font-size: 1.85rem;
        margin: 0;
        color: var(--text-primary);
      }

      p {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .success-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 12px;
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
  whatsappNumber = '918200502248';

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
    if (!this.form.phone.trim() || !/^\d{10}$/.test(this.form.phone)) this.errors.phone = 'Enter a valid 10-digit mobile number';
    if (!this.form.address.trim()) this.errors.address = 'Full address is required';
    if (!this.form.pincode.trim() || !/^\d{6}$/.test(this.form.pincode)) this.errors.pincode = 'Enter a valid 6-digit pincode';
    return Object.keys(this.errors).length === 0;
  }

  submitOrder() {
    if (!this.validate()) return;
    this.submitting.set(true);

    this.orderService.submitOrder(this.form)
      .then((response) => {
        this.whatsappNumber = response.whatsapp_number;
        const message = this.orderService.generateWhatsAppMessage(response.order);
        const opened = this.orderService.openWhatsApp(message, response.whatsapp_number);

        this.cart.clearCart();
        this.submitted.set(true);

        if (!opened) {
          this.toast.error(`WhatsApp could not open automatically. Reach us directly at ${response.whatsapp_number}`);
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
