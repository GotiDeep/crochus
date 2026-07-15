import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Order, OrderSubmissionPayload, OrderSubmissionResponse, Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  async submitOrder(payload: OrderSubmissionPayload): Promise<OrderSubmissionResponse> {
    return firstValueFrom(
      this.http.post<OrderSubmissionResponse>(`${environment.apiUrl}/orders`, payload)
    );
  }

  generateWhatsAppMessage(order: Order): string {
    const itemLines = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.name} - INR ${item.product.price} (Qty: ${item.quantity})`
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

Order Total: INR ${order.total.toLocaleString('en-IN')}

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
    return `Check out this handmade piece from Crochus!\n\n${product.name}\nPrice: INR ${product.price}\n\n${environment.siteUrl}/product/${product.slug}`;
  }
}
