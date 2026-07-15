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
                  <tr>
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customer_name }}</td>
                    <td>{{ order.items.length }} item(s)</td>
                    <td>Rs.{{ order.total | number }}</td>
                    <td><span class="status-badge" [class]="'status-' + order.status">{{ order.status }}</span></td>
                    <td>{{ order.created_at | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

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
                    <td>Rs.{{ product.price | number }}</td>
                    <td>{{ product.in_stock ? 'In Stock' : 'Out of Stock' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .date-chip {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;

      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }

    .stat-skeleton { height: 120px; border-radius: 8px; }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg);
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 14px;
    }

    .stat-value {
      font-size: 2rem;
      line-height: 1;
      color: var(--text-primary);
      margin-bottom: 8px;
      font-family: 'Cormorant Garamond', serif;
    }

    .stat-label {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-secondary);
    }

    .quick-actions {
      margin-bottom: 32px;
      h3 { margin-bottom: 16px; }
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }

    .action-card {
      padding: 20px;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      display: block;

      &:hover { color: var(--primary); transform: translateY(-2px); }
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .table-wrap { overflow: hidden; overflow-x: auto; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);
  recentProducts = signal<Product[]>([]);
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
}
