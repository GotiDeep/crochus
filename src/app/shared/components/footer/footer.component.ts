import { Component, inject, signal, OnInit } from '@angular/core';
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
                <a [href]="instagramUrl()" target="_blank" rel="noopener" class="social-btn">
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
          <p class="tagline">Handcrafted · Sustainable · Artisanal</p>
        </div>
      </div>
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
        grid-template-columns: 1fr 1fr; /* Clean 2-column grid on mobile */
        gap: 28px 16px;
      }
    }

    .footer-brand {
      @media (max-width: 520px) {
        grid-column: 1 / -1; /* Brand spans full width on top */
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
      padding: 7px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); box-shadow: var(--shadow-card); }
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

          &:hover { color: var(--primary); transform: translateX(2px); }
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
        gap: 6px;
      }

      p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .tagline {
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--accent);
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  private settings = inject(SettingsService);
  private productService = inject(ProductService);
  year = new Date().getFullYear();
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => this.categories.set([])
    });
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
