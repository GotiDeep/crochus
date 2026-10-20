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
          <div class="page-header">
            <span class="section-label">My Account</span>
            <h1>Profile</h1>
          </div>

          <div class="profile-layout">
            <!-- Sidebar Tabs -->
            <nav class="profile-nav card">
              <div class="user-avatar-big">
                {{ auth.currentUser()?.full_name?.charAt(0) }}
              </div>
              <p class="user-name-display">{{ auth.currentUser()?.full_name }}</p>
              <p class="user-email-display">{{ auth.currentUser()?.email }}</p>

              <div class="divider" style="margin: 16px 0"></div>

              <button class="nav-tab" [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">
                👤 My Details
              </button>
              <button class="nav-tab" [class.active]="activeTab() === 'orders'" (click)="loadOrders()">
                📦 Order History
              </button>
              <button class="nav-tab logout" (click)="auth.logout()">🚪 Logout</button>
            </nav>

            <!-- Content -->
            <div class="profile-content">
              <!-- Details Tab -->
              @if (activeTab() === 'profile') {
                <div class="content-card card fade-in">
                  <div class="card-head">
                    <h3>Personal Details</h3>
                    <button class="btn btn-ghost btn-sm" (click)="toggleEditMode()">
                      {{ editMode() ? 'Cancel' : '✏️ Edit' }}
                    </button>
                  </div>
                  <div class="divider"></div>

                  @if (!editMode()) {
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">{{ auth.currentUser()?.full_name }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">{{ auth.currentUser()?.email }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Mobile</span>
                        <span class="info-value">{{ auth.currentUser()?.mobile || '—' }}</span>
                      </div>
                      <div class="info-item full">
                        <span class="info-label">Address</span>
                        <span class="info-value">{{ auth.currentUser()?.address || '—' }}</span>
                      </div>
                    </div>
                  } @else {
                    <div class="edit-form">
                      <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" [(ngModel)]="editData.full_name" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Mobile</label>
                        <input type="tel" class="form-control" [(ngModel)]="editData.mobile" maxlength="10" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Delivery Address</label>
                        <textarea class="form-control" [(ngModel)]="editData.address" rows="3"></textarea>
                      </div>
                      <div class="form-actions">
                        <button class="btn btn-primary" [disabled]="saving()" (click)="saveProfile()">
                          {{ saving() ? 'Saving…' : 'Save Changes' }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Orders Tab -->
              @if (activeTab() === 'orders') {
                <div class="content-card card fade-in">
                  <h3 style="margin-bottom:20px">Order History</h3>

                  @if (ordersLoading()) {
                    <div style="text-align:center; padding:40px; color:var(--text-secondary)">Loading orders…</div>
                  } @else if (orders().length === 0) {
                    <div class="empty-state" style="padding:40px">
                      <span class="empty-icon">📦</span>
                      <h3>No orders yet</h3>
                      <p>Your order history will appear here.</p>
                      <a routerLink="/shop" class="btn btn-primary">Start Shopping</a>
                    </div>
                  } @else {
                    <div class="orders-list">
                      @for (order of paginatedOrders(); track order.id) {
                        <div class="order-card">
                          <div class="order-head">
                            <div>
                              <span class="order-id">#{{ order.id }}</span>
                              <span class="order-date">{{ order.created_at | date:'mediumDate' }}</span>
                            </div>
                            <span class="status-badge" [class]="'status-' + order.status">{{ order.status }}</span>
                          </div>
                          <div class="order-items-mini">
                            @for (item of order.items; track item.product.id) {
                              <div class="oi-mini">
                                <img [src]="item.product.photos[0]" [alt]="item.product.name" />
                                <span>{{ item.product.name }} × {{ item.quantity }}</span>
                              </div>
                            }
                          </div>
                          <div class="order-foot">
                            <span class="order-total">Total: ₹{{ order.total | number:'1.0-0':'en-IN' }}</span>
                          </div>
                        </div>
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
            </div>
          </div>
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .page-header { padding: 48px 0 32px; h1 { margin-top: 8px; } }

    .profile-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 28px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .profile-nav {
      padding: 24px 16px;
      position: sticky;
      top: 96px;
      text-align: center;
    }

    .user-avatar-big {
      width: 72px; height: 72px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      font-size: 1.8rem;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
    }

    .user-name-display {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-primary);
      margin: 0;
    }

    .user-email-display {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin: 4px 0 0;
    }

    .nav-tab {
      display: block;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      border-radius: 6px;
      text-align: left;
      font-size: 0.9rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;

      &:hover { background: var(--bg); color: var(--text-primary); }
      &.active { background: var(--bg); color: var(--primary); font-weight: 500; }
      &.logout { color: var(--error-text); margin-top: 8px; }
    }

    .content-card { padding: 28px; }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .info-item {
      &.full { grid-column: 1 / -1; }

      .info-label {
        display: block;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 6px;
        font-weight: 500;
      }

      .info-value {
        font-size: 0.95rem;
        color: var(--text-primary);
        font-weight: 400;
      }
    }

    .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }

    .orders-list { display: flex; flex-direction: column; gap: 16px; }

    .order-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .order-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);

      .order-id { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-right: 10px; }
      .order-date { font-size: 0.82rem; color: var(--text-secondary); }
    }

    .order-items-mini {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .oi-mini {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--text-secondary);

      img {
        width: 36px; height: 36px;
        border-radius: 4px;
        object-fit: cover;
        border: 1px solid var(--border);
        flex-shrink: 0;
      }
    }

    .order-foot {
      padding: 10px 16px;
      border-top: 1px solid var(--border);
      background: var(--bg);

      .order-total { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
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
        this.orders.set(orders);
        this.currentPage.set(1);
        this.ordersLoading.set(false);
      },
      error: (error) => {
        this.ordersLoading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load order history');
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
      this.toast.success('Profile updated!');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Could not update profile');
    } finally {
      this.saving.set(false);
    }
  }
}
