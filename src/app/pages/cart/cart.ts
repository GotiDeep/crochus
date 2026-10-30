import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  cart = inject(CartService);
  getStyleCode(product: any): string {
    return product.product_code || `CR-${product.id.toString().padStart(4, '0')}`;
  }

  formatCategoryName(name?: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    return name;
  }
}
