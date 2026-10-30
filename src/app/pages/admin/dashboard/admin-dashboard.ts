import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardOverview, DashboardStats, Order, Product } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
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
