import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="logo">
              <img src="assets/logo.svg" alt="Crochus" class="footer-logo-img" />
            </div>
            <p>Handmade with love and intention. Every piece tells a story — made by artisans, for those who value craft.</p>
            <div class="social-links">
              <a [href]="instagramUrl()" target="_blank" rel="noopener" class="social-btn">
                📸 Instagram
              </a>
              <a [href]="whatsappUrl()" target="_blank" rel="noopener" class="social-btn wa">
                💬 WhatsApp
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h5>Explore</h5>
            <ul>
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/shop">Shop All</a></li>
              <li><a routerLink="/about">Our Story</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <!-- Account -->
          <div class="footer-col">
            <h5>Account</h5>
            <ul>
              <li><a routerLink="/login">Sign In</a></li>
              <li><a routerLink="/register">Register</a></li>
              <li><a routerLink="/profile">My Orders</a></li>
              <li><a routerLink="/cart">Cart</a></li>
            </ul>
          </div>

          <!-- Categories -->
          <div class="footer-col">
            <h5>Categories</h5>
            <ul>
              <li><a routerLink="/shop" [queryParams]="{category: 1}">Jewellery</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 2}">Home Décor</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 3}">Bags & Totes</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 6}">Candles</a></li>
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
      padding: 64px 0 32px;
      margin-top: auto;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr repeat(3, 1fr);
      gap: 48px;
      margin-bottom: 48px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      @media (max-width: 560px) {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }

    .footer-brand {
      .logo {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }
      .footer-logo-img {
        height: 64px;
        width: auto;
        display: block;
        filter: var(--logo-filter, none);
      }

      p {
        font-size: 0.88rem;
        line-height: 1.7;
        margin-bottom: 20px;
        color: var(--text-secondary);
      }
    }

    .social-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .social-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-primary);
      transition: all 0.2s;

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.wa:hover { border-color: #25D366; color: #25D366; }
    }

    .footer-col {
      h5 {
        font-size: 0.72rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 16px;
        font-weight: 600;
      }

      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 10px;

        a {
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: color 0.2s;
          &:hover { color: var(--primary); }
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
      gap: 8px;

      p {
        font-size: 0.82rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .tagline {
        letter-spacing: 0.1em;
        font-size: 0.75rem;
        color: var(--accent);
      }
    }
  `]
})
export class FooterComponent {
  private settings = inject(SettingsService);
  year = new Date().getFullYear();

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
  }

  whatsappUrl() {
    return `https://wa.me/${this.settings.whatsappNumber()}`;
  }
}
