import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../core/services/settings.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <a routerLink="/" class="logo">
              <img src="assets/logo.svg" alt="Crochus" class="footer-logo-img" />
            </a>
            <p>Handmade with love and intention. Every piece tells a story — made by artisans, for those who value craft.</p>
            <div class="social-links">
              @if (instagramUrl()) {
                <a [href]="instagramUrl()" target="_blank" rel="noopener" class="social-btn ig">
                  📸 Instagram
                </a>
              }
              @if (facebookUrl()) {
                <a [href]="facebookUrl()" target="_blank" rel="noopener" class="social-btn fb">
                  🌐 Facebook
                </a>
              }
              @if (whatsappUrl()) {
                <a [href]="whatsappUrl()" target="_blank" rel="noopener" class="social-btn wa">
                  💬 WhatsApp
                </a>
              }
            </div>
          </div>

          <!-- Quick Links (Explore) -->
          <div class="footer-col">
            <h5>Explore</h5>
            <ul>
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/shop">Shop All</a></li>
              <li><a routerLink="/about">Our Story</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <!-- Account Links -->
          <div class="footer-col">
            <h5>Account</h5>
            <ul>
              <li><a routerLink="/login">Sign In</a></li>
              <li><a routerLink="/register">Register</a></li>
              <li><a routerLink="/profile">My Orders</a></li>
              <li><a routerLink="/cart">Cart</a></li>
            </ul>
          </div>

          <!-- Categories Links (Dynamic) -->
          <div class="footer-col">
            <h5>Categories</h5>
            <ul>
              @if (categories().length > 0) {
                @for (cat of categories().slice(0, 4); track cat.id) {
                  <li><a routerLink="/shop" [queryParams]="{category: cat.id}">{{ cat.name }}</a></li>
                }
              } @else {
                <li><a routerLink="/shop">All Collections</a></li>
              }
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© {{ year }} Crochus. All rights reserved. Made with 🌿</p>
          <div class="footer-bottom-right">
            <p class="tagline">Handcrafted · Sustainable · Artisanal</p>
            <button class="footer-top-link" (click)="scrollToTop()">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Back to Top Button -->
      <button
        class="back-to-top-btn"
        [class.visible]="showBackToTop()"
        (click)="scrollToTop()"
        aria-label="Back to top"
        title="Back to top"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 56px 0 28px;
      margin-top: auto;
      width: 100%;
      box-sizing: border-box;
      position: relative;

      @media (max-width: 600px) {
        padding: 40px 0 24px;
      }
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr repeat(3, 1fr);
      gap: 40px;
      margin-bottom: 40px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
        gap: 32px 24px;
      }

      @media (max-width: 520px) {
        grid-template-columns: 1fr; /* Clean stacked on mobile */
        gap: 28px;
      }
    }

    .footer-brand {
      @media (max-width: 520px) {
        grid-column: 1 / -1;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        margin-bottom: 16px;
        text-decoration: none;
        user-select: none;
      }

      .footer-logo-img {
        height: var(--logo-height-footer, 44px);
        width: auto;
        max-width: 220px;
        display: block;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
        filter: var(--logo-filter, none);

        @media (max-width: 520px) {
          height: 38px;
        }
      }

      p {
        font-size: 0.88rem;
        line-height: 1.65;
        margin-bottom: 18px;
        color: var(--text-secondary);
        max-width: 380px;

        @media (max-width: 520px) {
          font-size: 0.84rem;
          line-height: 1.55;
          margin-bottom: 16px;
        }
      }
    }

    .social-links {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .social-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      padding: 8px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      }
      &.ig:hover { border-color: #E1306C; color: #E1306C; }
      &.fb:hover { border-color: #1877F2; color: #1877F2; }
      &.wa:hover { border-color: #25D366; color: #25D366; }
    }

    .footer-col {
      min-width: 0;

      h5 {
        font-size: 0.75rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--text-primary);
        margin-bottom: 14px;
        font-weight: 600;
      }

      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 0;
        margin: 0;

        a {
          font-size: 0.88rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;

          &:hover { color: var(--primary); transform: translateX(3px); }
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .footer-bottom-right {
      display: flex;
      align-items: center;
      gap: 16px;

      @media (max-width: 600px) {
        width: 100%;
        justify-content: space-between;
      }

      .tagline {
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--accent);
        margin: 0;
      }
    }

    .footer-top-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      transition: color 0.2s, transform 0.2s;

      &:hover {
        transform: translateY(-1px);
        text-decoration: underline;
      }
    }

    /* ── Floating Back to Top Button ── */
    .back-to-top-btn {
      position: fixed;
      bottom: 28px;
      right: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--surface);
      border: 1.5px solid var(--border);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateY(12px) scale(0.9);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s, background-color 0.2s ease, border-color 0.2s ease;
      z-index: 99;

      &.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      &:hover {
        background: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 20px rgba(74, 92, 47, 0.25);
      }

      &:active {
        transform: translateY(0) scale(0.96);
      }

      @media (max-width: 600px) {
        bottom: 20px;
        right: 16px;
        width: 44px;
        height: 44px;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  private settings = inject(SettingsService);
  private productService = inject(ProductService);
  year = new Date().getFullYear();
  categories = signal<Category[]>([]);
  showBackToTop = signal(false);

  private onScroll = () => {
    if (typeof window !== 'undefined') {
      this.showBackToTop.set(window.scrollY > 350);
    }
  };

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => this.categories.set([])
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
  }

  facebookUrl() {
    return this.settings.settings().facebook_url || 'https://facebook.com/crochus';
  }

  whatsappUrl() {
    return `https://wa.me/${this.settings.whatsappNumber()}`;
  }
}
