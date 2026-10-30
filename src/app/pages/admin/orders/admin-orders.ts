import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
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
