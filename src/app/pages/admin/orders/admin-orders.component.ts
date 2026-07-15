import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Orders</h2>
          <div class="filter-row">
            <select class="form-control" [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div class="table-wrap card">
          @if (loading()) {
            <div style="padding:40px; text-align:center; color:var(--text-secondary)">Loading orders…</div>
          } @else if (filtered().length === 0) {
            <div class="empty-state" style="padding:60px">
              <span class="empty-icon">📦</span>
              <h3>No orders found</h3>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filtered(); track order.id) {
                  <tr>
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customer_name }}</td>
                    <td>{{ order.phone }}</td>
                    <td>
                      <div class="items-mini">
                        @for (item of order.items; track item.product.id) {
                          <span>{{ item.product.name }} ×{{ item.quantity }}</span>
                        }
                      </div>
                    </td>
                    <td><strong>₹{{ order.total | number }}</strong></td>
                    <td>
                      <select class="status-select" [class]="'status-' + order.status" [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)">
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td>{{ order.created_at | date:'mediumDate' }}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" (click)="openWhatsApp(order)">💬 Chat</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-topbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; h2 { margin: 0; }
    }

    .filter-row { display: flex; gap: 12px; }
    .form-control { max-width: 180px; padding: 8px 12px; font-size: 0.85rem; }
    .table-wrap { overflow: hidden; overflow-x: auto; }

    .items-mini {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.78rem;
      color: var(--text-secondary);
      max-width: 180px;
    }

    .status-select {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid;
      cursor: pointer;
      outline: none;
      text-transform: capitalize;

      &.status-new { background: rgba(74,92,47,0.12); color: var(--primary); border-color: var(--primary); }
      &.status-confirmed { background: rgba(212,201,138,0.2); color: #7a6a1a; border-color: var(--accent); }
      &.status-delivered { background: var(--success-bg); color: var(--success-text); border-color: var(--success-text); }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  loading = signal(true);
  orders = signal<Order[]>([]);
  filtered = signal<Order[]>([]);
  filterStatus = '';

  ngOnInit() {
    this.adminService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.filtered.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load orders');
      }
    });
  }

  applyFilter() {
    const f = this.filterStatus;
    this.filtered.set(f ? this.orders().filter(o => o.status === f) : this.orders());
  }

  updateStatus(id: number, status: string) {
    this.adminService.updateOrderStatus(id, status).subscribe({
      next: () => {
        this.orders.update(list => list.map(o => o.id === id ? { ...o, status: status as any } : o));
        this.applyFilter();
        this.toast.success('Order status updated');
      },
      error: (error) => {
        this.toast.error(error instanceof Error ? error.message : 'Could not update order status');
      }
    });
  }

  openWhatsApp(order: Order) {
    window.open(`https://wa.me/${order.phone}?text=Hi ${order.customer_name}, your Crochus order #${order.id} update:`, '_blank');
  }
}
