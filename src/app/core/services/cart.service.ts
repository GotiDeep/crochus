import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem, MessageResponse, Product } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  items = signal<CartItem[]>([]);

  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  constructor() {
    effect(
      () => {
        if (this.auth.isLoggedIn()) {
          this.loadCart();
        } else {
          this.items.set([]);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private loadCart() {
    this.http
      .get<CartItem[]>(`${environment.apiUrl}/cart`)
      .subscribe({
        next: (items) => this.items.set(items),
        error: () => this.items.set([]),
      });
  }

  addItem(product: Product, quantity = 1) {
    this.http
      .post<CartItem[]>(`${environment.apiUrl}/cart`, {
        product_id: product.id,
        quantity,
      })
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.toast.success(`${product.name} added to cart`);
        },
        error: (error) => this.toast.error(error instanceof Error ? error.message : 'Could not add item to cart'),
      });
  }

  updateQuantity(productId: number, quantity: number) {
    this.http
      .put<CartItem[]>(`${environment.apiUrl}/cart/${productId}`, { quantity })
      .subscribe({
        next: (items) => this.items.set(items),
        error: (error) => this.toast.error(error instanceof Error ? error.message : 'Could not update cart item'),
      });
  }

  removeItem(productId: number) {
    this.http
      .delete<MessageResponse>(`${environment.apiUrl}/cart/${productId}`)
      .subscribe({
        next: () => {
          this.items.update((items) => items.filter((item) => item.product.id !== productId));
        },
        error: (error) => this.toast.error(error instanceof Error ? error.message : 'Could not remove cart item'),
      });
  }

  clearCart() {
    this.http
      .delete<MessageResponse>(`${environment.apiUrl}/cart`)
      .subscribe({
        next: () => this.items.set([]),
        error: (error) => this.toast.error(error instanceof Error ? error.message : 'Could not clear cart'),
      });
  }

  isInCart(productId: number): boolean {
    return this.items().some((item) => item.product.id === productId);
  }

  getItemQuantity(productId: number): number {
    return this.items().find((item) => item.product.id === productId)?.quantity || 0;
  }
}
