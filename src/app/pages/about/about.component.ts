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
            <span class="section-label">Our Story</span>
            <h1>Made by Hand,<br><em>Carried with Heart</em></h1>
            <p>Crochus began as a small passion project — a belief that beautiful, useful things don't need factories to exist.</p>
          </div>
          <div class="hero-img">
            <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1400&q=80" alt="Artisan at work" />
            <div class="hero-img-overlay"></div>
          </div>
        </section>

        <!-- Story -->
        <section class="section">
          <div class="container">
            <div class="story-grid">
              <div class="story-text">
                <span class="section-label">How it began</span>
                <h2>A love for the handmade</h2>
                <p>Crochus was born in a small studio apartment, surrounded by yarn, clay, and the smell of soy wax. Our founder, a lifelong maker, started gifting handmade pieces to friends — and when those friends started asking "where can I buy more?", Crochus was born.</p>
                <p style="margin-top: 16px">Today we work with a small collective of artisans across India who share a philosophy: that objects made slowly, with care, have a different quality. They hold energy. They age beautifully. They mean something.</p>
              </div>
              <div class="story-img">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" alt="Macramé" />
              </div>
            </div>
          </div>
        </section>

        <!-- Values -->
        <section class="section values-section">
          <div class="container">
            <div style="text-align: center; margin-bottom: 56px">
              <span class="section-label">What drives us</span>
              <h2 class="section-title">Our Values</h2>
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

      @media (max-width: 900px) { grid-template-columns: 1fr; gap: 40px; }
    }

    .story-text h2 { margin: 12px 0 20px; }

    .story-img {
      img {
        width: 100%;
        aspect-ratio: 4/5;
        object-fit: cover;
        border-radius: 8px;
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
      .value-icon { font-size: 2rem; display: block; margin-bottom: 16px; }
      h4 { font-size: 1rem; font-weight: 600; margin-bottom: 10px; }
      p { font-size: 0.9rem; line-height: 1.7; }
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
