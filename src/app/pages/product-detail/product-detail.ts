import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductGalleryComponent } from '../../shared/components/product-gallery/product-gallery.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductGalleryComponent, BadgeComponent, ProductCardComponent, ScrollRevealDirective],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  loading = signal(true);
  product = signal<Product | null>(null);
  similar = signal<Product[]>([]);
  qty = signal(1);
  Math = Math;

  get styleCode(): string {
    const p = this.product();
    if (!p) return '';
    return p.product_code || `CR-${p.id.toString().padStart(4, '0')}`;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.qty.set(1);
      this.productService.getProductBySlug(params['slug']).subscribe(p => {
        this.product.set(p || null);
        this.loading.set(false);
        if (p) {
          this.productService.getSimilarProducts(p.category_id, p.id).subscribe(s => this.similar.set(s));
        }
      });
    });
  }

  increaseQty() {
    this.qty.set(this.qty() + 1);
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = `/product/${p.slug}`;
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addItem(p, this.qty());
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

  shareOnWhatsApp() {
    const p = this.product();
    if (!p) return;
    const msg = this.orderService.getWhatsAppShareMessage(p);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
