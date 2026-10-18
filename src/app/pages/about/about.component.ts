import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Hero -->
        <section class="about-hero">
          <div class="container">
            <span class="section-label">Our Story & Heritage</span>
            <h1>Made by Hand,<br><em>Carried with Heart</em></h1>
            <p>Crochus began as an intimate passion project — a heartfelt conviction that beautiful, mindful things don't need factories to exist.</p>
          </div>
          <div class="hero-img">
            <img
              src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1400&auto=format&fit=crop&q=80"
              alt="Artisan hands crocheting with care"
              fetchpriority="high"
              width="1400"
              height="800"
            />
            <div class="hero-img-overlay"></div>
          </div>
        </section>

        <!-- Story Section -->
        <section class="section">
          <div class="container">
            <div class="story-grid">
              <div class="story-text">
                <span class="section-label">How It Began</span>
                <h2>A Devotion to the Handcrafted</h2>
                <p>Crochus was born in a sunlit studio, surrounded by skeins of organic yarn, clay palettes, and the gentle fragrance of natural soy wax. What began as gifting lovingly crocheted pieces to friends turned into a community asking for more.</p>
                <p style="margin-top: 16px">Today we collaborate with skilled home-makers and artisans across India who share a singular belief: objects shaped slowly with patience carry a warmth that machinery can never replicate. They carry memories, they hold intention, and they are made to be cherished for generations.</p>
                
                <div class="story-stats-grid">
                  <div class="stat-box">
                    <span class="stat-number">200+</span>
                    <span class="stat-desc">Pieces Handcrafted</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-number">100%</span>
                    <span class="stat-desc">Plastic-Free Wrapping</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-number">4.9★</span>
                    <span class="stat-desc">Customer Love</span>
                  </div>
                </div>
              </div>

              <div class="story-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop&q=80"
                  alt="Intricate macrame and crochet textures"
                  loading="lazy"
                  width="600"
                  height="750"
                  class="story-photo card"
                />
                <div class="story-card-quote card">
                  <p>“To create by hand is to leave a piece of your soul woven into every thread.”</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Values Section -->
        <section class="section values-section">
          <div class="container">
            <div class="section-header" style="text-align: center; margin-bottom: 56px">
              <span class="section-label">What Guides Every Loop</span>
              <h2 class="section-title">Our Guiding Values</h2>
              <p style="max-width: 520px; margin: 0 auto;">Everything we craft is anchored in sustainability, honest craft, and human care.</p>
            </div>

            <div class="values-grid">
              @for (val of values; track val.title) {
                <div class="value-card card">
                  <span class="value-icon">{{ val.icon }}</span>
                  <h4>{{ val.title }}</h4>
                  <p>{{ val.desc }}</p>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- CTA Strip -->
        <section class="about-cta-section">
          <div class="container text-center">
            <h2>Ready to Bring Warmth Into Your Home?</h2>
            <p>Explore our latest handcrafted collection or request a bespoke custom design tailored to your space.</p>
            <div class="cta-actions">
              <a routerLink="/shop" class="btn btn-primary btn-lg">Browse Collection →</a>
              <a routerLink="/contact" class="btn btn-outline btn-lg">Request Custom Order</a>
            </div>
          </div>
        </section>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .about-hero {
      position: relative;
      min-height: 72vh;
      display: flex;
      align-items: flex-end;
      overflow: hidden;

      .container {
        position: relative;
        z-index: 2;
        padding-bottom: 80px;
        padding-top: 140px;

        h1 {
          color: #FFFFFF;
          margin: 12px 0 20px;
          em { font-style: italic; color: #F7EDE8; }
        }

        .section-label { color: #F7EDE8; }
        p { color: rgba(255, 255, 255, 0.92); max-width: 500px; font-size: 1.15rem; line-height: 1.7; }
      }
    }

    .hero-img {
      position: absolute; inset: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .hero-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(36, 30, 28, 0.88) 0%, rgba(36, 30, 28, 0.4) 60%, transparent 100%);
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 72px;
      align-items: center;

      @media (max-width: 900px) { grid-template-columns: 1fr; gap: 40px; }
    }

    .story-text {
      h2 {
        margin: 12px 0 20px;
        font-size: clamp(2rem, 3.8vw, 2.8rem);
      }
      p { font-size: 1.02rem; line-height: 1.8; color: var(--text-secondary); }
    }

    .story-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 36px;
      padding-top: 28px;
      border-top: 1px solid var(--border);

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .stat-box {
        .stat-number {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1.1;
        }
        .stat-desc {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }

    .story-img-wrapper {
      position: relative;

      .story-photo {
        width: 100%;
        aspect-ratio: 4/5;
        object-fit: cover;
        border-radius: var(--radius-lg);
      }

      .story-card-quote {
        position: absolute;
        bottom: -20px;
        left: -20px;
        background: var(--surface);
        padding: 20px 24px;
        border-radius: var(--radius-md);
        max-width: 320px;
        box-shadow: var(--shadow-hover);

        p {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.96rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 600px) {
          position: static;
          margin-top: 16px;
          max-width: 100%;
        }
      }
    }

    .values-section {
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;

      @media (max-width: 840px) { grid-template-columns: 1fr; }
    }

    .value-card {
      padding: 36px 30px;
      border-radius: var(--radius-md);
      transition: all 0.25s ease;

      .value-icon { font-size: 2.2rem; display: block; margin-bottom: 16px; }
      h4 { font-size: 1.15rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary); }
      p { font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); }
    }

    .about-cta-section {
      padding: 90px 0;
      background: var(--bg-warm);
      text-align: center;

      h2 {
        font-size: clamp(2rem, 3.5vw, 2.7rem);
        margin-bottom: 14px;
      }

      p {
        max-width: 540px;
        margin: 0 auto 32px;
        font-size: 1.05rem;
      }

      .cta-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
      }
    }
  `]
})
export class AboutComponent {
  menuOpen = signal(false);

  values = [
    { icon: '🤲', title: '100% Handmade Always', desc: 'No factory machines. Every piece is crafted loop-by-loop with patience and intention by passionate artisan hands.' },
    { icon: '🌿', title: 'Sustainable & Earth-Minded', desc: 'We source natural cotton, pure jute, and organic clay, while shipping in 100% plastic-free recyclable packaging.' },
    { icon: '💚', title: 'Fair Compensation', desc: 'We directly support local women and master artisans, paying ethical above-market rates for their time and artistic mastery.' },
  ];
}
