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
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: var(--radius-md);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .img-skel {
      aspect-ratio: 3/4;
      width: 100%;
      border-radius: 0;
    }

    .body {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 12px;
    }

    .line {
      height: 12px;
      border-radius: 6px;
      &.short { width: 35%; height: 10px; }
      &.medium { width: 80%; height: 18px; }
      &.price { width: 45%; height: 22px; }
    }

    .footer-skel {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: auto;
      padding-top: 8px;
    }

    .btn-skel {
      flex: 1;
      height: 42px;
      border-radius: var(--radius-sm);
    }
  `]
})
export class ProductCardSkeletonComponent {
  @Input() count = 6;
  get items() { return Array(this.count).fill(0); }
}
