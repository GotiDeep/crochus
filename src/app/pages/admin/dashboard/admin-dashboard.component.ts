import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardOverview, DashboardStats, Order, Product } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <div>
            <h2 style="margin:0; font-size:1.5rem">Dashboard</h2>
            <p style="margin:4px 0 0; font-size:0.85rem; color:var(--text-secondary)">Welcome back, Admin</p>
          </div>
          <span class="date-chip">{{ today }}</span>
        </div>

        @if (loading()) {
          <div class="stats-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton stat-skeleton"></div>
            }
          </div>
        } @else {
          <div class="stats-grid fade-in">
            <div class="stat-card">
              <span class="stat-icon">P</span>
              <div class="stat-value">{{ stats()?.total_products }}</div>
              <div class="stat-label">Products</div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">O</span>
              <div class="stat-value">{{ stats()?.total_orders }}</div>
              <div class="stat-label">Orders</div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">U</span>
              <div class="stat-value">{{ stats()?.total_customers }}</div>
              <div class="stat-label">Customers</div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">C</span>
              <div class="stat-value">{{ stats()?.total_categories }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        }

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <a routerLink="/admin/products" class="action-card card">
              <span>Add Product</span>
            </a>
            <a routerLink="/admin/orders" class="action-card card">
              <span>View Orders</span>
            </a>
            <a routerLink="/admin/categories" class="action-card card">
              <span>Manage Categories</span>
            </a>
            <a routerLink="/admin/settings" class="action-card card">
              <span>Settings</span>
            </a>
          </div>
        </div>

        <!-- Recent Orders Section -->
        <div class="recent-section">
          <div class="section-head">
            <h3>Recent Orders</h3>
            <a routerLink="/admin/orders" class="btn btn-ghost btn-sm">View All -></a>
          </div>
          <div class="table-wrap card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders(); track order.id) {
                  <tr class="clickable-row" (click)="openOrderModal(order)">
                    <td><strong class="order-num-link">#{{ order.id }}</strong></td>
                    <td>{{ order.customer_name }}</td>
                    <td>
                      <span class="items-chip">{{ order.items.length }} item(s) ℹ️</span>
                    </td>
                    <td>₹{{ order.total | number:'1.0-0':'en-IN' }}</td>
                    <td><span class="status-badge" [class]="'status-' + order.status">{{ order.status }}</span></td>
                    <td>{{ order.created_at | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Products Section -->
        <div class="recent-section" style="margin-top:32px">
          <div class="section-head">
            <h3>Recent Products</h3>
            <a routerLink="/admin/products" class="btn btn-ghost btn-sm">Manage -></a>
          </div>
          <div class="table-wrap card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                @for (product of recentProducts(); track product.id) {
                  <tr>
                    <td>{{ product.name }}</td>
                    <td>{{ product.category_name }}</td>
                    <td>₹{{ product.price | number:'1.0-0':'en-IN' }}</td>
                    <td>{{ product.in_stock ? 'In Stock' : 'Out of Stock' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Order Details Modal -->
    @if (selectedOrder()) {
      <div class="modal-overlay" (click)="closeOrderModal()">
        <div class="modal order-modal" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <h3>Order #{{ selectedOrder()!.id }} Details</h3>
              <span class="modal-subtitle">{{ selectedOrder()!.created_at | date:'medium' }}</span>
            </div>
            <button class="close-btn" (click)="closeOrderModal()" aria-label="Close modal">✕</button>
          </div>

          <div class="modal-body">
            <!-- Customer Summary Card -->
            <div class="order-info-card">
              <div class="info-row">
                <span class="info-label">Customer Name:</span>
                <strong class="info-val">{{ selectedOrder()!.customer_name }}</strong>
              </div>
              <div class="info-row">
                <span class="info-label">Phone / WhatsApp:</span>
                <span class="info-val">
                  <a [href]="'tel:' + selectedOrder()!.phone" class="phone-link">{{ selectedOrder()!.phone }}</a>
                  <button class="btn-wa-chip" (click)="openWhatsApp(selectedOrder()!)">💬 Chat</button>
                </span>
              </div>
              @if (selectedOrder()!.customer_email) {
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-val">{{ selectedOrder()!.customer_email }}</span>
                </div>
              }
              <div class="info-row">
                <span class="info-label">Delivery Address:</span>
                <span class="info-val">{{ selectedOrder()!.address }} (Pincode: {{ selectedOrder()!.pincode }})</span>
              </div>
              @if (selectedOrder()!.note) {
                <div class="info-row">
                  <span class="info-label">Customer Note:</span>
                  <span class="info-val note-text">"{{ selectedOrder()!.note }}"</span>
                </div>
              }
            </div>

            <!-- Ordered Products List -->
            <div class="items-header-bar">
              <h4 class="items-title">Purchased Items</h4>
              <span class="badge-count">{{ selectedOrder()!.items.length }} {{ selectedOrder()!.items.length === 1 ? 'item' : 'items' }}</span>
            </div>
            <div class="order-items-list">
              @for (item of selectedOrder()!.items; track $index) {
                <div class="order-item-card">
                  <div class="item-thumb-box">
                    @if (item.product.photos && item.product.photos[0]) {
                      <img [src]="item.product.photos[0]" [alt]="item.product.name" class="item-thumb" />
                    } @else {
                      <span class="item-thumb-placeholder">🧶</span>
                    }
                  </div>
                  <div class="item-details">
                    <h5 class="item-name">{{ item.product.name }}</h5>
                    @if (item.product.product_code) {
                      <span class="item-code">Code: {{ item.product.product_code }}</span>
                    }
                    <div class="item-pricing">
                      <span class="item-unit-price">₹{{ item.product.price | number:'1.0-0':'en-IN' }} × {{ item.quantity }}</span>
                      <strong class="item-subtotal">₹{{ (item.product.price * item.quantity) | number:'1.0-0':'en-IN' }}</strong>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Total Bar -->
            <div class="order-total-bar">
              <span>Total Bill Amount</span>
              <strong>₹{{ selectedOrder()!.total | number:'1.0-0':'en-IN' }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeOrderModal()">Close</button>
            <a [routerLink]="['/admin/orders']" (click)="closeOrderModal()" class="btn btn-primary">Open in Orders Page →</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;

      @media (max-width: 600px) {
        margin-bottom: 20px;
        h2 { font-size: 1.3rem !important; }
      }
    }

    .date-chip {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;

      @media (max-width: 600px) {
        font-size: 0.75rem;
        padding: 4px 10px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;

      @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { gap: 10px; }
    }

    .stat-skeleton { height: 110px; border-radius: 8px; }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 16px;
      box-shadow: var(--shadow);

      @media (max-width: 480px) {
        padding: 14px 12px;
      }
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg);
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }

    .stat-value {
      font-size: 1.8rem;
      line-height: 1;
      color: var(--text-primary);
      margin-bottom: 6px;
      font-family: 'Cormorant Garamond', serif;

      @media (max-width: 480px) {
        font-size: 1.5rem;
      }
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
    }

    .quick-actions {
      margin-bottom: 28px;
      h3 { margin-bottom: 14px; font-size: 1.15rem; }
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { gap: 8px; }
    }

    .action-card {
      padding: 16px 12px;
      text-align: center;
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      display: block;

      @media (max-width: 480px) {
        padding: 12px 8px;
        font-size: 0.82rem;
      }

      &:hover { color: var(--primary); transform: translateY(-2px); }
    }

    .recent-section {
      margin-bottom: 28px;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 { font-size: 1.15rem; margin: 0; }
    }

    .table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-radius: 8px;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.2s;
      &:hover {
        background: rgba(74, 92, 47, 0.06) !important;
      }
    }

    .order-num-link {
      color: var(--primary);
    }

    .items-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    /* ── Modal Styles ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20, 28, 12, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      animation: fadeIn 0.2s ease;
    }

    .modal.order-modal {
      background: var(--surface);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: min(88vh, 720px);
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .modal-head {
      flex-shrink: 0;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface);

      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--primary);
      }

      .modal-subtitle {
        font-size: 0.75rem;
        color: var(--text-secondary);
        display: block;
        margin-top: 2px;
      }
    }

    .close-btn {
      width: 32px;
      height: 32px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(74, 92, 47, 0.08);
      }
    }

    .modal-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 16px 20px;
      -webkit-overflow-scrolling: touch;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .order-info-card {
      background: rgba(74, 92, 47, 0.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      font-size: 0.85rem;

      @media (max-width: 480px) {
        flex-direction: column;
        gap: 3px;
      }
    }

    .info-label {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .info-val {
      color: var(--text-primary);
      text-align: right;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      word-break: break-word;

      @media (max-width: 480px) {
        text-align: left;
      }
    }

    .phone-link {
      color: var(--primary);
      text-decoration: underline;
      font-weight: 600;
    }

    .btn-wa-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(37, 211, 102, 0.3);
      transition: all 0.2s;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    }

    .note-text {
      font-style: italic;
      color: var(--text-secondary);
      background: rgba(212, 201, 138, 0.15);
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
    }

    .items-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .items-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }

    .badge-count {
      background: rgba(74, 92, 47, 0.1);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .order-items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .order-item-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      transition: border-color 0.2s;

      &:hover {
        border-color: var(--primary);
      }
    }

    .item-thumb-box {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-thumb-placeholder {
      font-size: 1.4rem;
    }

    .item-details {
      flex: 1;
      min-width: 0;

      .item-name {
        margin: 0 0 2px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-code {
        display: inline-block;
        font-size: 0.72rem;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }

      .item-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.82rem;

        .item-unit-price { color: var(--text-secondary); }
        .item-subtotal { color: var(--accent); font-weight: 700; font-size: 0.88rem; }
      }
    }

    .order-total-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: rgba(74, 92, 47, 0.06);
      border-radius: 10px;
      border: 1px solid var(--border);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-top: 4px;

      strong {
        font-size: 1.25rem;
        color: var(--primary);
        font-family: 'Cormorant Garamond', serif;
      }
    }

    .modal-footer {
      flex-shrink: 0;
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      background: var(--surface);

      @media (max-width: 480px) {
        flex-direction: column-reverse;
        gap: 8px;
        padding: 12px 16px;

        button, a {
          width: 100%;
          text-align: center;
          justify-content: center;
          padding: 10px 16px;
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);
  recentProducts = signal<Product[]>([]);
  selectedOrder = signal<Order | null>(null);

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit() {
    this.adminService.getDashboardOverview().subscribe({
      next: (overview: DashboardOverview) => {
        this.stats.set(overview.stats);
        this.recentOrders.set(overview.recent_orders);
        this.recentProducts.set(overview.recent_products);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load dashboard');
      },
    });
  }

  openOrderModal(order: Order) {
    this.selectedOrder.set(order);
  }

  closeOrderModal() {
    this.selectedOrder.set(null);
  }

  openWhatsApp(order: Order) {
    window.open(`https://wa.me/${order.phone}?text=Hi ${order.customer_name}, your Crochus order #${order.id} update:`, '_blank');
  }
}
