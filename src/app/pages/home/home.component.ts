import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent,
    HamburgerMenuComponent, ProductCardComponent, ProductCardSkeletonComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Hero -->
        <section class="hero">
          <div class="hero-content container">
            <div class="hero-text fade-in">
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
          <div class="hero-scroll-hint">
            <span>Scroll to explore</span>
            <div class="scroll-line"></div>
          </div>
        </section>

        <!-- Browse Categories -->
        <section class="section categories-section">
          <div class="container">
            <div class="section-header">
              <span class="section-label">What we make</span>
              <h2 class="section-title">Browse by Category</h2>
            </div>
            <div class="chips-scroll">
              <a routerLink="/shop" class="chip">All Items</a>
              @for (cat of categories(); track cat.id) {
                <a routerLink="/shop" [queryParams]="{category: cat.id}" class="chip">
                  {{ cat.name }}
                  <small>({{ cat.product_count }})</small>
                </a>
              }
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
              <a routerLink="/shop" class="btn btn-outline">View All →</a>
            </div>

            @if (loading()) {
              <div class="product-grid">
                <app-product-card-skeleton [count]="6" />
              </div>
            } @else {
              <div class="product-grid">
                @for (product of featured(); track product.id) {
                  <app-product-card [product]="product" />
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
                <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&q=80" alt="Artisan at work" />
                <div class="about-accent"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Instagram Strip -->
        <section class="section insta-section">
          <div class="container">
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
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .hero {
      min-height: 100vh;
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
      padding-top: 80px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 48px;
        padding-top: 100px;
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
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
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
        max-width: 480px;
        margin: 0 auto;
      }
    }

    .img-block {
      border-radius: 8px;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }

      &.main { grid-row: 1 / 3; }
      &.secondary { border-radius: 8px 8px 0 0; }
      &.tertiary { border-radius: 0 0 8px 8px; }
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
    }

    .hero-scroll-hint {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      animation: bounce 2s infinite;

      @media (max-width: 768px) { display: none; }
    }

    .scroll-line {
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, var(--text-secondary), transparent);
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(8px); }
    }

    /* ── Categories ── */
    .categories-section { padding-top: 48px; padding-bottom: 48px; }
    .section-header { margin-bottom: 24px; }
    .section-header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 36px;

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }

    .chip small {
      opacity: 0.7;
      font-size: 0.75em;
      margin-left: 4px;
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
        gap: 48px;
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

      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
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
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  loading = signal(true);
  featured = signal<Product[]>([]);
  heroProducts = signal<Product[]>([]);
  lastSectionProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  menuOpen = signal(false);

  ngOnInit() {
    this.productService.getFeaturedProducts().subscribe(products => {
      this.featured.set(products);
      this.loading.set(false);
    });
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
    this.productService.getHomeProducts('hero').subscribe(products => this.heroProducts.set(products.slice(0, 3)));
    this.productService.getHomeProducts('last_section').subscribe(products => this.lastSectionProducts.set(products.slice(0, 4)));
  }

}
