import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

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
