import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductGalleryComponent } from '../../shared/components/product-gallery/product-gallery.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import { Product } from '../../core/models';

type AccordionTab = 'desc' | 'materials' | 'care' | 'shipping';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ProductGalleryComponent,
    BadgeComponent,
    ProductCardComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  loading = signal(true);
  product = signal<Product | null>(null);
  similar = signal<Product[]>([]);
  qty = signal(1);
  wishlistSaved = signal(false);
  activeAccordion = signal<AccordionTab>('desc');

  Math = Math;

  get styleCode(): string {
    const p = this.product();
    if (!p) return '';
    return p.product_code || `CR-${p.id.toString().padStart(4, '0')}`;
  }

  get inCart(): boolean {
    const p = this.product();
    return p ? this.cartService.isInCart(p.id) : false;
  }

  get whatsappNumber(): string {
    return this.settingsService.whatsappNumber() || '918200502248';
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.loading.set(true);
      this.qty.set(1);
      this.activeAccordion.set('desc');

      this.productService.getProductBySlug(params['slug']).subscribe((p) => {
        this.product.set(p || null);
        this.loading.set(false);
        if (p) {
          if (typeof localStorage !== 'undefined') {
            this.wishlistSaved.set(localStorage.getItem(`wishlist_${p.id}`) === 'true');
          }
          this.productService
            .getSimilarProducts(p.category_id, p.id)
            .subscribe((s) => this.similar.set(s));
        }
      });
    });
  }

  increaseQty() {
    this.qty.update((q) => q + 1);
  }

  decreaseQty() {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  toggleAccordion(tab: AccordionTab) {
    if (this.activeAccordion() === tab) {
      // Toggle close if already open
      this.activeAccordion.set('desc');
    } else {
      this.activeAccordion.set(tab);
    }
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

  buyNowInstant() {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isLoggedIn()) {
      this.auth.redirectUrl = `/order`;
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addItem(p, this.qty());
    this.router.navigate(['/order']);
  }

  buyOnWhatsApp() {
    const p = this.product();
    if (!p) return;
    this.orderService.buyNowWhatsApp(p, this.qty());
  }

  toggleWishlist() {
    const p = this.product();
    if (!p || typeof localStorage === 'undefined') return;

    if (this.wishlistSaved()) {
      localStorage.removeItem(`wishlist_${p.id}`);
      this.wishlistSaved.set(false);
      this.toast.info(`${p.name} removed from your saved wishlist`);
    } else {
      localStorage.setItem(`wishlist_${p.id}`, 'true');
      this.wishlistSaved.set(true);
      this.toast.success(`${p.name} added to your saved wishlist!`);
    }
  }

  copyProductLink() {
    const p = this.product();
    if (!p) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator?.clipboard && url) {
      navigator.clipboard.writeText(url).then(() => {
        this.toast.success('Link copied to clipboard!');
      });
    } else if (url) {
      this.shareOnWhatsApp();
    }
  }

  formatCategoryName(name?: string): string {
    if (!name) return 'Handmade Creation';
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
