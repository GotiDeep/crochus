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
            <h1>Made by Hand,<br><em>Carried with Heart</em></h1>
            <p>Crochus began as a small passion project — a belief that beautiful, useful things don't need factories to exist.</p>
          </div>
          <div class="hero-img">
            <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1400&q=80" alt="Artisan at work" loading="eager" fetchpriority="high" />
            <div class="hero-img-overlay"></div>
          </div>
        </section>

        <!-- Alternating Section 1: How it began -->
        <section class="section">
          <div class="container">
            <div class="story-grid story-row-1" appScrollReveal>
              <div class="story-text">
                <span class="section-label">How it began</span>
                <h2>A love for the handmade</h2>
                <p>Crochus was born in a small studio apartment, surrounded by yarn, clay, and the smell of soy wax. Our founder, a lifelong maker, started gifting handmade pieces to friends — and when those friends started asking "where can I buy more?", Crochus was born.</p>
                <p style="margin-top: 16px">Today we work with a small collective of artisans across India who share a philosophy: that objects made slowly, with care, have a different quality. They hold energy. They age beautifully. They mean something.</p>
              </div>
              <div class="story-img">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" alt="Macramé craft" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <!-- Alternating Section 2: The Craft & Process -->
        <section class="section process-section">
          <div class="container">
            <div class="story-grid story-row-2 reverse" appScrollReveal [revealDelay]="100">
              <div class="story-img">
                <img src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&q=80" alt="Handmade crochet stitches" loading="lazy" />
              </div>
              <div class="story-text">
                <span class="section-label">The Process</span>
                <h2>Crafted with Patience</h2>
                <p>Every single stitch in our collection is woven with meticulous attention. We choose 100% organic cotton yarn and natural dyes, ensuring each creation is gentle on both your home and the Earth.</p>
                <p style="margin-top: 16px">From the initial conceptual sketch to the final hand-tied tag, each product passes through dedicated artisan hands who take genuine pride in their craft.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Values: 3 Trust-Point Cards -->
        <section class="section values-section">
          <div class="container">
            <div style="text-align: center; margin-bottom: 56px">
              <span class="section-label">What drives us</span>
              <h2 class="section-title">Our Values</h2>
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
    { icon: '🤲', title: 'Handmade Always', desc: 'Nothing is mass-produced. Every piece is made by human hands, with human care, one at a time.' },
    { icon: '🌿', title: 'Sustainably Made', desc: 'We use natural materials — cotton, jute, clay, beeswax — and avoid synthetic materials wherever possible.' },
    { icon: '💚', title: 'Artisan Fair Pay', desc: 'We believe makers deserve fair compensation for their skill and time. We pay above-market wages, always.' },
  ];
}
