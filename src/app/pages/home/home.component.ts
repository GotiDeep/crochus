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
import { ThreadCraftRevealComponent } from '../../shared/animations/thread-craft-reveal.component';
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
    ThreadCraftRevealComponent,
    TiltDirective
  ],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Top Marquee Ribbon -->
        <app-marquee-ribbon />

        <!-- ── Handmade Hero Section ── -->
        <section class="hero">
          <div class="hero-content container">
            <div class="hero-text">
              <span class="section-label hero-anim hero-delay-1">🧶 Handmade with Love · CROCHUS 🧶</span>
              <h1 class="hero-anim hero-delay-2">
                Little Things,<br>
                <em>Handmade with Love.</em>
              </h1>
              <p class="hero-anim hero-delay-3">
                From colorful crochet bags and flower bouquets to cute keychains, rakhis, and thoughtful gifts — discover handmade creations made to bring a little more joy to everyday life.
              </p>
              <div class="hero-actions hero-anim hero-delay-4">
                <a routerLink="/shop" class="btn btn-primary btn-lg">Explore All Products</a>
                <a href="#our-story" (click)="scrollToStory($event)" class="btn btn-outline btn-lg">Our Story</a>
              </div>

              <!-- Trust Highlights -->
              <div class="hero-hallmarks hero-anim hero-delay-4">
                <div class="hallmark-item">
                  <span class="hm-dot">🧶</span>
                  <span>100% Handcrafted</span>
                </div>
                <div class="hallmark-item">
                  <span class="hm-dot">✿</span>
                  <span>Thoughtful Gifting</span>
                </div>
                <div class="hallmark-item">
                  <span class="hm-dot">✦</span>
                  <span>Quality Materials</span>
                </div>
                <div class="hallmark-item">
                  <span class="hm-dot">💬</span>
                  <span>WhatsApp Ordering</span>
                </div>
              </div>
            </div>

            <!-- Hero Visual: Thread Craft Reveal + Live Product Showcase -->
            <div class="hero-visual">
              <div class="hero-showcase-frame">
                <!-- Interactive Thread Craft Reveal Animation -->
                <div class="showcase-block sparkle-card" title="Handcrafted Creations">
                  <app-thread-craft-reveal />
                </div>

                <!-- Live Featured Pieces from Catalogue -->
                <div class="secondary-items">
                  @if (heroProducts().length > 0) {
                    <a [routerLink]="['/product', heroProducts()[0].slug]" class="showcase-block main-feature-item" title="View Product Details">
                      <img
                        [src]="heroProducts()[0].photos[0]"
                        [alt]="heroProducts()[0].name"
                        loading="eager"
                        fetchpriority="high"
                      />
                      <div class="item-tag">
                        <span class="jt-ref">Item #{{ heroProducts()[0].id }}</span>
                        <strong class="jt-name">{{ heroProducts()[0].name }}</strong>
                        <span class="jt-price">₹{{ heroProducts()[0].price | number:'1.0-0':'en-IN' }}</span>
                      </div>
                    </a>
                  }
                  @if (heroProducts().length > 1) {
                    <a [routerLink]="['/product', heroProducts()[1].slug]" class="showcase-block sub-item" title="View Product Details">
                      <img [src]="heroProducts()[1].photos[0]" [alt]="heroProducts()[1].name" loading="lazy" />
                      <div class="sub-item-badge">
                        <span>{{ heroProducts()[1].name }}</span>
                      </div>
                    </a>
                  }
                </div>
              </div>

              <!-- Floating Designs Badge -->
              <div class="hero-prestige-badge">
                <div class="badge-ring">
                  <span class="badge-num">100%</span>
                  <span class="badge-sub">Handmade<br>with Love</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtle Divider -->
          <div class="hero-gold-separator" aria-hidden="true">
            <span class="sep-line"></span>
            <span class="sep-diamond">✦</span>
            <span class="sep-line"></span>
          </div>
        </section>

        <!-- ── Categories Section ── -->
        <section class="section categories-section">
          <div class="container">
            <div class="section-header-row">
              <div>
                <span class="section-label">Browse What We Make</span>
                <h2 class="section-title">Explore Our Products</h2>
              </div>
              <a routerLink="/shop" class="btn btn-outline hide-mobile">See All Categories →</a>
            </div>

            <div class="cat-slider-wrapper">
              <div
                class="cat-slider"
                [style.transform]="'translateX(-' + (sliderOffset() * (100 / visibleCount)) + '%)'"
                [style.transition]="noTransition() ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'"
              >
                @for (cat of sliderItems(); track $index) {
                  <a routerLink="/shop" [queryParams]="{category: cat.id}" class="cat-card-lux" appTilt>
                    <div class="cat-vignette">
                      @if (cat.image_url) {
                        <img [src]="cat.image_url" [alt]="cat.name" loading="lazy" />
                      } @else {
                        <div class="cat-gem-placeholder">
                          <span>🧶</span>
                        </div>
                      }
                      <div class="vignette-gold-ring"></div>
                    </div>
                    <span class="cat-name">{{ formatCategoryName(cat.name) }}</span>
                    <span class="cat-pill">{{ cat.product_count || 6 }} Products</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- ── Featured Handmade Products ── -->
        <section class="section featured-section">
          <div class="container">
            <div class="section-header-row">
              <div>
                <span class="section-label">Handmade with Care</span>
                <h2 class="section-title">Our Favourite Picks</h2>
              </div>
              <a routerLink="/shop" class="btn btn-outline">Explore All Products →</a>
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

        <!-- ── Our Story & Craftsmanship Section ── -->
        <section class="atelier-feature" id="our-story">
          <div class="container">
            <div class="atelier-grid">
              <div class="atelier-text">
                <span class="section-label">Our Story</span>
                <h2>Every Piece Has<br><em>a Little Story</em></h2>
                <p>
                  At CROCHUS, we love turning simple threads and creative ideas into something special. From colorful bags and flowers to thoughtful gifts and everyday accessories, our handmade creations are made to add a personal touch to life's little moments.
                </p>
                <div class="atelier-pillars">
                  <div class="pillar">
                    <span class="pillar-num">01</span>
                    <strong>Made by Hand</strong>
                    <p>Each creation is made with care, patience, and close attention to detail.</p>
                  </div>
                  <div class="pillar">
                    <span class="pillar-num">02</span>
                    <strong>Made to Be Special</strong>
                    <p>Find something different from everyday, mass-produced products.</p>
                  </div>
                  <div class="pillar">
                    <span class="pillar-num">03</span>
                    <strong>Made for Every Moment</strong>
                    <p>From birthdays and festivals to everyday surprises, find something worth gifting or keeping.</p>
                  </div>
                  <div class="pillar">
                    <span class="pillar-num">04</span>
                    <strong>Custom Orders on WhatsApp</strong>
                    <p>Want a specific color or custom size? Chat directly with us to bring your idea to life.</p>
                  </div>
                </div>
                <a routerLink="/about" class="btn btn-primary" style="margin-top:24px">Read Our Full Story</a>
              </div>

              <!-- Visual Callout Boxes -->
              <div class="atelier-visual">
                <div class="atelier-card-frame">
                  <div class="af-box primary-box">
                    <div class="af-content">
                      <span class="af-icon">✿</span>
                      <h4>Custom Gifts & Requests</h4>
                      <p>Have an idea for a custom bouquet, special bag color, or personalized gift? We are always happy to help.</p>
                      <a routerLink="/contact" class="af-link">Chat on WhatsApp →</a>
                    </div>
                  </div>
                  <div class="af-box secondary-box">
                    <div class="quote-mark">“</div>
                    <p class="quote-text">Little things, made with patience and love, bring the warmest smiles.</p>
                    <span class="quote-sign">— CROCHUS Handmade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── WhatsApp Custom Orders Banner ── -->
        <section class="concierge-banner">
          <div class="container">
            <div class="cb-inner">
              <div class="cb-text">
                <span class="cb-tag">✦ Custom Creations & Inquiries</span>
                <h3>Looking for Something Custom or Special?</h3>
                <p>Want a specific color, custom size, or a personalized gift for someone dear? Chat directly with our team on WhatsApp. We're happy to help you create something special.</p>
              </div>
              <div class="cb-action">
                <a routerLink="/contact" class="btn btn-primary btn-lg">Chat with Us on WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        <!-- ── More Handmade Creations Section ── -->
        @if (lastSectionProducts().length > 0) {
          <section class="section archival-section">
            <div class="container">
              <div class="section-header" style="text-align:center; margin-bottom: 36px">
                <span class="section-label">More to Love</span>
                <h2 class="section-title">More Handmade Creations</h2>
                <p style="max-width: 520px; margin: 0 auto; color: var(--c-muted);">
                  Explore more colorful bags, bouquets, and accessories made to bring big smiles.
                </p>
              </div>

              <div class="archival-grid">
                @for (product of lastSectionProducts(); track product.id) {
                  <a [routerLink]="['/product', product.slug]" class="archival-tile">
                    <div class="tile-img-wrap">
                      <img [src]="product.photos[0]" [alt]="product.name" loading="lazy" />
                    </div>
                    <div class="tile-meta">
                      <span class="tile-ref">Item #{{ product.id }}</span>
                      <strong class="tile-name">{{ product.name }}</strong>
                      <span class="tile-price">₹{{ product.price | number:'1.0-0':'en-IN' }}</span>
                    </div>
                  </a>
                }
              </div>
            </div>
          </section>
        }

        <!-- Bottom Marquee Ribbon (Reverse direction) -->
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
      min-height: calc(90vh - 72px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--c-bg);
      padding: 40px 0 20px;

      &::before {
        content: '';
        position: absolute;
        top: -150px; right: -150px;
        width: 600px; height: 600px;
        background: radial-gradient(circle, color-mix(in srgb, var(--c-accent) 25%, transparent) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 60px;
      align-items: center;
      padding-top: 16px;
      padding-bottom: 32px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 36px;
        text-align: center;
      }
    }

    .hero-text {
      h1 {
        margin: 14px 0 22px;
        font-size: clamp(2.4rem, 5.2vw, 4rem);
        em {
          color: var(--c-primary);
          font-style: italic;
          font-weight: 300;
        }
      }

      p {
        max-width: 500px;
        font-size: 1.05rem;
        line-height: 1.8;
        margin-bottom: 28px;
        color: var(--c-muted);
      }

      @media (max-width: 900px) {
        h1 {
          font-size: 2.4rem;
        }
        p {
          margin: 0 auto 24px;
        }
      }
    }

    .hero-anim {
      opacity: 0;
      transform: translateY(16px);
      animation: heroEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .hero-delay-1 { animation-delay: 0.1s; }
    .hero-delay-2 { animation-delay: 0.22s; }
    .hero-delay-3 { animation-delay: 0.35s; }
    .hero-delay-4 { animation-delay: 0.48s; }

    @keyframes heroEntrance {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 32px;

      @media (max-width: 900px) {
        justify-content: center;
        gap: 10px;
      }

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: stretch;

        .btn {
          width: 100%;
        }
      }
    }

    .hero-hallmarks {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);

      .hallmark-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.76rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--c-text);

        .hm-dot {
          color: var(--c-accent);
          font-size: 0.85em;
        }
      }

      @media (max-width: 900px) {
        justify-content: center;
      }
    }

    /* Asymmetrical Showcase */
    .hero-visual {
      position: relative;
    }

    .hero-showcase-frame {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 16px;
      align-items: stretch;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        max-width: 380px;
        margin: 0 auto;
      }
    }

    .showcase-block {
      display: block;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: var(--c-surface);
      border: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
      box-shadow: 0 16px 36px rgba(44, 58, 26, 0.08);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 48px rgba(44, 58, 26, 0.14);
        img { transform: scale(1.04); }
      }
    }

    .sparkle-card {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.95) 0%, rgba(245, 240, 224, 0.7) 100%);
      border: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
      box-shadow: 0 16px 36px rgba(44, 58, 26, 0.08);
      min-height: 320px;
    }

    .main-feature-item {
      aspect-ratio: 4/5;

      .item-tag {
        position: absolute;
        bottom: 14px;
        left: 14px;
        right: 14px;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(10px);
        border: 1px solid color-mix(in srgb, var(--c-accent) 50%, transparent);
        border-radius: 8px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .jt-ref {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--c-muted);
          font-weight: 600;
        }

        .jt-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          color: var(--c-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .jt-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--c-primary);
        }
      }
    }

    .secondary-items {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @media (max-width: 600px) {
        flex-direction: row;
      }
    }

    .sub-item {
      aspect-ratio: 1;
      flex: 1;

      .sub-item-badge {
        position: absolute;
        bottom: 8px;
        left: 8px;
        right: 8px;
        background: rgba(44, 58, 26, 0.85);
        backdrop-filter: blur(6px);
        border-radius: 4px;
        padding: 4px 8px;
        text-align: center;

        span {
          font-size: 0.72rem;
          color: var(--c-bg);
          font-weight: 500;
          letter-spacing: 0.06em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
      }
    }

    .hero-prestige-badge {
      position: absolute;
      top: -16px;
      left: -16px;
      z-index: 5;
      background: var(--c-primary);
      color: #FFFFFF;
      border: 1.5px solid var(--c-accent);
      border-radius: 50%;
      width: 84px;
      height: 84px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(74, 92, 47, 0.3);
      animation: floatBadge 5s ease-in-out infinite;

      .badge-ring {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .badge-num {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.45rem;
        font-weight: 600;
        line-height: 1;
      }

      .badge-sub {
        font-size: 0.55rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        line-height: 1.2;
        margin-top: 2px;
      }

      @media (max-width: 900px) {
        width: 68px;
        height: 68px;
        top: -8px;
        left: 4px;
      }
    }

    @keyframes floatBadge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .hero-gold-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      color: var(--c-accent);

      .sep-line {
        height: 1px;
        width: 120px;
        background: linear-gradient(90deg, transparent, var(--c-accent));
        &:last-child {
          background: linear-gradient(90deg, var(--c-accent), transparent);
        }
      }

      .sep-diamond {
        font-size: 0.9rem;
      }
    }

    /* ── Categories Slider ── */
    .categories-section {
      padding: 64px 0 40px;
      background: var(--c-surface);
      border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    }

    .cat-slider-wrapper {
      overflow: hidden;
      padding: 12px 0;
    }

    .cat-slider {
      display: flex;
      gap: 20px;
    }

    .cat-card-lux {
      flex: 0 0 calc(100% / 5 - 16px);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      cursor: pointer;
      group: cat;

      @media (max-width: 900px) { flex: 0 0 calc(100% / 3.5 - 14px); }
      @media (max-width: 560px) { flex: 0 0 calc(100% / 2.4 - 10px); }
    }

    .cat-vignette {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      background: var(--c-bg);
      border: 1.5px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .cat-gem-placeholder {
        font-size: 1.8rem;
        color: var(--c-accent);
      }

      .vignette-gold-ring {
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
      }

      .cat-card-lux:hover & {
        transform: translateY(-4px) scale(1.03);
        border-color: var(--c-primary);
        box-shadow: 0 12px 28px rgba(74, 92, 47, 0.16);
        img { transform: scale(1.08); }
      }
    }

    .cat-name {
      margin-top: 14px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--c-text);
      text-align: center;
      letter-spacing: 0.02em;
    }

    .cat-pill {
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--c-muted);
      margin-top: 2px;
    }

    .featured-section {
      padding: 72px 0;
    }

    .atelier-feature {
      padding: 80px 0;
      background: color-mix(in srgb, var(--c-bg) 65%, var(--c-surface));
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .atelier-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 60px;
      align-items: center;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 36px;
      }
    }

    .atelier-text {
      h2 {
        margin: 12px 0 20px;
        em { color: var(--c-primary); font-style: italic; }
      }
      p {
        line-height: 1.8;
        font-size: 1rem;
        color: var(--c-text);
      }
    }

    .atelier-pillars {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 28px;

      .pillar {
        border-top: 1.5px solid var(--c-accent);
        padding-top: 12px;

        .pillar-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          color: var(--c-accent);
          display: block;
          margin-bottom: 4px;
        }

        strong {
          font-size: 0.88rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--c-text);
          display: block;
          margin-bottom: 6px;
        }

        p {
          font-size: 0.82rem;
          color: var(--c-muted);
          line-height: 1.5;
        }
      }

      @media (max-width: 560px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .atelier-card-frame {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .af-box {
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

      &.primary-box {
        background: var(--c-surface);
        border: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));

        .af-icon {
          color: var(--c-accent);
          font-size: 1.2rem;
          display: block;
          margin-bottom: 8px;
        }

        h4 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          color: var(--c-text);
          margin-bottom: 8px;
        }

        p {
          font-size: 0.9rem;
          color: var(--c-muted);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .af-link {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--c-primary);
          transition: color 0.2s;
          &:hover { color: color-mix(in srgb, var(--c-primary) 80%, #000); }
        }
      }

      &.secondary-box {
        background: var(--c-primary);
        color: #FFFFFF;
        position: relative;
        padding-top: 36px;

        .quote-mark {
          position: absolute;
          top: 8px;
          left: 20px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: var(--c-accent);
          line-height: 1;
        }

        .quote-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          font-style: italic;
          line-height: 1.6;
          color: var(--c-bg);
          margin-bottom: 12px;
        }

        .quote-sign {
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--c-accent);
          display: block;
        }
      }
    }

    .concierge-banner {
      padding: 56px 0;
      background: var(--c-text);
      color: #FFFFFF;
    }

    .cb-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;

      @media (max-width: 900px) {
        flex-direction: column;
        text-align: center;
      }
    }

    .cb-text {
      .cb-tag {
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--c-accent);
        display: block;
        margin-bottom: 8px;
      }

      h3 {
        color: #FFFFFF;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
        margin-bottom: 8px;
      }

      p {
        color: color-mix(in srgb, var(--c-bg) 80%, transparent);
        font-size: 0.95rem;
        max-width: 540px;
        margin: 0;
      }
    }

    .archival-section {
      padding: 72px 0 80px;
    }

    .archival-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
    }

    .archival-tile {
      display: block;
      background: var(--c-surface);
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      text-decoration: none;

      .tile-img-wrap {
        aspect-ratio: 1;
        overflow: hidden;
        background: var(--c-bg);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
      }

      .tile-meta {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tile-ref {
        font-size: 0.65rem;
        letter-spacing: 0.12em;
        color: var(--c-muted);
        font-family: monospace;
      }

      .tile-name {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.05rem;
        color: var(--c-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tile-price {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1rem;
        font-weight: 600;
        color: var(--c-primary);
        margin-top: 4px;
      }

      &:hover {
        transform: translateY(-4px);
        border-color: color-mix(in srgb, var(--c-accent) 60%, var(--border));
        box-shadow: 0 12px 28px rgba(44, 58, 26, 0.08);
        .tile-img-wrap img { transform: scale(1.05); }
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
