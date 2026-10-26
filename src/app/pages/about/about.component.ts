import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, HamburgerMenuComponent, ScrollRevealDirective],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <!-- Hero -->
        <section class="about-hero">
          <div class="container">
            <span class="section-label">Our Story</span>
            <h1>Every Piece Has<br><em>a Little Story</em></h1>
            <p>At CROCHUS, we love turning simple threads and creative ideas into something special to bring a little more joy to life's everyday moments.</p>
          </div>
          <div class="hero-img">
            <img src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1400&q=80" alt="Handmade Craft Yarns and Tools" loading="eager" fetchpriority="high" />
            <div class="hero-img-overlay"></div>
          </div>
        </section>

        <!-- Alternating Section 1: How it began -->
        <section class="section">
          <div class="container">
            <div class="story-grid story-row-1" appScrollReveal>
              <div class="story-text">
                <span class="section-label">Our Passion</span>
                <h2>Crafted with Patience & Care</h2>
                <p>CROCHUS is all about the warmth of handmade creativity. From colorful crochet bags and cheerful flower bouquets to cute keychains, rakhis, and thoughtful gifts, we enjoy crafting items that put a smile on people's faces.</p>
                <p style="margin-top: 16px">In a world full of mass-produced plastic products, handmade items bring character, softness, and personal meaning. Each loop and stitch is created with honest attention to detail.</p>
              </div>
              <div class="story-img">
                <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&q=80" alt="Handmade Crochet and Crafts" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <!-- Alternating Section 2: The Craft & Process -->
        <section class="section process-section">
          <div class="container">
            <div class="story-grid story-row-2 reverse" appScrollReveal [revealDelay]="100">
              <div class="story-img">
                <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=80" alt="Handmade Flower Bouquets and Gifts" loading="lazy" />
              </div>
              <div class="story-text">
                <span class="section-label">How We Make Our Products</span>
                <h2>From a Simple Thread to Something Special</h2>
                <p>Every bag, bouquet, keychain, and accessory starts with selected yarns, safe fabrics, and creative designs. We take our time shaping each product so it looks lovely and holds up well with use.</p>
                <p style="margin-top: 16px">Whether you are shopping for your own collection or choosing a gift for a loved one, our pieces arrive carefully packed and ready to bring happiness.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Values: 3 Trust-Point Cards -->
        <section class="section values-section">
          <div class="container">
            <div style="text-align: center; margin-bottom: 56px">
              <span class="section-label">What We Stand For</span>
              <h2 class="section-title">Why People Love CROCHUS</h2>
            </div>
            <div class="values-grid">
              @for (val of values; track val.title; let i = $index) {
                <div class="value-card card" appScrollReveal [revealDelay]="i * 120">
                  <span class="value-icon">{{ val.icon }}</span>
                  <h4>{{ val.title }}</h4>
                  <p>{{ val.desc }}</p>
                </div>
              }
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
      min-height: 70vh;
      display: flex;
      align-items: flex-end;
      overflow: hidden;

      .container {
        position: relative;
        z-index: 2;
        padding-bottom: 80px;
        padding-top: 120px;

        h1 {
          color: white;
          margin: 12px 0 20px;
          em { font-style: italic; opacity: 0.85; }
        }

        .section-label { color: rgba(212,201,138,0.9); }
        p { color: rgba(255,255,255,0.8); max-width: 480px; font-size: 1.1rem; }
      }
    }

    .hero-img {
      position: absolute; inset: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .hero-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(15,20,8,0.85) 0%, rgba(15,20,8,0.2) 60%, transparent 100%);
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 36px;

        &.reverse {
          .story-img { order: 2; }
          .story-text { order: 1; }
        }
      }
    }

    .process-section {
      background: color-mix(in srgb, var(--c-surface) 65%, var(--c-bg));
    }

    .story-text h2 { margin: 12px 0 20px; }

    .story-img {
      img {
        width: 100%;
        aspect-ratio: 4/5;
        object-fit: cover;
        border-radius: 14px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.4s ease;
      }
      &:hover img {
        transform: scale(1.02);
      }
    }

    .values-section { background: var(--surface); }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .value-card {
      padding: 32px;
      border-radius: 14px;
      border: 1px solid var(--border);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
      }

      .value-icon {
        font-size: 2.2rem;
        display: block;
        margin-bottom: 16px;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      &:hover .value-icon {
        transform: scale(1.15) rotate(4deg);
      }

      h4 { font-size: 1.05rem; font-weight: 600; margin-bottom: 10px; color: var(--text-primary); }
      p { font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary); }
    }
  `]
})
export class AboutComponent {
  menuOpen = signal(false);

  values = [
    { icon: '🧶', title: 'Made by Hand', desc: 'Each creation is made with care and attention to detail, using quality yarn and fabrics.' },
    { icon: '✿', title: 'Made to Be Special', desc: 'Find something different from everyday, mass-produced items — unique pieces with character.' },
    { icon: '✦', title: 'Made for Every Moment', desc: 'From birthdays and festivals to everyday surprises, find something worth gifting or keeping.' },
  ];
}
