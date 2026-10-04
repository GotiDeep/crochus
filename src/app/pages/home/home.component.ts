import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';
import { MarqueeRibbonComponent } from '../../shared/animations/marquee-ribbon.component';
import { ThreadLogoComponent } from '../../shared/animations/thread-logo.component';
import { BouquetBloomComponent } from '../../shared/animations/bouquet-bloom.component';
import { TeddyBuildComponent } from '../../shared/animations/teddy-build.component';
import { HangingCharmsComponent } from '../../shared/animations/hanging-charms.component';
import { TiltDirective } from '../../shared/animations/tilt.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NavbarComponent,
    FooterComponent,
    HamburgerMenuComponent,
    ProductCardComponent,
    ProductCardSkeletonComponent,
    MarqueeRibbonComponent,
    ThreadLogoComponent,
    BouquetBloomComponent,
    TeddyBuildComponent,
    HangingCharmsComponent,
    TiltDirective
  ],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Top Marquee Ribbon -->
        <app-marquee-ribbon />

        <!-- Hero -->
        <section class="hero">
          <div class="hero-content container">
            <div class="hero-text fade-in">
              <app-thread-logo class="hero-thread" />
              <span class="section-label">✦ Handcrafted with Love</span>
              <h1>Art that Speaks,<br><em>Crafted to Last</em></h1>
              <p>Discover one-of-a-kind handmade pieces that carry the warmth of the artisan's hands. Each item is crafted with intention, never mass-produced.</p>
              <div class="hero-actions">
                <a routerLink="/shop" class="btn btn-primary btn-lg">Shop Now</a>
                <a routerLink="/about" class="btn btn-outline btn-lg">Our Story</a>
              </div>
            </div>
            <div class="hero-visual fade-in">
              <div class="hero-img-grid">
                @for (product of heroProducts(); track product.id; let index = $index) {
                  <a [routerLink]="['/product', product.slug]" class="img-block" [class.main]="index === 0" [class.secondary]="index === 1" [class.tertiary]="index === 2">
                    <img [src]="product.photos[0]" [alt]="product.name" />
                  </a>
                }
              </div>
              <div class="hero-badge">
                <span class="badge-num">200+</span>
                <span class="badge-text">Handmade<br>Pieces</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Browse Categories -->
        <section class="section categories-section">
          <div class="container">
            <div class="section-header">
              <span class="section-label">What we make</span>
              <h2 class="section-title">Browse by Category</h2>
            </div>
            <div class="cat-slider-wrapper">
              <div
                class="cat-slider"
                [style.transform]="'translateX(-' + (sliderOffset() * (100 / visibleCount)) + '%)'"
                [style.transition]="noTransition() ? 'none' : 'transform 0.5s ease'"
              >
                @for (cat of sliderItems(); track $index) {
                  <a routerLink="/shop" [queryParams]="{category: cat.id}" class="cat-card-img" appTilt>
                    <div class="cat-img-wrap">
                      @if (cat.image_url) {
                        <img [src]="cat.image_url" [alt]="cat.name" loading="lazy" />
                      } @else {
                        <span class="cat-placeholder-icon">🧵</span>
                      }
                    </div>
                    <span class="cat-label">{{ cat.name }}</span>
                    <span class="cat-count">{{ cat.product_count }}</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Bouquet Bloom Animation Section -->
        <section class="section bouquet-section">
          <div class="container">
            <app-bouquet-bloom />
          </div>
        </section>

        <!-- Featured Products -->
        <section class="section">
          <div class="container">
            <div class="section-header-row">
              <div>
                <span class="section-label">Handpicked for you</span>
                <h2 class="section-title">Featured Pieces</h2>
              </div>
              <a routerLink="/shop" class="btn btn-outline">View All →</a>
            </div>

            @if (loading()) {
              <div class="product-grid">
                <app-product-card-skeleton [count]="10" />
              </div>
            } @else {
              <div class="product-grid">
                @for (product of featured(); track product.id) {
                  <app-product-card appTilt [product]="product" />
                }
              </div>
            }
          </div>
        </section>

        <!-- About Banner -->
        <section class="about-banner">
          <div class="container">
            <div class="about-inner">
              <div class="about-text">
                <span class="section-label">Our Story</span>
                <h2>Where Every Stitch<br><em>Holds a Memory</em></h2>
                <p>Crochus was born from a belief that handmade objects carry something mass-produced items never can — the energy, intention, and time of a human being. We work with artisans who have honed their craft over years, ensuring every piece you receive is truly one of a kind.</p>
                <a routerLink="/about" class="btn btn-primary" style="margin-top:16px">Read Our Story</a>
              </div>
              <div class="about-img">
                <app-teddy-build />
                <div class="about-accent"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Instagram Strip with Hanging Charms -->
        <section class="section insta-section">
          <div class="container">
            <app-hanging-charms />
            <div class="section-header" style="text-align:center">
              <span class="section-label">Made for you</span>
              <h2 class="section-title">More Handmade Favourites</h2>
              <p style="margin-bottom:32px">Discover more pieces selected by Crochus</p>
            </div>
            <div class="insta-grid">
              @for (product of lastSectionProducts(); track product.id) {
                <a [routerLink]="['/product', product.slug]" class="insta-cell">
                  <img [src]="product.photos[0]" [alt]="product.name" loading="lazy" />
                  <div class="insta-overlay">{{ product.name }}</div>
                </a>
              }
            </div>
          </div>
        </section>

        <!-- Bottom Marquee Ribbon (Reverse) -->
        <app-marquee-ribbon [reverse]="true" />
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; overflow-x: hidden; }
    app-product-card { display: block; }

    /* ── Hero ── */
    .hero {
      min-height: calc(100vh - 72px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--bg);

      &::before {
        content: '';
        position: absolute;
        top: -200px; right: -200px;
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(212,201,138,0.12) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      padding-top: 24px;
      padding-bottom: 40px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 24px;
        padding-top: 24px;
        padding-bottom: 24px;
        text-align: center;
      }
    }

    .hero-thread {
      margin-bottom: 12px;
      @media (max-width: 900px) {
        margin: 0 auto 10px;
      }
    }

    .hero-text {
      h1 {
        margin: 12px 0 20px;
        em { color: var(--primary); font-style: italic; }
      }

      p {
        max-width: 440px;
        font-size: 1.05rem;
        line-height: 1.8;
        margin-bottom: 32px;
      }

      @media (max-width: 900px) {
        h1 {
          font-size: 2.2rem;
          margin: 8px 0 16px;
        }
        p {
          margin: 0 auto 24px;
          font-size: 0.95rem;
          line-height: 1.6;
        }
      }
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      @media (max-width: 900px) {
        justify-content: center;
      }
    }

    .hero-visual {
      position: relative;
    }

    .hero-img-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      grid-template-rows: 200px 180px;
      gap: 12px;

      @media (max-width: 900px) {
        max-width: 360px;
        grid-template-rows: 150px 130px;
        gap: 8px;
        margin: 0 auto;
      }
      @media (max-width: 420px) {
        max-width: 310px;
        grid-template-rows: 135px 115px;
        gap: 6px;
      }
    }

    .img-block {
      border-radius: 8px;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }

      &.main { grid-row: 1 / 3; }
      &.secondary {
        border-radius: 8px 8px 0 0;
        animation: floatImg 6s ease-in-out infinite;
      }
      &.tertiary {
        border-radius: 0 0 8px 8px;
        animation: floatImg 7s ease-in-out -2s infinite;
      }
    }

    @keyframes floatImg {
      50% { transform: translateY(-8px); }
    }

    .hero-badge {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: var(--primary);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: var(--shadow-hover);
      animation: floatBadge 5s ease-in-out -1s infinite;

      .badge-num {
        display: block;
        font-family: 'Cormorant Garamond', serif;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
      }

      .badge-text {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.85;
        margin-top: 4px;
        display: block;
      }

      @media (max-width: 900px) {
        bottom: -10px;
        left: -10px;
        padding: 10px 14px;
        .badge-num { font-size: 1.4rem; }
        .badge-text { font-size: 0.62rem; }
      }
    }

    @keyframes floatBadge {
      50% { transform: translateY(-6px); }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-badge, .img-block.secondary, .img-block.tertiary { animation: none; }
    }

    /* ── Categories Slider ── */
    .categories-section { padding-top: 48px; padding-bottom: 24px; }
    .bouquet-section { padding-top: 24px; padding-bottom: 24px; }
    .section-header { margin-bottom: 24px; }

    .cat-slider-wrapper {
      overflow: hidden;
    }

    .cat-slider {
      display: flex;
      gap: 16px;
      transition: transform 0.5s ease;
    }

    .cat-card-img {
      flex: 0 0 calc(100% / 5 - 13px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      cursor: pointer;

      @media (max-width: 900px) { flex: 0 0 calc(100% / 4 - 12px); }
      @media (max-width: 560px) { flex: 0 0 calc(100% / 3.2 - 10px); }
    }

    .cat-img-wrap {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      background: var(--surface);
      border: 1.5px solid var(--border);
      transition: box-shadow 0.3s, transform 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .cat-placeholder-icon { font-size: 2.5rem; }

      .cat-card-img:hover & {
        box-shadow: var(--shadow-hover);
        transform: translateY(-4px);
        img { transform: scale(1.06); }
      }
    }

    .all-items-card {
      background: var(--primary);
      border-color: var(--primary);
      .all-items-icon { font-size: 2.5rem; }
    }

    .cat-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
      letter-spacing: 0.04em;
    }

    .cat-count {
      font-size: 0.72rem;
      color: var(--text-secondary);
      background: var(--bg);
      padding: 2px 8px;
      border-radius: 12px;
    }

    /* ── About Banner ── */
    .about-banner {
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 80px 0;
    }

    .about-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 32px;
        text-align: center;
      }
    }

    .about-text {
      h2 {
        margin: 12px 0 20px;
        em { color: var(--primary); font-style: italic; }
      }
      p { line-height: 1.8; }
    }

    .about-img {
      position: relative;

      @media (max-width: 900px) {
        max-width: 360px;
        margin: 0 auto;
      }

      img {
        width: 100%;
        aspect-ratio: 4/5;
        object-fit: cover;
        border-radius: 8px;
      }

      .about-accent {
        position: absolute;
        bottom: -16px;
        right: -16px;
        width: 120px; height: 120px;
        background: var(--accent);
        opacity: 0.2;
        border-radius: 8px;
        z-index: -1;
      }
    }

    /* ── Instagram ── */
    .insta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      @media (max-width: 440px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }
    }

    .insta-cell {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      display: block;
      background: var(--bg);

      img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .insta-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        img { transform: scale(1.08); }
        .insta-overlay { opacity: 1; }
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  loading = signal(true);
  featured = signal<Product[]>([]);
  heroProducts = signal<Product[]>([]);
  lastSectionProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  menuOpen = signal(false);

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

  ngOnDestroy() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }
}
