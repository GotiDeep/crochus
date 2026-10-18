import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page">
      <a routerLink="/" class="nf-logo-link" aria-label="Crochus Home">
        <img src="assets/logo.svg" alt="Crochus" class="nf-logo-img" />
      </a>

      <div class="nf-content fade-in">
        <div class="nf-number" aria-hidden="true">404</div>
        <span class="section-label">Lost in the Studio</span>
        <h1>Pattern Not Found</h1>
        <p>The stitch or page you were looking for seems to have unraveled. Let's guide you back to our handmade collections.</p>
        <div class="nf-actions">
          <a routerLink="/" class="btn btn-primary btn-lg">Return to Home</a>
          <a routerLink="/shop" class="btn btn-outline btn-lg">Browse Creations</a>
        </div>
      </div>

      <div class="nf-decor" aria-hidden="true">✦</div>
    </div>
  `,
  styles: [`
    .nf-page {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: clamp(32px, 5vw, 64px) 24px;
      position: relative;
      text-align: center;
    }

    .nf-logo-link {
      display: inline-block;
      margin-bottom: 32px;

      .nf-logo-img {
        height: var(--logo-height-notfound, 46px);
        width: auto;
        display: block;
        filter: var(--logo-filter, none);
      }
    }

    .nf-content {
      max-width: 540px;

      .section-label {
        margin-bottom: 6px;
      }
    }

    .nf-number {
      font-family: var(--font-heading);
      font-size: clamp(7rem, 18vw, 12rem);
      font-weight: 400;
      color: rgba(74, 92, 47, 0.18);
      line-height: 0.9;
      margin-bottom: 4px;
      user-select: none;
    }

    h1 {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      margin: 8px 0 16px;
      color: var(--text-primary);
    }

    p {
      font-size: 1.05rem;
      max-width: 440px;
      margin: 0 auto 32px;
      line-height: 1.65;
      color: var(--text-secondary);
    }

    .nf-actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .nf-decor {
      position: absolute;
      bottom: 40px;
      font-size: 1.5rem;
      color: var(--accent);
      opacity: 0.5;
      animation: spin 12s linear infinite;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotFoundComponent {}
