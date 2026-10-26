import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    @for (i of items; track i) {
      <div class="skeleton-card card">
        <div class="skeleton img-skel"></div>
        <div class="body">
          <div class="skeleton line short"></div>
          <div class="skeleton line medium"></div>
          <div class="footer-skel">
            <div class="skeleton line price"></div>
            <div class="skeleton btn-skel"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .skeleton-card {
      background: var(--c-surface);
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .img-skel {
      aspect-ratio: 3/4;
      width: 100%;
      border-radius: 0;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--c-bg) 90%, #000 4%) 25%,
        var(--c-bg) 50%,
        color-mix(in srgb, var(--c-bg) 90%, #000 4%) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .body {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 10px;
    }

    .line {
      height: 12px;
      border-radius: 4px;
      &.short { width: 35%; height: 10px; }
      &.medium { width: 80%; height: 16px; }
      &.price { width: 30%; height: 22px; }
    }

    .footer-skel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
    }

    .btn-skel {
      width: 76px;
      height: 34px;
      border-radius: 4px;
    }
  `]
})
export class ProductCardSkeletonComponent {
  @Input() count = 6;
  get items() { return Array(this.count).fill(0); }
}
