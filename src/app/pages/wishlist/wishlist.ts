import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);
  
  loading = signal(true);
  wishlistedProducts = signal<Product[]>([]);
  currentPage = signal(1);
  limit = 10;

  totalPages = () => Math.ceil(this.wishlistedProducts().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedProducts = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.wishlistedProducts().slice(start, start + this.limit);
  };

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading.set(true);
    this.productService.getProducts({ limit: 1000 }).subscribe(res => {
      const allProducts = res.data;
      const wishlistIds = Object.keys(localStorage)
        .filter(key => key.startsWith('wishlist_') && localStorage.getItem(key) === 'true')
        .map(key => String(key.replace('wishlist_', '')));

      this.wishlistedProducts.set(allProducts.filter(p => wishlistIds.includes(String(p.id))));
      this.currentPage.set(1);
      this.loading.set(false);
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
