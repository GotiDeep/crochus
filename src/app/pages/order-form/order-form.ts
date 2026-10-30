import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { OrderForm } from '../../core/models';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss'
})
export class OrderFormComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);

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
