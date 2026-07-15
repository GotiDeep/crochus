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

        <!-- Artisans -->
        <section class="section artisan-section">
          <div class="container">
            <span class="section-label">The people behind it</span>
            <h2 class="section-title">Our Artisans</h2>
            <p style="max-width:520px; margin-bottom:48px">Every piece in our catalogue is made by a real person, with a real skill honed over years. We pay fair wages and work only with artisans who find joy in their craft.</p>
            <div class="artisan-grid">
              @for (a of artisans; track a.name) {
                <div class="artisan-card">
                  <div class="artisan-img">
                    <img [src]="a.photo" [alt]="a.name" />
                  </div>
                  <div class="artisan-info">
                    <h4>{{ a.name }}</h4>
                    <span class="artisan-craft">{{ a.craft }}</span>
                    <p>{{ a.bio }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="cta-section">
          <div class="container">
            <div class="cta-inner">
              <h2>Ready to find your<br><em>handmade treasure?</em></h2>
              <p>Every piece is waiting to find its home. Browse our collection and discover something made just for you.</p>
              <a routerLink="/shop" class="btn btn-primary btn-lg">Shop the Collection</a>
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

    .artisan-grid {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .artisan-card {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 32px;
      align-items: start;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .artisan-img {
      img {
        width: 180px; height: 220px;
        object-fit: cover;
        border-radius: 8px;

        @media (max-width: 600px) { width: 100%; height: 240px; }
      }
    }

    .artisan-info {
      h4 { font-size: 1.2rem; margin-bottom: 4px; }
      .artisan-craft {
        display: inline-block;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 12px;
      }
      p { font-size: 0.92rem; line-height: 1.7; }
    }

    .cta-section {
      background: var(--primary);
      padding: 80px 0;

      .cta-inner {
        text-align: center;
        h2 { color: white; margin-bottom: 16px; em { font-style: italic; opacity: 0.85; } }
        p { color: rgba(255,255,255,0.75); max-width: 480px; margin: 0 auto 32px; }
      }
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

  artisans = [
    {
      name: 'Meena Kumari',
      craft: 'Macramé & Weaving',
      photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      bio: 'Meena has been weaving since she was eight years old, learning from her grandmother in Rajasthan. Her macramé pieces take anywhere from two days to two weeks to complete — each knot tied with patience and intention.'
    },
    {
      name: 'Ravi Sharma',
      craft: 'Pottery & Ceramics',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Ravi studied ceramics at the College of Arts in Ahmedabad before returning to his village to set up a small studio. He is drawn to wabi-sabi aesthetics — finding beauty in the imperfect, incomplete, and impermanent.'
    },
  ];
}
