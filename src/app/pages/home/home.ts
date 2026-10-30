import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';
import { MarqueeRibbonComponent } from '../../shared/animations/marquee-ribbon.component';
import { TiltDirective } from '../../shared/animations/tilt.directive';
import { HeroBannerSliderComponent } from '../../shared/components/hero-banner-slider/hero-banner-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ProductCardComponent,
    ProductCardSkeletonComponent,
    MarqueeRibbonComponent,
    HeroBannerSliderComponent,
    TiltDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  loading = signal(true);
  featured = signal<Product[]>([]);
  heroProducts = signal<Product[]>([]);
  lastSectionProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  // Slider state
  sliderOffset = signal(0);
  noTransition = signal(false);
  visibleCount = 5; // show 5 at a time
  sliderItems = signal<Category[]>([]);
  private baseItemCount = 0;
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe(products => {
      this.featured.set(products);
      this.loading.set(false);
      // If hero or last_section haven't loaded, provide immediate fallback
      if (this.heroProducts().length === 0 && products.length > 0) {
        this.heroProducts.set(products.slice(0, 3));
      }
      if (this.lastSectionProducts().length === 0 && products.length > 3) {
        this.lastSectionProducts.set(products.slice(3, 7));
      }
    });
    this.productService.getCategories().subscribe(cats => {
      this.categories.set(cats);
      this.setupSlider(cats);
    });
    this.productService.getHomeProducts('hero').subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.heroProducts.set(products.slice(0, 3));
        }
      },
      error: (err) => console.error('Error loading hero products:', err)
    });
    this.productService.getHomeProducts('last_section').subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.lastSectionProducts.set(products.slice(0, 4));
        }
      },
      error: (err) => console.error('Error loading last section products:', err)
    });
  }

  setupSlider(cats: Category[]) {
    this.baseItemCount = cats.length;

    if (this.baseItemCount <= this.visibleCount) {
      this.sliderItems.set(cats);
      return;
    }

    // Clone items to create seamless infinite loop cycle
    const cloned = [...cats, ...cats.slice(0, this.visibleCount)];
    this.sliderItems.set(cloned);

    this.startSlider();
  }

  startSlider() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);

    this.sliderInterval = setInterval(() => {
      const nextOffset = this.sliderOffset() + 1;
      this.noTransition.set(false);
      this.sliderOffset.set(nextOffset);

      // When reaching the cloned section (past all unique items), snap back silently to 0
      if (nextOffset >= this.baseItemCount) {
        setTimeout(() => {
          this.noTransition.set(true);
          this.sliderOffset.set(0);
        }, 500); // Wait for CSS transition (0.5s) to complete before snapping back
      }
    }, 2000);
  }

  formatCategoryName(name: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags & Purses';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains & Charms';
    if (lower === 'all items') return 'All Products';
    return name;
  }

  scrollToStory(event: Event) {
    event.preventDefault();
    if (typeof document !== 'undefined') {
      const el = document.getElementById('our-story');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  ngOnDestroy() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }
}
