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
            <span class="section-label">Almost there</span>
            <h1>Place Your Order</h1>
          </div>

          @if (cart.items().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🛍</span>
              <h3>Your cart is empty</h3>
              <a routerLink="/shop" class="btn btn-primary">Shop Now</a>
            </div>
          } @else if (submitted()) {
            <!-- Success State -->
            <div class="success-state fade-in">
              <div class="success-icon">✅</div>
              <h2>Order Sent to WhatsApp!</h2>
              <p>Your order has been shared on WhatsApp. Our team will confirm it shortly and get back to you.</p>
              <div class="success-actions">
                <a routerLink="/shop" class="btn btn-primary">Continue Shopping</a>
                <a routerLink="/profile" class="btn btn-outline">My Orders</a>
              </div>
            </div>
          } @else {
            <div class="order-layout">
              <!-- Form -->
              <div class="order-form-section">
                <h3>Delivery Details</h3>
                <div class="divider"></div>

                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="form.full_name"
                    placeholder="Your full name" [class.error]="errors.full_name" />
                  @if (errors.full_name) { <span class="field-error">{{ errors.full_name }}</span> }
                </div>

                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" class="form-control" [(ngModel)]="form.phone"
                    placeholder="10-digit mobile number" [class.error]="errors.phone" maxlength="10" />
                  @if (errors.phone) { <span class="field-error">{{ errors.phone }}</span> }
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Address *</label>
                  <textarea class="form-control" [(ngModel)]="form.address"
                    placeholder="House no., Street, Area, City…" rows="3"
                    [class.error]="errors.address"></textarea>
                  @if (errors.address) { <span class="field-error">{{ errors.address }}</span> }
                </div>

                <div class="form-group">
                  <label class="form-label">Pincode *</label>
                  <input type="text" class="form-control" [(ngModel)]="form.pincode"
                    placeholder="6-digit pincode" [class.error]="errors.pincode" maxlength="6" />
                  @if (errors.pincode) { <span class="field-error">{{ errors.pincode }}</span> }
                </div>

                <div class="form-group">
                  <label class="form-label">Special Note (optional)</label>
                  <textarea class="form-control" [(ngModel)]="form.note"
                    placeholder="Gift wrap request, special instructions…" rows="2"></textarea>
                </div>
              </div>

              <!-- Summary -->
              <div class="order-summary-section">
                <div class="summary-card card">
                  <h3>Order Summary</h3>
                  <div class="divider"></div>

                  <div class="order-items">
                    @for (item of cart.items(); track item.product.id) {
                      <div class="order-item">
                        <img [src]="item.product.photos[0]" [alt]="item.product.name" />
                        <div class="oi-info">
                          <p class="oi-name">{{ item.product.name }}</p>
                          <p class="oi-qty">Qty: {{ item.quantity }}</p>
                        </div>
                        <span class="oi-price">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                      </div>
                    }
                  </div>

                  <div class="divider"></div>

                  <div class="total-row">
                    <span>Total</span>
                    <span class="total-amt">₹{{ cart.totalPrice() | number:'1.0-0':'en-IN' }}</span>
                  </div>

                  <div class="wa-info">
                    <span>💬</span>
                    <p>This order will be sent via WhatsApp. Payment & shipping will be coordinated by our team.</p>
                  </div>

                  <button
                    class="btn btn-primary btn-full btn-lg"
                    style="margin-top:20px"
                    [disabled]="submitting()"
                    (click)="submitOrder()"
                  >
                    @if (submitting()) {
                      Sending…
                    } @else {
                      💬 Send Order via WhatsApp
                    }
                  </button>

                  <a routerLink="/cart" class="btn btn-ghost btn-full" style="margin-top:10px">
                    ← Back to Cart
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
    .page-header { padding: 48px 0 32px; h1 { margin-top: 8px; } }

    .order-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 40px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .order-form-section {
      h3 { font-size: 1.1rem; margin-bottom: 16px; }
    }

    .form-control.error {
      border-color: var(--error-text);
      &:focus { box-shadow: 0 0 0 3px rgba(138, 47, 47, 0.12); }
    }

    .summary-card {
      padding: 28px;
      position: sticky;
      top: 96px;
      h3 { margin-bottom: 16px; }
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 16px;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 12px;

      img {
        width: 52px; height: 52px;
        border-radius: 6px;
        object-fit: cover;
        border: 1px solid var(--border);
        flex-shrink: 0;
      }

      .oi-info { flex: 1; min-width: 0; }
      .oi-name {
        font-size: 0.88rem;
        color: var(--text-primary);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }
      .oi-qty { font-size: 0.78rem; color: var(--text-secondary); margin: 2px 0 0; }
      .oi-price { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); flex-shrink: 0; }
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      padding: 4px 0;

      .total-amt {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.5rem;
        color: var(--accent);
      }
    }

    .wa-info {
      display: flex;
      gap: 10px;
      background: var(--bg);
      padding: 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      margin-top: 16px;
      font-size: 0.82rem;

      p { margin: 0; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; }
    }

    .success-state {
      text-align: center;
      padding: 80px 24px;

      .success-icon { font-size: 4rem; margin-bottom: 24px; display: block; }
      h2 { margin-bottom: 16px; }
      p { max-width: 460px; margin: 0 auto 32px; }

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
