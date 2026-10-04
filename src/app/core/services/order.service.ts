import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Order, OrderSubmissionPayload, OrderSubmissionResponse, Product } from '../models';
import { environment } from '../../../environments/environment';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private settings = inject(SettingsService);

  private formatPrice(amount: number): string {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }

  async submitOrder(payload: OrderSubmissionPayload): Promise<OrderSubmissionResponse> {
    return firstValueFrom(
      this.http.post<OrderSubmissionResponse>(`${environment.apiUrl}/orders`, payload)
    );
  }

  generateWhatsAppMessage(order: Order): string {
    const itemLines = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.name} - ${this.formatPrice(item.product.price)} (Qty: ${item.quantity})`
      )
      .join('\n');

    const productLinks = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${environment.siteUrl}/product/${item.product.slug}`
      )
      .join('\n');

    return `New Order - Crochus

Items Ordered:
${itemLines}

Order Total: ${this.formatPrice(order.total)}

Customer Details:
Name: ${order.customer_name}
Phone: ${order.phone}
Address: ${order.address}
Pincode: ${order.pincode}
Note: ${order.note || 'None'}

Product Links:
${productLinks}`;
  }

  openWhatsApp(message: string, whatsappNumber: string): boolean {
    try {
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(url, '_blank');
      return true;
    } catch {
      return false;
    }
  }

  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getWhatsAppShareMessage(product: Pick<Product, 'name' | 'price' | 'slug'>): string {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : environment.siteUrl;
    return `Check out this handmade piece from Crochus!\n\n${product.name}\nPrice: ${this.formatPrice(product.price)}\n\n${siteUrl}/product/${product.slug}`;
  }

  generateDirectBuyWhatsAppMessage(product: Product, quantity = 1): string {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : environment.siteUrl;
    const formattedPrice = this.formatPrice(product.price);
    const totalAmount = this.formatPrice(product.price * quantity);
    const codeLine = product.product_code ? `\nCode: ${product.product_code}` : '';

    return `New Order - Crochus 🌿

Item Ordered:
1. ${product.name}${codeLine} - ${formattedPrice} (Qty: ${quantity})

Order Total: ${totalAmount}

Product Link:
1. ${siteUrl}/product/${product.slug}

Please confirm my order and share payment & delivery details!`;
  }

  buyNowWhatsApp(product: Product, quantity = 1): boolean {
    const num = this.settings.whatsappNumber() || '918200502248';
    const message = this.generateDirectBuyWhatsAppMessage(product, quantity);
    return this.openWhatsApp(message, num);
  }
}
