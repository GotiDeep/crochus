import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page">
      <a routerLink="/" class="nf-logo-link">
        <img src="assets/logo.svg" alt="Crochus" class="nf-logo-img" />
      </a>
      <div class="nf-content">
        <div class="nf-number">404</div>
        <h1>Lost in the Studio</h1>
        <p>The page you're looking for seems to have wandered off. Let's get you back to the handmade goodness.</p>
        <div class="nf-actions">
          <a routerLink="/" class="btn btn-primary">Go Home</a>
          <a routerLink="/shop" class="btn btn-outline">Browse Shop</a>
        </div>
      </div>
      <div class="nf-decor">✦</div>
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
      padding: 40px 24px;
      position: relative;
      text-align: center;
    }

    .nf-logo-link {
      display: inline-block;
      margin-bottom: 32px;
    }

    .nf-logo-img {
      height: 66px;
      width: auto;
      display: block;
      transform: scale(1.18);
      filter: var(--logo-filter, none);
    }

    .nf-content {
      max-width: 500px;
    }

    .nf-number {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(8rem, 20vw, 14rem);
      font-weight: 300;
      color: var(--border);
      line-height: 1;
      margin-bottom: 8px;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 16px;
    }

    p {
      font-size: 1rem;
      max-width: 380px;
      margin: 0 auto 32px;
      line-height: 1.7;
    }

    .nf-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .nf-decor {
      position: absolute;
      bottom: 40px;
      font-size: 1.5rem;
      color: var(--accent);
      opacity: 0.4;
      animation: spin 8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotFoundComponent {}
