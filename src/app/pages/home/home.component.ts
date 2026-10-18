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
import { BouquetBloomComponent } from '../../shared/animations/bouquet-bloom.component';
import { TeddyBuildComponent } from '../../shared/animations/teddy-build.component';
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
    BouquetBloomComponent,
    TeddyBuildComponent,
    TiltDirective
  ],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Top Marquee Ribbon -->
        <app-marquee-ribbon />

        <!-- Editorial Boutique Hero -->
        <section class="hero">
          <div class="hero-content container">
            <div class="hero-text fade-in">
              <span class="section-label">Handcrafted with Intention & Love</span>
              <h1>Art That Speaks,<br><em>Crafted to Last.</em></h1>
              <p>Discover one-of-a-kind handmade crochet creations, artisanal accessories, and mindful home décor made slowly and sustainably by human hands.</p>
              
              <div class="hero-actions">
                <a routerLink="/shop" class="btn btn-primary btn-lg">Explore Collection →</a>
                <a routerLink="/about" class="btn btn-outline btn-lg">Our Story</a>
              </div>

              <!-- Trust Points -->
              <div class="hero-trust-row">
                <div class="trust-item">
                  <span class="trust-icon">🌿</span>
                  <span>100% Handmade</span>
                </div>
                <div class="trust-item">
                  <span class="trust-icon">🧵</span>
                  <span>Small Batch Quality</span>
                </div>
                <div class="trust-item">
                  <span class="trust-icon">💬</span>
                  <span>WhatsApp Custom Orders</span>
                </div>
              </div>
            </div>

            <!-- Hero Visual Collage -->
            <div class="hero-visual fade-in">
              <div class="hero-img-grid">
                @for (product of heroProducts(); track product.id; let index = $index) {
                  <a [routerLink]="['/product', product.slug]" class="img-block" [class.main]="index === 0" [class.secondary]="index === 1" [class.tertiary]="index === 2">
                    <img
                      [src]="product.photos[0]"
                      [alt]="product.name"
                      [attr.fetchpriority]="index === 0 ? 'high' : 'auto'"
                      [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                      width="500"
                      height="600"
                    />
                  </a>
                }
              </div>
              <div class="hero-badge">
                <span class="badge-num">200+</span>
                <span class="badge-text">Handcrafted<br>Treasures</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Browse Categories -->
        <section class="section categories-section">
          <div class="container">
            <div class="section-header-row">
              <div>
                <span class="section-label">Curated by Craft</span>
                <h2 class="section-title">Browse by Category</h2>
              </div>
              <a routerLink="/shop" class="btn btn-ghost hide-mobile">All Categories →</a>
            </div>

            <div class="cat-slider-wrapper">
              <div
                class="cat-slider"
                [style.transform]="'translateX(-' + (sliderOffset() * (100 / visibleCount)) + '%)'"
                [style.transition]="noTransition() ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'"
              >
                @for (cat of sliderItems(); track $index) {
                  <a routerLink="/shop" [queryParams]="{category: cat.id}" class="cat-card-img" appTilt>
                    <div class="cat-img-wrap">
                      @if (cat.image_url) {
                        <img [src]="cat.image_url" [alt]="cat.name" loading="lazy" width="240" height="240" />
                      } @else {
                        <span class="cat-placeholder-icon">🧵</span>
                      }
                      <div class="cat-img-overlay"></div>
                    </div>
                    <span class="cat-label">{{ cat.name }}</span>
                    <span class="cat-count">{{ cat.product_count || 'View' }} pieces</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Bouquet Bloom Animation Section -->
        <section class="section bouquet-section">
          <div class="container">
            <div class="bouquet-card card">
              <div class="bouquet-text">
                <span class="section-label">Artisan Technique</span>
                <h3>Woven from Pure Imagination</h3>
                <p>From the first loop of thread to the final knot, each flower and charm blossoms through patient artisanal dedication.</p>
              </div>
              <div class="bouquet-visual">
                <app-bouquet-bloom />
              </div>
            </div>
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
              <a routerLink="/shop" class="btn btn-outline">View All Pieces →</a>
            </div>

            @if (loading()) {
              <div class="product-grid">
                <app-product-card-skeleton [count]="8" />
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
                <span class="section-label">Our Philosophy</span>
                <h2>Where Every Stitch<br><em>Holds a Memory</em></h2>
                <p>Crochus was born from a belief that handmade objects carry something mass-produced items never can — the energy, intention, and time of a human being. We craft pieces that invite comfort and bring organic beauty into your everyday life.</p>
                <div class="about-stats-row">
                  <div class="stat-item">
                    <strong>100%</strong>
                    <span>Plastic-free packing</span>
                  </div>
                  <div class="stat-item">
                    <strong>Custom</strong>
                    <span>Made-to-order available</span>
                  </div>
                </div>
                <a routerLink="/about" class="btn btn-primary" style="margin-top:20px">Read Our Story →</a>
              </div>
              <div class="about-img">
                <app-teddy-build />
                <div class="about-accent"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Instagram Strip -->
        <section class="section insta-section">
          <div class="container">
            <div class="section-header" style="text-align:center">
              <span class="section-label">Community & Craft</span>
              <h2 class="section-title">More Handmade Favourites</h2>
              <p style="margin-bottom:32px; max-width: 500px; margin-left: auto; margin-right: auto;">Follow along on Instagram &#64;crochus to see works in progress and newly completed drops.</p>
            </div>
            <div class="insta-grid">
              @for (product of lastSectionProducts(); track product.id) {
                <a [routerLink]="['/product', product.slug]" class="insta-cell" [attr.aria-label]="product.name">
                  <img [src]="product.photos[0]" [alt]="product.name" loading="lazy" width="300" height="300" />
                  <div class="insta-overlay">
                    <span class="insta-name">{{ product.name }}</span>
                    <span class="insta-price">₹{{ product.price | number:'1.0-0':'en-IN' }}</span>
                  </div>
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
      background: linear-gradient(180deg, var(--bg) 0%, var(--bg-warm) 100%);
      padding: 40px 0 60px;

      &::before {
        content: '';
        position: absolute;
        top: -160px; right: -160px;
        width: 560px; height: 560px;
        background: radial-gradient(circle, rgba(217, 136, 128, 0.12) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 60px;
      align-items: center;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
        gap: 36px;
        text-align: center;
      }
    }

    .hero-text {
      h1 {
        margin: 14px 0 20px;
        font-size: clamp(2.3rem, 5.2vw, 3.8rem);
        line-height: 1.18;
        em { color: var(--primary); font-style: italic; }
      }

      p {
        max-width: 500px;
        font-size: 1.08rem;
        line-height: 1.75;
        margin-bottom: 32px;
        color: var(--text-secondary);
      }

      @media (max-width: 960px) {
        p {
          margin: 0 auto 28px;
          font-size: 1rem;
        }
      }
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 32px;

      @media (max-width: 960px) {
        justify-content: center;
      }
    }

    .hero-trust-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding-top: 16px;
      border-top: 1px solid var(--border);

      @media (max-width: 960px) {
        justify-content: center;
        gap: 16px;
      }

      .trust-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary);

        .trust-icon { font-size: 0.95rem; }
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
    .bouquet-section { padding-top: 24px; padding-bottom: 40px; }
    .section-header { margin-bottom: 24px; }

    .bouquet-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 44px 50px;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      align-items: center;
      gap: 40px;
      box-shadow: var(--shadow);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        padding: 30px 20px;
        text-align: center;
      }
    }

    .bouquet-text {
      h3 {
        margin: 8px 0 16px;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
      }
      p {
        line-height: 1.75;
      }
    }

    .cat-slider-wrapper {
      overflow: hidden;
      padding: 8px 0;
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
      @media (max-width: 380px) { flex: 0 0 calc(100% / 2.3 - 8px); }
    }

    .cat-img-wrap {
      width: 100%;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--surface);
      border: 1.5px solid var(--border);
      transition: box-shadow 0.25s, transform 0.25s;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

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
        border-color: var(--primary);
        img { transform: scale(1.08); }
      }
    }

    .cat-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
      letter-spacing: 0.02em;
    }

    .cat-count {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-warm);
      padding: 2px 10px;
      border-radius: var(--radius-pill);
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

    .about-stats-row {
      display: flex;
      gap: 32px;
      margin: 24px 0 8px;

      @media (max-width: 900px) {
        justify-content: center;
      }

      .stat-item {
        strong {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: var(--primary);
          line-height: 1.1;
        }
        span {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      }
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
        border-radius: var(--radius-md);
      }

      .about-accent {
        position: absolute;
        bottom: -16px;
        right: -16px;
        width: 120px; height: 120px;
        background: var(--primary-subtle);
        border: 2px dashed var(--primary);
        opacity: 0.5;
        border-radius: var(--radius-md);
        z-index: -1;
      }
    }

    /* ── Instagram ── */
    .insta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      @media (max-width: 440px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
    }

    .insta-cell {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      display: block;
      background: var(--bg);
      border: 1px solid var(--border);

      img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .insta-overlay {
        position: absolute;
        inset: 0;
        background: rgba(36, 30, 28, 0.75);
        backdrop-filter: blur(2px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.25s ease;

        .insta-name {
          color: #FFFFFF;
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .insta-price {
          color: var(--accent-rose);
          font-weight: 700;
          font-size: 0.88rem;
        }
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
