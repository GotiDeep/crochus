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
        <!-- Trust Strip -->
        <div class="footer-trust-strip">
          <div class="fts-item">
            <span class="fts-icon">🧶</span>
            <div>
              <strong>100% Hand-Crocheted</strong>
              <p>Crafted stitch by stitch with premium cotton yarns</p>
            </div>
          </div>
          <div class="fts-item">
            <span class="fts-icon">💬</span>
            <div>
              <strong>WhatsApp Custom Orders</strong>
              <p>Personalize colors, bouquet stems, and gift notes</p>
            </div>
          </div>
          <div class="fts-item">
            <span class="fts-icon">📦</span>
            <div>
              <strong>All-India Safe Shipping</strong>
              <p>Secure, plastic-free eco packaging on every piece</p>
            </div>
          </div>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <a routerLink="/" class="logo" aria-label="Crochus Home">
              <img src="assets/logo.svg" alt="Crochus" class="footer-logo-img" />
            </a>
            <p class="brand-bio">
              Handmade with love and intention in Gujarat, India. Every piece is carefully crafted to bring warmth,
              artistry, and everlasting beauty to your home and loved ones.
            </p>
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
            <h5>Collections</h5>
            <ul>
              <li><a routerLink="/shop">All Handmade Pieces</a></li>
              @if (categories().length > 0) {
                @for (cat of categories().slice(0, 4); track cat.id) {
                  <li><a routerLink="/shop" [queryParams]="{category: cat.id}">{{ cat.name }}</a></li>
                }
              } @else {
                <li><a routerLink="/shop">Bouquets & Flowers</a></li>
                <li><a routerLink="/shop">Cozy Wearables</a></li>
                <li><a routerLink="/shop">Bag Charms & Decor</a></li>
              }
            </ul>
          </div>

          <!-- Studio & Story -->
          <div class="footer-col">
            <h5>Studio</h5>
            <ul>
              <li><a routerLink="/about">Our Artisan Story</a></li>
              <li><a routerLink="/contact">Custom Commissions</a></li>
              <li><a routerLink="/wishlist">Saved Wishlist</a></li>
              <li><a [href]="whatsappUrl()" target="_blank" rel="noopener">WhatsApp Concierge</a></li>
            </ul>
          </div>

          <!-- Account & Support -->
          <div class="footer-col">
            <h5>Collector Account</h5>
            <ul>
              <li><a routerLink="/login">Sign In / Register</a></li>
              <li><a routerLink="/profile">Track My Orders</a></li>
              <li><a routerLink="/cart">Shopping Basket</a></li>
              <li><a routerLink="/contact">Help & FAQs</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© {{ year }} Crochus — Handmade with Love. All rights reserved.</p>
          <div class="footer-credits">
            <span>🌿 Handcrafted with cotton & patience</span>
            <span class="sep">·</span>
            <span>Surat, India</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: clamp(40px, 6vw, 64px) 0 28px;
      margin-top: auto;
      width: 100%;
      box-sizing: border-box;
    }

    .footer-trust-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: clamp(16px, 3vw, 32px);
      padding-bottom: clamp(28px, 4vw, 40px);

      @media (max-width: 860px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .fts-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        background: var(--surface-warm);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 18px 20px;

        .fts-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        strong {
          display: block;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }
      }
    }

    .footer-divider {
      height: 1px;
      background: var(--border);
      margin-bottom: clamp(32px, 5vw, 48px);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.6fr repeat(3, 1fr);
      gap: clamp(24px, 4vw, 48px);
      margin-bottom: clamp(32px, 5vw, 48px);

      @media (max-width: 960px) {
        grid-template-columns: 1fr 1fr;
        gap: 32px 24px;
      }

      @media (max-width: 540px) {
        grid-template-columns: 1fr 1fr;
        gap: 28px 16px;
      }
    }

    .footer-brand {
      @media (max-width: 540px) {
        grid-column: 1 / -1;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        margin-bottom: 16px;
        text-decoration: none;
      }

      .footer-logo-img {
        height: var(--logo-height-footer, 44px);
        width: auto;
        max-width: 220px;
        display: block;
        filter: var(--logo-filter, none);

        @media (max-width: 540px) {
          height: 38px;
        }
      }

      .brand-bio {
        font-size: 0.9rem;
        line-height: 1.65;
        margin-bottom: 20px;
        color: var(--text-secondary);
        max-width: 400px;

        @media (max-width: 540px) {
          font-size: 0.85rem;
          line-height: 1.55;
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
      padding: 8px 14px;
      min-height: 38px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-1px);
      }

      &.fb:hover {
        border-color: #1877F2;
        color: #1877F2;
      }

      &.wa:hover {
        border-color: #25D366;
        color: #25D366;
      }
    }

    .footer-col {
      min-width: 0;

      h5 {
        font-size: 0.75rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--text-primary);
        margin-bottom: 16px;
        font-weight: 600;
      }

      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0;
        margin: 0;

        a {
          font-size: 0.88rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
          display: inline-block;

          &:hover {
            color: var(--primary);
          }
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      p {
        font-size: 0.82rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .footer-credits {
        font-size: 0.8rem;
        color: var(--accent);
        display: flex;
        align-items: center;
        gap: 8px;

        .sep {
          opacity: 0.5;
        }
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
    const num = this.settings.whatsappNumber() || '918200502248';
    return `https://wa.me/${num}?text=${encodeURIComponent('Hello Crochus! I am browsing your online catalogue.')}`;
  }
}
