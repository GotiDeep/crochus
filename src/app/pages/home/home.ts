import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';
import { MarqueeRibbonComponent } from '../../shared/animations/marquee-ribbon.component';
import { TiltDirective } from '../../shared/animations/tilt.directive';
import { HeroBannerSliderComponent } from '../../shared/components/hero-banner-slider/hero-banner-slider';

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

  @ViewChild('catSliderWrapper') catSliderWrapper?: ElementRef<HTMLElement>;

  loading = signal(true);
  featured = signal<Product[]>([]);
  heroProducts = signal<Product[]>([]);
  lastSectionProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  // Category Slider state
  sliderOffset = signal(0);
  noTransition = signal(false);
  visibleCountSignal = signal<number>(5);
  sliderItems = signal<Category[]>([]);
  isDraggingCat = signal(false);

  private baseItemCount = 0;
  private cloneCount = 5;
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  // Touch / Drag swipe variables
  private catStartX = 0;
  private catCurrentX = 0;
  private catDragDelta = 0;
  private wasDragging = false;

  catTrackTransform = computed(() => {
    const visCount = this.visibleCountSignal();
    const itemPercent = 100 / visCount;
    const baseTranslate = -(this.sliderOffset() * itemPercent);

    if (this.isDraggingCat() && this.catSliderWrapper?.nativeElement) {
      const width = this.catSliderWrapper.nativeElement.clientWidth || 1;
      const dragDeltaPercent = (this.catDragDelta / width) * 100;
      return `translateX(${baseTranslate + dragDeltaPercent}%)`;
    }

    return `translateX(${baseTranslate}%)`;
  });

  ngOnInit() {
    this.updateVisibleCount();

    this.productService.getFeaturedProducts().subscribe(products => {
      this.featured.set(products);
      this.loading.set(false);
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

  @HostListener('window:resize')
  onWindowResize() {
    this.updateVisibleCount();
  }

  private updateVisibleCount() {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const count = w <= 560 ? 2.4 : w <= 900 ? 3.5 : 5;
    if (this.visibleCountSignal() !== count) {
      this.visibleCountSignal.set(count);
    }
  }

  setupSlider(cats: Category[]) {
    this.baseItemCount = cats.length;

    if (this.baseItemCount <= 5) {
      this.sliderItems.set(cats);
      return;
    }

    this.cloneCount = 5;
    const cloned = [
      ...cats.slice(-this.cloneCount),
      ...cats,
      ...cats.slice(0, this.cloneCount)
    ];
    this.sliderItems.set(cloned);
    this.sliderOffset.set(this.cloneCount);
    this.noTransition.set(true);

    setTimeout(() => {
      this.noTransition.set(false);
      this.startSlider();
    }, 60);
  }

  startSlider() {
    this.pauseSlider();
    if (this.baseItemCount <= 5) return;

    this.sliderInterval = setInterval(() => {
      this.nextCat();
    }, 2800);
  }

  pauseSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
      this.sliderInterval = null;
    }
  }

  resumeSlider() {
    if (!this.isDraggingCat()) {
      this.startSlider();
    }
  }

  nextCat() {
    if (this.baseItemCount === 0) return;
    this.noTransition.set(false);
    const next = this.sliderOffset() + 1;
    this.sliderOffset.set(next);

    // If reaching the end clone boundary, smoothly snap to base
    if (next >= this.cloneCount + this.baseItemCount) {
      setTimeout(() => {
        this.noTransition.set(true);
        this.sliderOffset.set(this.cloneCount);
        setTimeout(() => this.noTransition.set(false), 50);
      }, 500);
    }
  }

  prevCat() {
    if (this.baseItemCount === 0) return;
    this.noTransition.set(false);
    const prev = this.sliderOffset() - 1;
    this.sliderOffset.set(prev);

    // If reaching the start clone boundary, smoothly snap to end
    if (prev < this.cloneCount) {
      setTimeout(() => {
        this.noTransition.set(true);
        this.sliderOffset.set(this.cloneCount + this.baseItemCount - 1);
        setTimeout(() => this.noTransition.set(false), 50);
      }, 500);
    }
  }

  // ── Touch Handling (Mobile / Tablet Swipe) ──
  onCatTouchStart(e: TouchEvent) {
    if (this.sliderItems().length <= 5) return;
    this.pauseSlider();
    this.catStartX = e.touches[0].clientX;
    this.catCurrentX = this.catStartX;
    this.catDragDelta = 0;
    this.isDraggingCat.set(true);
    this.wasDragging = false;
  }

  onCatTouchMove(e: TouchEvent) {
    if (!this.isDraggingCat()) return;
    this.catCurrentX = e.touches[0].clientX;
    this.catDragDelta = this.catCurrentX - this.catStartX;
    if (Math.abs(this.catDragDelta) > 8) {
      this.wasDragging = true;
    }
  }

  onCatTouchEnd() {
    if (!this.isDraggingCat()) return;
    this.finishCatSwipe();
  }

  // ── Mouse Drag Handling (Desktop Swipe) ──
  onCatMouseDown(e: MouseEvent) {
    if (this.sliderItems().length <= 5) return;
    if (e.button !== 0) return;
    this.pauseSlider();
    this.catStartX = e.clientX;
    this.catCurrentX = this.catStartX;
    this.catDragDelta = 0;
    this.isDraggingCat.set(true);
    this.wasDragging = false;
  }

  onCatMouseMove(e: MouseEvent) {
    if (!this.isDraggingCat()) return;
    this.catCurrentX = e.clientX;
    this.catDragDelta = this.catCurrentX - this.catStartX;
    if (Math.abs(this.catDragDelta) > 8) {
      this.wasDragging = true;
    }
  }

  onCatMouseUp() {
    if (!this.isDraggingCat()) return;
    this.finishCatSwipe();
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    if (this.isDraggingCat()) {
      this.finishCatSwipe();
    }
  }

  private finishCatSwipe() {
    this.isDraggingCat.set(false);
    const threshold = 35;

    if (this.catDragDelta < -threshold) {
      this.nextCat();
    } else if (this.catDragDelta > threshold) {
      this.prevCat();
    } else {
      this.noTransition.set(false);
    }

    this.catDragDelta = 0;
    setTimeout(() => {
      this.wasDragging = false;
    }, 60);

    this.startSlider();
  }

  onCatClick(e: MouseEvent) {
    if (this.wasDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    this.pauseSlider();
  }
}
