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

  private readonly GUEST_CART_KEY = 'crochus_guest_cart';

  items = signal<CartItem[]>([]);

  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  constructor() {
    this.loadInitialCart();

    effect(
      () => {
        if (this.auth.isLoggedIn()) {
          this.loadCart();
        }
      },
      { allowSignalWrites: true }
    );
  }

  private loadInitialCart() {
    try {
      const saved = localStorage.getItem(this.GUEST_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.items.set(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }

  private saveGuestCart(items: CartItem[]) {
    try {
      localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
    } catch {
      // safe fallback
    }
  }

  private loadCart() {
    this.http
      .get<CartItem[]>(`${environment.apiUrl}/cart`)
      .subscribe({
        next: (items) => {
          if (items && items.length > 0) {
            this.items.set(items);
            this.saveGuestCart(items);
          } else {
            const local = this.items();
            if (local.length > 0) {
              local.forEach((item) => this.syncItemToBackend(item.product, item.quantity));
            }
          }
        },
        error: () => {
          this.loadInitialCart();
        },
      });
  }

  private syncItemToBackend(product: Product, quantity: number) {
    this.http.post(`${environment.apiUrl}/cart`, { product_id: product.id, quantity }).subscribe({
      error: () => {}
    });
  }

  addItem(product: Product, quantity = 1) {
    this.items.update((current) => {
      const idx = current.findIndex((i) => i.product.id === product.id);
      let updated: CartItem[];
      if (idx > -1) {
        updated = current.map((i, iIdx) =>
          iIdx === idx ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...current, { product, quantity }];
      }
      this.saveGuestCart(updated);
      return updated;
    });
    this.toast.success(`${product.name} added to cart`);

    if (this.auth.isLoggedIn()) {
      this.http
        .post<CartItem[]>(`${environment.apiUrl}/cart`, {
          product_id: product.id,
          quantity,
        })
        .subscribe({
          next: (items) => {
            if (items && items.length) {
              this.items.set(items);
              this.saveGuestCart(items);
            }
          },
          error: () => {},
        });
    }
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.items.update((current) => {
      const updated = current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      this.saveGuestCart(updated);
      return updated;
    });

    if (this.auth.isLoggedIn()) {
      this.http
        .put<CartItem[]>(`${environment.apiUrl}/cart/${productId}`, { quantity })
        .subscribe({
          next: (items) => {
            if (items && items.length) {
              this.items.set(items);
              this.saveGuestCart(items);
            }
          },
          error: () => {},
        });
    }
  }

  removeItem(productId: number) {
    this.items.update((items) => {
      const updated = items.filter((item) => item.product.id !== productId);
      this.saveGuestCart(updated);
      return updated;
    });

    if (this.auth.isLoggedIn()) {
      this.http
        .delete<MessageResponse>(`${environment.apiUrl}/cart/${productId}`)
        .subscribe({
          error: () => {},
        });
    }
  }

  clearCart() {
    this.items.set([]);
    this.saveGuestCart([]);

    if (this.auth.isLoggedIn()) {
      this.http
        .delete<MessageResponse>(`${environment.apiUrl}/cart`)
        .subscribe({
          error: () => {},
        });
    }
  }

  isInCart(productId: number): boolean {
    return this.items().some((item) => item.product.id === productId);
  }

  getItemQuantity(productId: number): number {
    return this.items().find((item) => item.product.id === productId)?.quantity || 0;
  }
}
