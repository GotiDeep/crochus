import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <header class="page-header">
            <span class="section-label">Account Management</span>
            <h1>My Collector Profile</h1>
          </header>

          <div class="profile-layout">
            <!-- Sidebar Navigation -->
            <aside class="profile-nav card">
              <div class="user-avatar-wrap">
                <div class="user-avatar-big">
                  {{ auth.currentUser()?.full_name?.charAt(0) || 'C' }}
                </div>
                <h3 class="user-name-display">{{ auth.currentUser()?.full_name || 'Artisan Collector' }}</h3>
                <p class="user-email-display">{{ auth.currentUser()?.email }}</p>
              </div>

              <div class="divider" style="margin: 20px 0 16px;"></div>

              <div class="nav-links">
                <button
                  type="button"
                  class="nav-tab"
                  [class.active]="activeTab() === 'profile'"
                  (click)="activeTab.set('profile')"
                >
                  <span class="tab-icon">👤</span> My Details
                </button>
                <button
                  type="button"
                  class="nav-tab"
                  [class.active]="activeTab() === 'orders'"
                  (click)="loadOrders()"
                >
                  <span class="tab-icon">📦</span> Order History
                </button>
                <a routerLink="/wishlist" class="nav-tab link-tab">
                  <span class="tab-icon">♡</span> Saved Wishlist
                </a>
                <button type="button" class="nav-tab logout-btn" (click)="auth.logout()">
                  <span class="tab-icon">🚪</span> Sign Out
                </button>
              </div>
            </aside>

            <!-- Main Tab Content -->
            <section class="profile-content">
              <!-- Personal Details Tab -->
              @if (activeTab() === 'profile') {
                <div class="content-card card fade-in">
                  <div class="card-head">
                    <div>
                      <h3>Personal Information</h3>
                      <p class="head-sub">Saved shipping details used during WhatsApp checkout</p>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm edit-toggle-btn" (click)="toggleEditMode()">
                      {{ editMode() ? 'Cancel' : '✏️ Edit Profile' }}
                    </button>
                  </div>
                  <div class="divider"></div>

                  @if (!editMode()) {
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">{{ auth.currentUser()?.full_name || '—' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Email Address</span>
                        <span class="info-value">{{ auth.currentUser()?.email || '—' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">WhatsApp Mobile</span>
                        <span class="info-value">{{ auth.currentUser()?.mobile || '—' }}</span>
                      </div>
                      <div class="info-item full">
                        <span class="info-label">Default Delivery Address</span>
                        <span class="info-value address-value">{{ auth.currentUser()?.address || 'No address saved yet' }}</span>
                      </div>
                    </div>
                  } @else {
                    <form class="edit-form" (ngSubmit)="saveProfile()">
                      <div class="form-group">
                        <label class="form-label" for="prof-name">Full Name</label>
                        <input id="prof-name" type="text" class="form-control" [(ngModel)]="editData.full_name" name="full_name" />
                      </div>
                      <div class="form-group">
                        <label class="form-label" for="prof-mobile">WhatsApp Mobile (10 Digits)</label>
                        <input id="prof-mobile" type="tel" class="form-control" [(ngModel)]="editData.mobile" name="mobile" maxlength="10" />
                      </div>
                      <div class="form-group">
                        <label class="form-label" for="prof-address">Default Delivery Address</label>
                        <textarea id="prof-address" class="form-control" [(ngModel)]="editData.address" name="address" rows="3"></textarea>
                      </div>
                      <div class="form-actions">
                        <button type="button" class="btn btn-ghost" (click)="toggleEditMode()">Cancel</button>
                        <button type="submit" class="btn btn-primary" [disabled]="saving()">
                          {{ saving() ? 'Saving Changes…' : 'Save Details' }}
                        </button>
                      </div>
                    </form>
                  }
                </div>
              }

              <!-- Orders Tab -->
              @if (activeTab() === 'orders') {
                <div class="content-card card fade-in">
                  <div class="card-head">
                    <div>
                      <h3>Order History</h3>
                      <p class="head-sub">Review past creations ordered via our studio</p>
                    </div>
                  </div>
                  <div class="divider"></div>

                  @if (ordersLoading()) {
                    <div class="loading-state">
                      <div class="spinner"></div>
                      <p>Loading your orders…</p>
                    </div>
                  } @else if (orders().length === 0) {
                    <div class="empty-orders">
                      <span class="empty-icon">📦</span>
                      <h4>No orders placed yet</h4>
                      <p>When you place an order via WhatsApp or our store, it will be catalogued here.</p>
                      <a routerLink="/shop" class="btn btn-primary">Browse Collection</a>
                    </div>
                  } @else {
                    <div class="orders-list">
                      @for (order of paginatedOrders(); track order.id) {
                        <article class="order-box">
                          <header class="order-box-head">
                            <div class="order-meta">
                              <span class="order-id">Order #{{ order.id }}</span>
                              <span class="order-date">{{ order.created_at | date:'mediumDate' }}</span>
                            </div>
                            <span class="status-badge" [class]="'status-' + order.status">
                              {{ order.status }}
                            </span>
                          </header>

                          <div class="order-box-items">
                            @for (item of order.items; track item.product.id) {
                              <div class="order-item-row">
                                <img [src]="item.product.photos[0]" [alt]="item.product.name" width="44" height="44" loading="lazy" />
                                <div class="item-meta">
                                  <span class="item-title">{{ item.product.name }}</span>
                                  <span class="item-sub">Qty: {{ item.quantity }}</span>
                                </div>
                                <span class="item-price">₹{{ item.product.price * item.quantity | number:'1.0-0':'en-IN' }}</span>
                              </div>
                            }
                          </div>

                          <footer class="order-box-foot">
                            <span class="foot-label">Total Amount</span>
                            <span class="foot-amount">₹{{ order.total | number:'1.0-0':'en-IN' }}</span>
                          </footer>
                        </article>
                      }
                    </div>

                    <!-- Pagination -->
                    @if (totalPages() > 1) {
                      <div class="pagination">
                        <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">‹</button>
                        @for (p of pageNumbers(); track p) {
                          <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p }}</button>
                        }
                        <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">›</button>
                      </div>
                    }
                  }
                </div>
              }
            </section>
          </div>
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
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: clamp(24px, 4vw, 36px);
      align-items: start;
      padding-bottom: clamp(48px, 6vw, 80px);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .profile-nav {
      padding: 28px 20px;
      position: sticky;
      top: 96px;
      border-radius: var(--radius-md);

      .user-avatar-wrap {
        text-align: center;
      }

      .user-avatar-big {
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: white;
        border-radius: 50%;
        font-family: var(--font-heading);
        font-size: 2rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        box-shadow: 0 4px 14px rgba(74, 92, 47, 0.25);
      }

      .user-name-display {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .user-email-display {
        font-size: 0.82rem;
        color: var(--text-secondary);
        margin: 4px 0 0;
        word-break: break-word;
      }
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-tab {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 14px;
      min-height: 44px;
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      text-align: left;
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-fast);

      .tab-icon {
        font-size: 1.1rem;
      }

      &:hover {
        background: var(--bg);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(74, 92, 47, 0.08);
        border-color: rgba(74, 92, 47, 0.2);
        color: var(--primary);
        font-weight: 600;
      }

      &.logout-btn {
        color: var(--error-text);
        margin-top: 8px;
        border-top: 1px solid var(--border);
        border-radius: 0;
        padding-top: 14px;

        &:hover {
          background: var(--error-bg);
        }
      }
    }

    .content-card {
      padding: clamp(24px, 4vw, 36px);
      border-radius: var(--radius-md);

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;

        h3 {
          font-size: 1.35rem;
          margin: 0;
        }

        .head-sub {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 4px 0 0;
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding-top: 8px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }

      .info-item {
        &.full {
          grid-column: 1 / -1;
        }

        .info-label {
          display: block;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 6px;
          font-weight: 600;
        }

        .info-value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 500;

          &.address-value {
            line-height: 1.6;
          }
        }
      }
    }

    .edit-form {
      padding-top: 8px;

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .order-box {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--surface);
      transition: box-shadow var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-sm);
      }
    }

    .order-box-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: var(--surface-warm);
      border-bottom: 1px solid var(--border);

      .order-id {
        font-weight: 600;
        font-size: 0.92rem;
        color: var(--text-primary);
        margin-right: 12px;
      }

      .order-date {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }

      .status-badge {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 3px 10px;
        border-radius: var(--radius-full);

        &.status-new {
          background: rgba(74, 92, 47, 0.12);
          color: var(--primary);
        }

        &.status-confirmed {
          background: rgba(78, 110, 88, 0.15);
          color: var(--accent);
        }

        &.status-delivered {
          background: rgba(37, 211, 102, 0.15);
          color: #128C7E;
        }
      }
    }

    .order-box-items {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .order-item-row {
        display: flex;
        align-items: center;
        gap: 12px;

        img {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1px solid var(--border);
        }

        .item-meta {
          flex: 1;
          min-width: 0;

          .item-title {
            display: block;
            font-size: 0.9rem;
            color: var(--text-primary);
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-sub {
            font-size: 0.78rem;
            color: var(--text-secondary);
          }
        }

        .item-price {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .order-box-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: var(--surface-warm);
      border-top: 1px solid var(--border);

      .foot-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }

      .foot-amount {
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--primary);
      }
    }

    .empty-orders {
      text-align: center;
      padding: 48px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .empty-icon {
        font-size: 2.8rem;
      }

      h4 {
        font-size: 1.3rem;
        margin: 0;
      }

      p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        max-width: 360px;
        margin: 0 0 12px;
      }
    }

    .loading-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--text-secondary);

      .spinner {
        width: 32px;
        height: 32px;
        border: 2px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  menuOpen = signal(false);
  activeTab = signal<'profile' | 'orders'>('profile');
  editMode = signal(false);
  saving = signal(false);
  ordersLoading = signal(false);
  orders = signal<Order[]>([]);
  currentPage = signal(1);
  limit = 10;

  totalPages = () => Math.ceil(this.orders().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedOrders = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.orders().slice(start, start + this.limit);
  };

  editData: Partial<User> = {};

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.editData = { full_name: u.full_name, mobile: u.mobile, address: u.address };
    }
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
  }

  loadOrders() {
    this.activeTab.set('orders');
    if (this.orders().length > 0) return;
    this.ordersLoading.set(true);
    this.orderService.getOrderHistory().subscribe({
      next: (orders) => {
        this.orders.set(orders || []);
        this.currentPage.set(1);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.ordersLoading.set(false);
        this.orders.set([]);
      }
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }

  async saveProfile() {
    this.saving.set(true);
    try {
      await this.auth.updateProfile(this.editData);
      this.editMode.set(false);
      this.toast.success('Profile updated successfully!');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      this.saving.set(false);
    }
  }
}
