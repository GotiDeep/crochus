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
                @for (order of paginatedOrders(); track order.id) {
                  <tr class="clickable-row" (click)="openOrderModal(order)">
                    <td><strong class="order-id-link">#{{ order.id }}</strong></td>
                    <td>{{ order.customer_name }}</td>
                    <td>{{ order.phone }}</td>
                    <td>
                      <div class="items-mini">
                        @for (item of order.items; track item.product.id) {
                          <span>{{ item.product.name }} ×{{ item.quantity }}</span>
                        }
                      </div>
                    </td>
                    <td><strong>₹{{ order.total | number:'1.0-0':'en-IN' }}</strong></td>
                    <td (click)="$event.stopPropagation()">
                      <select class="status-select" [class]="'status-' + order.status" [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)">
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td>{{ order.created_at | date:'mediumDate' }}</td>
                    <td (click)="$event.stopPropagation()">
                      <button class="btn btn-ghost btn-sm" (click)="openWhatsApp(order)">💬 Chat</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

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
            <button class="btn btn-primary" (click)="openWhatsApp(selectedOrder()!)">💬 Chat on WhatsApp</button>
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
      margin-bottom: 20px;
      gap: 12px;
      flex-wrap: wrap;

      h2 { margin: 0; font-size: 1.4rem; }
    }

    .filter-row {
      display: flex;
      gap: 10px;

      @media (max-width: 480px) {
        width: 100%;
        .form-control { width: 100%; max-width: none; }
      }
    }

    .form-control { max-width: 180px; padding: 8px 12px; font-size: 0.85rem; }

    .table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.15s ease;
      &:hover {
        background: rgba(74, 92, 47, 0.06) !important;
      }
    }

    .order-id-link {
      color: var(--primary);
    }

    .items-mini {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.78rem;
      color: var(--text-secondary);
      max-width: 180px;
      white-space: nowrap;
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
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  loading = signal(true);
  orders = signal<Order[]>([]);
  filtered = signal<Order[]>([]);
  filterStatus = '';
  currentPage = signal(1);
  limit = 10;
  selectedOrder = signal<Order | null>(null);

  totalPages = () => Math.ceil(this.filtered().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedOrders = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.filtered().slice(start, start + this.limit);
  };

  ngOnInit() {
    this.adminService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.filtered.set(orders);
        this.currentPage.set(1);
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
    this.currentPage.set(1);
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

  openOrderModal(order: Order) {
    this.selectedOrder.set(order);
  }

  closeOrderModal() {
    this.selectedOrder.set(null);
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }

  openWhatsApp(order: Order) {
    window.open(`https://wa.me/${order.phone}?text=Hi ${order.customer_name}, your Crochus order #${order.id} update:`, '_blank');
  }
}
