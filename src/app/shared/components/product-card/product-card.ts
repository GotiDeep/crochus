import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeComponent } from '../badge/badge.component';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule, BadgeComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  cart = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);

  get inCart() {
    return this.cart.isInCart(this.product.id);
  }

  get inWishlist() {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(`wishlist_${this.product.id}`) === 'true';
  }

  get displayCategory(): string {
    const raw = this.product.category_name;
    if (!raw) return 'Handmade';
    const lower = raw.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    return raw;
  }

  get styleCode(): string {
    if (this.product.product_code) {
      return this.product.product_code;
    }
    return `CR-${this.product.id.toString().padStart(4, '0')}`;
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (typeof localStorage === 'undefined') return;

    if (this.inWishlist) {
      localStorage.removeItem(`wishlist_${this.product.id}`);
      this.toast.success(`${this.product.name} removed from saved items`);
    } else {
      localStorage.setItem(`wishlist_${this.product.id}`, 'true');
      this.toast.success(`${this.product.name} added to saved items`);
    }
  }

  toggleCart(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = '/cart';
      this.router.navigate(['/login']);
      return;
    }
    if (!this.product.in_stock) return;

    if (this.inCart) {
      this.cart.removeItem(this.product.id);
      this.toast.success(`${this.product.name} removed from your bag`);
    } else {
      this.cart.addItem(this.product);
      this.toast.success(`${this.product.name} added to your bag`);
    }
  }
}
